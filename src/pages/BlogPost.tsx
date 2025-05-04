
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { supabase } from "@/integrations/supabase/client";
import { AlertCircle, ArrowLeft, Calendar, User } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface BlogPostDetails {
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

const BlogPost = () => {
  const { id } = useParams<{ id: string }>();
  const [post, setPost] = useState<BlogPostDetails | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPost = async () => {
      if (!id) return;
      
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
          .eq('id', id)
          .eq('is_published', true)
          .single();

        if (error) {
          throw error;
        }

        setPost(data);
      } catch (err) {
        console.error('Error fetching post:', err);
        setError('Failed to load blog post. It may have been removed or is not published.');
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [id]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const options: Intl.DateTimeFormatOptions = { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    return date.toLocaleDateString('en-US', options);
  };

  // Function to convert markdown content to HTML
  const renderContent = (markdown: string) => {
    if (!markdown) return '';
    
    // Convert markdown image syntax to HTML
    const withImages = markdown.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1" class="max-w-full my-4 rounded-md">');
    
    // Convert markdown headings
    const withHeadings = withImages
      .replace(/^### (.*$)/gm, '<h3 class="text-xl font-bold mt-6 mb-2">$1</h3>')
      .replace(/^## (.*$)/gm, '<h2 class="text-2xl font-bold mt-8 mb-3">$1</h2>')
      .replace(/^# (.*$)/gm, '<h1 class="text-3xl font-bold mt-10 mb-4">$1</h1>');
    
    // Convert markdown links
    const withLinks = withHeadings.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="text-blue-600 hover:underline">$1</a>');
    
    // Convert markdown bold and italic
    const withFormatting = withLinks
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>');
    
    // Convert markdown lists
    const withLists = withFormatting
      .replace(/^\s*\n\* (.*)/gm, '<ul class="list-disc pl-5 my-4"><li>$1</li>')
      .replace(/^\* (.*)/gm, '<li>$1</li>')
      .replace(/^\s*\n- (.*)/gm, '<ul class="list-disc pl-5 my-4"><li>$1</li>')
      .replace(/^- (.*)/gm, '<li>$1</li>')
      .replace(/^\s*\n\d+\. (.*)/gm, '<ol class="list-decimal pl-5 my-4"><li>$1</li>')
      .replace(/^\d+\. (.*)/gm, '<li>$1</li>')
      .replace(/<\/ul>\s*\n<ul>/g, '')
      .replace(/<\/ol>\s*\n<ol>/g, '');
    
    // Convert line breaks
    const withBreaks = withLists.replace(/\n/g, '<br>');
    
    // Wrap paragraphs
    const paragraphs = withBreaks.split('<br>').map(line => {
      if (
        !line.trim() || 
        line.includes('<h1') || 
        line.includes('<h2') || 
        line.includes('<h3') || 
        line.includes('<ul') || 
        line.includes('<ol') || 
        line.includes('<li') ||
        line.includes('<img')
      ) {
        return line;
      }
      return `<p class="my-4">${line}</p>`;
    }).join('');
    
    return paragraphs;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-grow container mx-auto px-4 py-8 flex items-center justify-center">
          <p>Loading blog post...</p>
        </main>
        <Footer />
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-grow container mx-auto px-4 py-8 flex flex-col items-center justify-center">
          <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
          <h1 className="text-2xl font-bold mb-2">Post Not Found</h1>
          <p className="text-gray-600 mb-6">{error || "The blog post you're looking for doesn't exist or isn't available."}</p>
          <Button asChild>
            <Link to="/blog" className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" /> Return to Blog
            </Link>
          </Button>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto">
          <Link to="/blog" className="inline-flex items-center text-gray-600 hover:text-green-600 mb-6">
            <ArrowLeft className="h-4 w-4 mr-1" /> Back to all articles
          </Link>
          
          <article>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">{post.title}</h1>
            
            <div className="flex items-center text-gray-600 text-sm mb-8">
              <div className="flex items-center mr-4">
                <User className="h-4 w-4 mr-1" />
                <span>{post.profiles?.full_name || 'Anonymous'}</span>
              </div>
              <div className="flex items-center">
                <Calendar className="h-4 w-4 mr-1" />
                <span>{formatDate(post.created_at)}</span>
              </div>
            </div>
            
            <div className="prose max-w-none">
              <div dangerouslySetInnerHTML={{ __html: renderContent(post.content) }} />
            </div>
          </article>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default BlogPost;
