
import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/components/AuthProvider";
import { supabase } from "@/integrations/supabase/client";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";

const formSchema = z.object({
  title: z.string().min(5, { message: "Title must be at least 5 characters" }),
  content: z.string().min(10, { message: "Content must be at least 10 characters" }),
  is_published: z.boolean().default(false),
});

type FormValues = z.infer<typeof formSchema>;

const BlogEditor = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(!!id);
  const isEditing = !!id;

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      content: "",
      is_published: false,
    },
  });

  // Fetch blog post if editing
  useEffect(() => {
    const fetchBlogPost = async () => {
      if (!id) return;

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
          form.reset({
            title: data.title,
            content: data.content,
            is_published: data.is_published || false,
          });
        }
      } catch (error) {
        console.error('Error fetching blog post:', error);
        toast({
          title: "Error",
          description: "Failed to load blog post",
          variant: "destructive",
        });
        navigate('/admin/blog');
      } finally {
        setInitialLoading(false);
      }
    };

    if (isEditing) {
      fetchBlogPost();
    }
  }, [id, form, toast, navigate, isEditing]);

  const onSubmit = async (values: FormValues) => {
    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to create a blog post",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      if (isEditing) {
        // Update existing post
        const { error } = await supabase
          .from('posts')
          .update({
            title: values.title,
            content: values.content,
            is_published: values.is_published,
            updated_at: new Date().toISOString(),
          })
          .eq('id', id);

        if (error) throw error;

        toast({
          title: "Success",
          description: "Blog post updated successfully",
        });
      } else {
        // Create new post
        const { error } = await supabase
          .from('posts')
          .insert({
            title: values.title,
            content: values.content,
            is_published: values.is_published,
            user_id: user.id,
          });

        if (error) throw error;

        toast({
          title: "Success",
          description: "Blog post created successfully",
        });
      }

      // Navigate back to blog management
      navigate('/admin/blog');
    } catch (error) {
      console.error('Error saving blog post:', error);
      toast({
        title: "Error",
        description: `Failed to ${isEditing ? 'update' : 'create'} blog post`,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return (
      <DashboardLayout userType="admin">
        <div className="flex justify-center items-center h-[60vh]">
          <p>Loading blog post...</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout userType="admin">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">
            {isEditing ? "Edit Blog Post" : "Create New Blog Post"}
          </h1>
          <Button variant="outline" onClick={() => navigate('/admin/blog')}>
            Back to Blog Posts
          </Button>
        </div>

        <Card>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
              <CardHeader>
                <CardTitle>{isEditing ? "Edit Post" : "New Post"}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Title</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter post title" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="content"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Content</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Write your post content here..." 
                          className="min-h-[300px]" 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="is_published"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">
                          Publish
                        </FormLabel>
                        <FormDescription>
                          Toggle to publish this post to the blog
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate('/admin/blog')}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading ? "Saving..." : isEditing ? "Update Post" : "Create Post"}
                </Button>
              </CardFooter>
            </form>
          </Form>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default BlogEditor;
