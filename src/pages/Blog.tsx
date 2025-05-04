
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { supabase } from "@/integrations/supabase/client";
import { AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

interface BlogPost {
  id: string;
  title: string;
  content: string;
  created_at: string;
  updated_at: string;
  user_id: string;
  is_published: boolean;
  profiles: {
    full_name: string | null;
  } | null;
}

const Blog: React.FC = () => {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const { data, error } = await supabase
          .from('posts')
          .select(`
            id, 
            title, 
            content, 
            created_at, 
            updated_at, 
            user_id,
            is_published,
            profiles (full_name)
          `)
          .eq('is_published', true)
          .order('created_at', { ascending: false });

        if (error) {
          throw error;
        }

        setPosts(data || []);
      } catch (err) {
        console.error('Error fetching posts:', err);
        setError('Failed to load blog posts. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, []);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long', day: 'numeric' };
    return date.toLocaleDateString('en-US', options);
  };

  const getExcerpt = (content: string, maxLength: number = 150) => {
    // Remove any markdown image syntax first
    const contentWithoutImages = content.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '');
    if (contentWithoutImages.length <= maxLength) return contentWithoutImages;
    return contentWithoutImages.substring(0, maxLength) + '...';
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-green-600 mb-2">AfricanTechJobs Blog</h1>
          <p className="text-gray-600">Insights, tips and trends for the African tech community</p>
        </div>
        
        {loading ? (
          <div className="text-center py-10">
            <p>Loading blog posts...</p>
          </div>
        ) : error ? (
          <div className="text-center py-10">
            <AlertCircle className="mx-auto h-10 w-10 text-red-500 mb-4" />
            <p className="text-red-500">{error}</p>
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-10">
            <p>No blog posts available at the moment. Check back soon!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {posts.map((post) => (
              <Link to={`/blog/${post.id}`} key={post.id}>
                <Card className="hover:shadow-md transition-shadow duration-300 h-full">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-xl hover:text-green-600 transition-colors">{post.title}</CardTitle>
                    <CardDescription className="text-sm text-gray-500">
                      By {post.profiles?.full_name || 'Anonymous'} • {formatDate(post.created_at)}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-700">{getExcerpt(post.content)}</p>
                    <div className="mt-4 text-green-600 hover:text-green-800 font-medium">
                      Read more →
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default Blog;
