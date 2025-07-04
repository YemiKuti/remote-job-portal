import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { supabase } from "@/integrations/supabase/client";
import { AlertCircle, ArrowLeft, Calendar, Clock, User, Share } from 'lucide-react';
import { Button } from '@/components/ui/button';
import BlogSEO from '@/components/blog/BlogSEO';
import TableOfContents from '@/components/blog/TableOfContents';
import RelatedPosts from '@/components/blog/RelatedPosts';
import { BlogPostDetails, RelatedPostDetails } from '@/types';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import RichTextRenderer from "@/components/RichTextRenderer";

const BlogPost = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [post, setPost] = useState<BlogPostDetails | null>(null);
  const [relatedPosts, setRelatedPosts] = useState<RelatedPostDetails[]>([]);
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
            featured_image,
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

        // Once we have the post, fetch related posts
        if (data) {
          const { data: relatedData } = await supabase
            .from('posts')
            .select(`
              id, 
              title, 
              created_at,
              profiles (full_name)
            `)
            .eq('is_published', true)
            .neq('id', id)
            .order('created_at', { ascending: false })
            .limit(5);

          setRelatedPosts(relatedData || []);
        }
      } catch (err) {
        console.error('Error fetching post:', err);
        setError('Failed to load blog post. It may have been removed or is not published.');
      } finally {
        setLoading(false);
      }
    };

    fetchPost();

    // Scroll to top when post changes
    window.scrollTo(0, 0);
  }, [id]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const options: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    };
    return date.toLocaleDateString('en-US', options);
  };

  // Calculate estimated read time
  const calculateReadTime = (content: string) => {
    const wordsPerMinute = 200;
    const wordCount = content?.split(/\s+/)?.length || 0;
    const readTime = Math.ceil(wordCount / wordsPerMinute);
    return `${readTime} min read`;
  };

  // Share functionality
  const handleShare = async () => {
    const url = window.location.href;
    const title = post?.title || 'AfricanTechJobs Blog Post';

    if (navigator.share) {
      try {
        await navigator.share({
          title,
          text: 'Check out this article on AfricanTechJobs',
          url
        });
      } catch (error) {
        console.error('Error sharing:', error);
        // Fall back to copy to clipboard
        copyToClipboard(url);
      }
    } else {
      // Fall back to copy to clipboard
      copyToClipboard(url);
    }
  };

  // Copy URL to clipboard
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    // In a real implementation, you'd show a toast notification here
    alert('URL copied to clipboard!');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-grow container mx-auto px-4 py-8 flex items-center justify-center">
          <div className="flex items-center space-x-2">
            <Clock className="h-5 w-5 animate-spin text-primary" />
            <p>Loading blog post...</p>
          </div>
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

  const readTime = calculateReadTime(post.content);

  return (
    <div className="min-h-screen flex flex-col">
      <BlogSEO
        title={post.title}
        description={post.content.substring(0, 160).replace(/[#*[\]()]/g, '')}
        publishedTime={post.created_at}
        modifiedTime={post.updated_at}
        authorName={post.profiles?.full_name || undefined}
        url={window.location.href}
      />

      <Header />
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <Link to="/blog" className="inline-flex items-center text-gray-600 hover:text-primary mb-6">
            <ArrowLeft className="h-4 w-4 mr-1" /> Back to all articles
          </Link>

          <article>
            {post.featured_image && (
              <div className="mb-8">
                <img
                  src={post.featured_image}
                  alt={post.title}
                  className="w-full h-64 md:h-96 object-cover rounded-lg"
                />
              </div>
            )}

            <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">{post.title}</h1>

            <div className="flex flex-wrap items-center gap-4 text-gray-600 text-sm mb-6">
              <div className="flex items-center">
                <User className="h-4 w-4 mr-1" />
                <span>{post.profiles?.full_name || 'Anonymous'}</span>
              </div>

              <div className="flex items-center">
                <Calendar className="h-4 w-4 mr-1" />
                <span>{formatDate(post.created_at)}</span>
              </div>

              <div className="flex items-center">
                <Clock className="h-4 w-4 mr-1" />
                <span>{readTime}</span>
              </div>

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="ml-auto"
                      onClick={handleShare}
                    >
                      <Share className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Share this article</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>

            {/* Table of Contents */}
            <TableOfContents content={post.content} />

            {/* Article Content */}
            <div className="mb-12">
              <RichTextRenderer 
                content={post.content} 
                variant="blog"
                className="max-w-none"
              />
            </div>
          </article>

          {/* Related Posts */}
          <RelatedPosts posts={relatedPosts} currentPostId={post.id} />
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default BlogPost;
