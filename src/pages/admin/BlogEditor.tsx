
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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertCircle, FileImage, Image } from "lucide-react";

const formSchema = z.object({
  title: z.string().min(5, { message: "Title must be at least 5 characters" }),
  content: z.string().min(10, { message: "Content must be at least 10 characters" }),
  is_published: z.boolean().default(false),
  featured_image: z.string().optional(),
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
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      content: "",
      is_published: false,
      featured_image: "",
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
            featured_image: data.featured_image || "",
          });
          
          if (data.featured_image) {
            setImageUrl(data.featured_image);
          }
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
    } else {
      setInitialLoading(false);
    }
  }, [id, form, toast, navigate, isEditing]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setUploadError("File is too large (max 5MB)");
      return;
    }

    // Check file type
    if (!['image/jpeg', 'image/png', 'image/webp', 'image/gif'].includes(file.type)) {
      setUploadError("File type not supported. Please upload an image (JPEG, PNG, WEBP, or GIF)");
      return;
    }

    setUploadLoading(true);
    setUploadError(null);

    try {
      // Create a unique file name
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `blog/${fileName}`;

      // Upload file to Supabase Storage
      const { data, error } = await supabase.storage
        .from('blog_images')
        .upload(filePath, file);

      if (error) throw error;

      // Get public URL
      const { data: publicUrlData } = supabase.storage
        .from('blog_images')
        .getPublicUrl(filePath);

      const publicUrl = publicUrlData?.publicUrl;
      if (publicUrl) {
        setImageUrl(publicUrl);
        form.setValue('featured_image', publicUrl);
        toast({
          title: "Success",
          description: "Image uploaded successfully",
        });
      }
    } catch (error: any) {
      console.error('Error uploading image:', error);
      setUploadError(error.message || "Failed to upload image");
      toast({
        title: "Error",
        description: "Failed to upload image",
        variant: "destructive",
      });
    } finally {
      setUploadLoading(false);
    }
  };

  const insertImageAtCursor = () => {
    if (!imageUrl) return;
    
    const contentField = form.getValues('content');
    const imageMarkdown = `![Blog image](${imageUrl})`;
    
    // Get the textarea element
    const textarea = document.getElementById('content') as HTMLTextAreaElement;
    
    if (textarea) {
      const startPos = textarea.selectionStart;
      const endPos = textarea.selectionEnd;
      
      const newContent = 
        contentField.substring(0, startPos) +
        imageMarkdown +
        contentField.substring(endPos);
      
      form.setValue('content', newContent);
      
      // Set cursor position after the inserted image markdown
      setTimeout(() => {
        textarea.focus();
        textarea.setSelectionRange(startPos + imageMarkdown.length, startPos + imageMarkdown.length);
      }, 0);
    } else {
      form.setValue('content', `${contentField}\n\n${imageMarkdown}\n`);
    }
  };

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
            featured_image: values.featured_image || null,
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
            featured_image: values.featured_image || null,
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

  const renderPreviewContent = (content: string) => {
    // Simple markdown-like rendering for images
    return content.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1" class="my-4 rounded max-w-full h-auto" />');
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
                {/* Featured Image Upload */}
                <div className="space-y-2">
                  <FormLabel>Featured Image</FormLabel>
                  <div className="flex items-center space-x-4">
                    <div className="w-32 h-32 border rounded flex items-center justify-center overflow-hidden bg-gray-100">
                      {imageUrl ? (
                        <img 
                          src={imageUrl} 
                          alt="Featured" 
                          className="object-cover w-full h-full" 
                        />
                      ) : (
                        <FileImage className="h-10 w-10 text-gray-400" />
                      )}
                    </div>
                    <div className="flex-1 space-y-2">
                      <Input 
                        type="file" 
                        accept="image/*" 
                        disabled={uploadLoading}
                        onChange={handleImageUpload} 
                      />
                      {uploadError && (
                        <div className="flex items-center text-sm text-red-500">
                          <AlertCircle className="h-4 w-4 mr-1" />
                          {uploadError}
                        </div>
                      )}
                      <p className="text-xs text-muted-foreground">
                        Upload a featured image for your blog post (max 5MB)
                      </p>
                    </div>
                  </div>
                </div>

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

                <div className="flex flex-col space-y-2">
                  <div className="flex justify-between items-center">
                    <FormLabel htmlFor="content">Content</FormLabel>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          type="button"
                          className="flex items-center"
                        >
                          <Image className="h-4 w-4 mr-1" />
                          Insert image
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Insert image</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                          <div className="space-y-2">
                            <p className="text-sm">Upload a new image or use an existing one</p>
                            <Input 
                              type="file" 
                              accept="image/*" 
                              disabled={uploadLoading}
                              onChange={handleImageUpload} 
                            />
                          </div>
                          
                          {uploadError && (
                            <div className="flex items-center text-sm text-red-500">
                              <AlertCircle className="h-4 w-4 mr-1" />
                              {uploadError}
                            </div>
                          )}
                          
                          {imageUrl && (
                            <div className="space-y-2">
                              <p className="text-sm font-medium">Preview:</p>
                              <div className="border rounded p-2">
                                <img 
                                  src={imageUrl} 
                                  alt="Preview" 
                                  className="max-h-40 mx-auto" 
                                />
                              </div>
                              <Button 
                                type="button"
                                onClick={insertImageAtCursor}
                                className="w-full"
                              >
                                Insert at cursor position
                              </Button>
                            </div>
                          )}
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                
                  <FormField
                    control={form.control}
                    name="content"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Textarea 
                            id="content"
                            placeholder="Write your post content here..." 
                            className="min-h-[300px]" 
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="border p-4 rounded-md">
                  <h3 className="font-medium mb-2">Content Preview</h3>
                  <div 
                    className="prose prose-sm max-w-none"
                    dangerouslySetInnerHTML={{
                      __html: renderPreviewContent(form.getValues('content') || '')
                    }}
                  ></div>
                </div>
                
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
