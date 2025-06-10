
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/components/AuthProvider';
import { supabase } from '@/integrations/supabase/client';
import { AlertCircle, CheckCircle, Save, ArrowLeft, Loader2, X } from 'lucide-react';

interface BlogPost {
  id: string;
  title: string;
  content: string;
  slug: string | null;
  excerpt: string | null;
  meta_title: string | null;
  meta_description: string | null;
  created_at: string;
  updated_at: string;
  user_id: string;
  is_published: boolean;
}

interface Category {
  id: string;
  name: string;
  color: string;
}

interface Tag {
  id: string;
  name: string;
}

const BlogEditor = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [metaTitle, setMetaTitle] = useState('');
  const [metaDescription, setMetaDescription] = useState('');
  const [isPublished, setIsPublished] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isEditMode, setIsEditMode] = useState(!!id);
  
  // Categories and Tags
  const [categories, setCategories] = useState<Category[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  useEffect(() => {
    fetchCategoriesAndTags();
    if (id) {
      fetchPost();
    }
  }, [id]);

  const fetchCategoriesAndTags = async () => {
    try {
      const [categoriesResult, tagsResult] = await Promise.all([
        supabase.from('blog_categories').select('id, name, color').order('name'),
        supabase.from('blog_tags').select('id, name').order('name')
      ]);

      if (categoriesResult.error) throw categoriesResult.error;
      if (tagsResult.error) throw tagsResult.error;

      setCategories(categoriesResult.data || []);
      setTags(tagsResult.data || []);
    } catch (err) {
      console.error('Error fetching categories and tags:', err);
    }
  };

  const fetchPost = async () => {
    if (!id) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('posts')
        .select(`
          *,
          post_categories(category_id),
          post_tags(tag_id)
        `)
        .eq('id', id)
        .single();
      
      if (error) {
        throw error;
      }
      
      if (data) {
        setTitle(data.title);
        setContent(data.content);
        setExcerpt(data.excerpt || '');
        setMetaTitle(data.meta_title || '');
        setMetaDescription(data.meta_description || '');
        setIsPublished(data.is_published);
        
        // Set selected category and tags
        if (data.post_categories && data.post_categories.length > 0) {
          setSelectedCategory(data.post_categories[0].category_id);
        }
        if (data.post_tags) {
          setSelectedTags(data.post_tags.map((pt: any) => pt.tag_id));
        }
      }
    } catch (err) {
      console.error('Error fetching post:', err);
      setError('Failed to load blog post.');
    } finally {
      setLoading(false);
    }
  };
  
  const handleSave = async (publish = false) => {
    if (!title.trim()) {
      toast({
        title: "Missing title",
        description: "Please provide a title for your blog post",
        variant: "destructive",
      });
      return;
    }
    
    if (!content.trim()) {
      toast({
        title: "Missing content",
        description: "Please provide content for your blog post",
        variant: "destructive",
      });
      return;
    }
    
    if (!user) {
      toast({
        title: "Authentication required",
        description: "You must be signed in to create or edit blog posts",
        variant: "destructive",
      });
      return;
    }
    
    setIsSaving(true);
    
    try {
      const postData = {
        title,
        content,
        excerpt: excerpt || null,
        meta_title: metaTitle || null,
        meta_description: metaDescription || null,
        user_id: user.id,
        is_published: publish ? true : isPublished,
      };
      
      let postId = id;
      
      if (isEditMode && id) {
        const { error } = await supabase
          .from('posts')
          .update(postData)
          .eq('id', id);
        
        if (error) throw error;
      } else {
        const { data, error } = await supabase
          .from('posts')
          .insert(postData)
          .select()
          .single();
        
        if (error) throw error;
        postId = data.id;
      }

      // Handle category assignment
      if (selectedCategory && postId) {
        // Remove existing categories
        await supabase
          .from('post_categories')
          .delete()
          .eq('post_id', postId);
        
        // Add new category
        await supabase
          .from('post_categories')
          .insert({
            post_id: postId,
            category_id: selectedCategory
          });
      }

      // Handle tags assignment
      if (postId) {
        // Remove existing tags
        await supabase
          .from('post_tags')
          .delete()
          .eq('post_id', postId);
        
        // Add new tags
        if (selectedTags.length > 0) {
          const tagInserts = selectedTags.map(tagId => ({
            post_id: postId,
            tag_id: tagId
          }));
          
          await supabase
            .from('post_tags')
            .insert(tagInserts);
        }
      }
      
      toast({
        title: "Success",
        description: isEditMode ? 
          "Blog post updated successfully" : 
          "Blog post created successfully",
      });
      
      navigate('/admin/blog');
    } catch (err) {
      console.error('Error saving post:', err);
      toast({
        title: "Error",
        description: `Failed to save blog post: ${err.message}`,
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const removeTag = (tagId: string) => {
    setSelectedTags(prev => prev.filter(id => id !== tagId));
  };

  const addTag = (tagId: string) => {
    if (!selectedTags.includes(tagId)) {
      setSelectedTags(prev => [...prev, tagId]);
    }
  };
  
  if (loading) {
    return (
      <DashboardLayout userType="admin">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          <span className="ml-2">Loading blog post...</span>
        </div>
      </DashboardLayout>
    );
  }
  
  if (error) {
    return (
      <DashboardLayout userType="admin">
        <div className="flex flex-col items-center justify-center h-64">
          <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
          <p className="text-red-500 text-lg">{error}</p>
          <Button 
            variant="outline" 
            onClick={() => navigate('/admin/blog')}
            className="mt-4"
          >
            Return to Blog Management
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout userType="admin">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <Button 
              variant="ghost" 
              size="icon" 
              className="mr-2"
              onClick={() => navigate('/admin/blog')}
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <h1 className="text-2xl font-bold">
              {isEditMode ? 'Edit Blog Post' : 'Create New Blog Post'}
            </h1>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <Switch
                id="publish"
                checked={isPublished}
                onCheckedChange={setIsPublished}
              />
              <Label htmlFor="publish" className="text-sm cursor-pointer">
                {isPublished ? 'Published' : 'Draft'}
              </Label>
            </div>
            
            <Button 
              variant="outline"
              onClick={() => handleSave(false)}
              disabled={isSaving}
            >
              {isSaving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
              Save
            </Button>
            
            <Button 
              onClick={() => handleSave(true)}
              disabled={isSaving}
            >
              {isSaving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <CheckCircle className="h-4 w-4 mr-2" />}
              {isPublished ? 'Update' : 'Publish'}
            </Button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Content</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Enter a compelling title"
                    className="text-lg"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="excerpt">Excerpt</Label>
                  <Textarea
                    id="excerpt"
                    value={excerpt}
                    onChange={(e) => setExcerpt(e.target.value)}
                    placeholder="Brief summary of the post (optional)"
                    rows={3}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="content">Content</Label>
                  <Textarea
                    id="content"
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="Write your blog post content here..."
                    className="min-h-[300px]"
                  />
                  <p className="text-xs text-muted-foreground">
                    Supports basic markdown for formatting.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Category & Tags</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Category</Label>
                  <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          <div className="flex items-center gap-2">
                            <div 
                              className="w-3 h-3 rounded-full" 
                              style={{ backgroundColor: category.color }}
                            />
                            {category.name}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Tags</Label>
                  <Select onValueChange={addTag}>
                    <SelectTrigger>
                      <SelectValue placeholder="Add tags" />
                    </SelectTrigger>
                    <SelectContent>
                      {tags.filter(tag => !selectedTags.includes(tag.id)).map((tag) => (
                        <SelectItem key={tag.id} value={tag.id}>
                          {tag.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  
                  {selectedTags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {selectedTags.map(tagId => {
                        const tag = tags.find(t => t.id === tagId);
                        return tag ? (
                          <Badge key={tagId} variant="secondary">
                            {tag.name}
                            <button
                              onClick={() => removeTag(tagId)}
                              className="ml-1 hover:bg-red-500 hover:text-white rounded-full p-0.5"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </Badge>
                        ) : null;
                      })}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>SEO Settings</CardTitle>
                <CardDescription>Optimize for search engines</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="metaTitle">Meta Title</Label>
                  <Input
                    id="metaTitle"
                    value={metaTitle}
                    onChange={(e) => setMetaTitle(e.target.value)}
                    placeholder="SEO title (optional)"
                  />
                  <p className="text-xs text-muted-foreground">
                    {metaTitle.length}/60 characters
                  </p>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="metaDescription">Meta Description</Label>
                  <Textarea
                    id="metaDescription"
                    value={metaDescription}
                    onChange={(e) => setMetaDescription(e.target.value)}
                    placeholder="SEO description (optional)"
                    rows={3}
                  />
                  <p className="text-xs text-muted-foreground">
                    {metaDescription.length}/160 characters
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default BlogEditor;
