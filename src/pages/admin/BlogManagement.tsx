
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  PlusCircle, 
  Edit, 
  Trash2, 
  AlertCircle,
  Eye,
  EyeOff 
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/components/AuthProvider";
import { supabase } from "@/integrations/supabase/client";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";

interface BlogPost {
  id: string;
  title: string;
  created_at: string;
  updated_at: string;
  is_published: boolean;
  user_id: string;
  author_name?: string;
}

const BlogManagement = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch blog posts
  useEffect(() => {
    const fetchBlogPosts = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('posts')
          .select('id, title, created_at, updated_at, is_published, user_id, profiles(full_name)')
          .order('created_at', { ascending: false });

        if (error) {
          throw error;
        }

        // Transform data to include author name
        const formattedData = data.map(post => ({
          ...post,
          author_name: post.profiles?.full_name || 'Unknown Author'
        }));

        setBlogPosts(formattedData);
      } catch (error) {
        console.error('Error fetching blog posts:', error);
        toast({
          title: "Error",
          description: "Failed to load blog posts",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchBlogPosts();
  }, [toast]);

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this blog post?")) {
      return;
    }

    try {
      const { error } = await supabase
        .from('posts')
        .delete()
        .eq('id', id);

      if (error) {
        throw error;
      }

      setBlogPosts(blogPosts.filter(post => post.id !== id));
      
      toast({
        title: "Success",
        description: "Blog post deleted successfully",
      });
    } catch (error) {
      console.error('Error deleting blog post:', error);
      toast({
        title: "Error",
        description: "Failed to delete blog post",
        variant: "destructive",
      });
    }
  };

  const togglePublishStatus = async (id: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('posts')
        .update({ is_published: !currentStatus })
        .eq('id', id);

      if (error) {
        throw error;
      }

      setBlogPosts(
        blogPosts.map(post => 
          post.id === id ? { ...post, is_published: !currentStatus } : post
        )
      );
      
      toast({
        title: "Success",
        description: `Blog post ${!currentStatus ? 'published' : 'unpublished'} successfully`,
      });
    } catch (error) {
      console.error('Error updating blog post status:', error);
      toast({
        title: "Error",
        description: "Failed to update blog post status",
        variant: "destructive",
      });
    }
  };

  const formattedDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <DashboardLayout userType="admin">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Blog Management</h1>
          <Button 
            onClick={() => navigate('/admin/blog/create')}
            className="flex items-center gap-2"
          >
            <PlusCircle className="h-4 w-4" />
            <span>New Blog Post</span>
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Blog Posts</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center items-center h-40">
                <p>Loading blog posts...</p>
              </div>
            ) : blogPosts.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-40 text-center">
                <AlertCircle className="h-10 w-10 text-muted-foreground mb-2" />
                <p className="text-muted-foreground">No blog posts found</p>
                <Button 
                  variant="link" 
                  onClick={() => navigate('/admin/blog/create')}
                  className="mt-2"
                >
                  Create your first blog post
                </Button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Title</TableHead>
                      <TableHead>Author</TableHead>
                      <TableHead>Published</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead>Updated</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {blogPosts.map((post) => (
                      <TableRow key={post.id}>
                        <TableCell className="font-medium">{post.title}</TableCell>
                        <TableCell>{post.author_name}</TableCell>
                        <TableCell>
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            post.is_published 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-amber-100 text-amber-800'
                          }`}>
                            {post.is_published ? 'Published' : 'Draft'}
                          </span>
                        </TableCell>
                        <TableCell>{formattedDate(post.created_at)}</TableCell>
                        <TableCell>{formattedDate(post.updated_at)}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() => togglePublishStatus(post.id, post.is_published)}
                              title={post.is_published ? 'Unpublish' : 'Publish'}
                            >
                              {post.is_published ? (
                                <EyeOff className="h-4 w-4" />
                              ) : (
                                <Eye className="h-4 w-4" />
                              )}
                            </Button>
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() => navigate(`/admin/blog/edit/${post.id}`)}
                              title="Edit"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() => handleDelete(post.id)}
                              title="Delete"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default BlogManagement;
