
import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardTitle } from "@/components/ui/card";
import { Clock, User, Calendar } from "lucide-react";
import { formatDistanceToNow } from 'date-fns';

interface BlogCardProps {
  post: {
    id: string;
    title: string;
    content: string;
    featured_image?: string | null;
    created_at: string;
    updated_at: string;
    profiles: {
      full_name: string | null;
    } | null;
    category?: string;
    readTime?: string;
  };
}

const BlogCard: React.FC<BlogCardProps> = ({ post }) => {
  const getExcerpt = (content: string, maxLength: number = 150) => {
    // Remove any markdown image syntax first
    const contentWithoutImages = content.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '');
    if (contentWithoutImages.length <= maxLength) return contentWithoutImages;
    return contentWithoutImages.substring(0, maxLength) + '...';
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long', day: 'numeric' };
    return date.toLocaleDateString('en-US', options);
  };

  // Estimate read time: roughly 200 words per minute
  const calculateReadTime = (content: string): string => {
    const words = content.split(/\s+/).length;
    const minutes = Math.ceil(words / 200);
    return `${minutes} min read`;
  };

  const readTime = post.readTime || calculateReadTime(post.content);
  const timeAgo = formatDistanceToNow(new Date(post.created_at), { addSuffix: true });

  return (
    <Link to={`/blog/${post.id}`} className="group block h-full">
      <Card className="h-full border overflow-hidden hover:border-primary/50 hover:shadow-md transition-all duration-300">
        {post.featured_image && (
          <div className="aspect-video w-full overflow-hidden">
            <img 
              src={post.featured_image} 
              alt={post.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              loading="lazy"
            />
          </div>
        )}
        
        <CardContent className="flex flex-col h-full p-5">
          {post.category && (
            <div className="mb-2">
              <span className="text-xs font-medium bg-primary/10 text-primary px-2 py-1 rounded-full">
                {post.category}
              </span>
            </div>
          )}
          
          <CardTitle className="text-xl group-hover:text-primary transition-colors mb-2">
            {post.title}
          </CardTitle>
          
          <CardDescription className="text-muted-foreground mb-3 line-clamp-3">
            {getExcerpt(post.content)}
          </CardDescription>
          
          <div className="mt-auto pt-4 border-t flex flex-wrap items-center text-xs text-muted-foreground gap-3">
            <div className="flex items-center">
              <User className="h-3 w-3 mr-1" />
              <span>{post.profiles?.full_name || 'Anonymous'}</span>
            </div>
            
            <div className="flex items-center" title={formatDate(post.created_at)}>
              <Calendar className="h-3 w-3 mr-1" />
              <span>{timeAgo}</span>
            </div>
            
            <div className="flex items-center">
              <Clock className="h-3 w-3 mr-1" />
              <span>{readTime}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
};

export default BlogCard;
