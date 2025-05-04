import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/components/AuthProvider';
import { supabase } from '@/integrations/supabase/client';
import { AlertCircle, CheckCircle, Save, ArrowLeft, Image, Loader2 } from 'lucide-react';

interface BlogPost {
  id: string;
  title: string;
  content: string;
  created_at: string;
  updated_at: string;
  user_id: string;
  is_published: boolean;
}

const BlogEditor = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isPublished, setIsPublished] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isEditMode, setIsEditMode] = useState(!!id);

  useEffect(() => {
    const fetchPost = async () => {
      if (!id) return;
      
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('posts')
          .select('*')
          .eq('id', id)
          .single();
        
        if (error) {
          throw error;
        }
        
        if (data) {
          setTitle(data.title);
          setContent(data.content);
          setIsPublished(data.is_published);
        }
      } catch (err) {
        console.error('Error fetching post:', err);
        setError('Failed to load blog post.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchPost();
  }, [id]);
  
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
        user_id: user.id,
        is_published: publish ? true : isPublished,
      };
      
      let result;
      
      if (isEditMode) {
        result = await supabase
          .from('posts')
          .update(postData)
          .eq('id', id);
      } else {
        result = await supabase
          .from('posts')
          .insert(postData)
          .select();
      }
      
      if (result.error) {
        throw result.error;
      }
      
      toast({
        title: "Success",
        description: isEditMode ? 
          "Blog post updated successfully" : 
          "Blog post created successfully",
      });
      
      // Navigate back to blog management
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
        
        <Card>
          <CardHeader>
            <CardTitle>Blog Post Details</CardTitle>
            <CardDescription>Enter the details of your blog post</CardDescription>
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
    </DashboardLayout>
  );
};

export default BlogEditor;
