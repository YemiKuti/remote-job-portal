
import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Clock, User } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { extractPlainText } from '@/utils/markdownProcessor';

interface BlogPost {
  id: string;
  title: string;
  content: string;
  created_at: string;
  profiles: {
    full_name: string | null;
  } | null;
  category?: string;
}

interface BlogCardProps {
  post: BlogPost;
}

const BlogCard: React.FC<BlogCardProps> = ({ post }) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Calculate read time
  const calculateReadTime = (content: string) => {
    const wordsPerMinute = 200;
    const wordCount = content?.split(/\s+/)?.length || 0;
    const readTime = Math.ceil(wordCount / wordsPerMinute);
    return `${readTime} min read`;
  };

  // Extract plain text preview from markdown content
  const getPreview = (content: string) => {
    return extractPlainText(content, 120);
  };

  return (
    <Card className="h-full hover:shadow-lg transition-shadow duration-200">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between mb-2">
          {post.category && (
            <Badge variant="secondary" className="text-xs">
              {post.category}
            </Badge>
          )}
          <span className="text-xs text-muted-foreground">
            {calculateReadTime(post.content)}
          </span>
        </div>
        
        <Link to={`/blog/${post.id}`} className="group">
          <h2 className="text-xl font-semibold text-gray-900 group-hover:text-primary transition-colors line-clamp-2">
            {post.title}
          </h2>
        </Link>
      </CardHeader>
      
      <CardContent className="pt-0">
        <p className="text-gray-600 text-sm mb-4 line-clamp-3">
          {getPreview(post.content)}
        </p>
        
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center space-x-4">
            <div className="flex items-center">
              <User className="h-3 w-3 mr-1" />
              <span>{post.profiles?.full_name || 'Anonymous'}</span>
            </div>
            
            <div className="flex items-center">
              <Calendar className="h-3 w-3 mr-1" />
              <span>{formatDate(post.created_at)}</span>
            </div>
          </div>
          
          <Link 
            to={`/blog/${post.id}`}
            className="text-primary hover:text-primary/80 font-medium transition-colors"
          >
            Read more →
          </Link>
        </div>
      </CardContent>
    </Card>
  );
};

export default BlogCard;
