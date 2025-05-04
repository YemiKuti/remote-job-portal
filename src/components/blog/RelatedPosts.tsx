
import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { RelatedPostDetails } from '@/types';

interface RelatedPostsProps {
  posts: RelatedPostDetails[];
  currentPostId: string;
}

const RelatedPosts: React.FC<RelatedPostsProps> = ({ posts, currentPostId }) => {
  // Filter out the current post and take up to 3 related posts
  const relatedPosts = posts
    .filter(post => post.id !== currentPostId)
    .slice(0, 3);

  if (relatedPosts.length === 0) return null;

  return (
    <div className="mt-10 pt-8 border-t">
      <h3 className="text-xl font-bold mb-4">Related Articles</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {relatedPosts.map((post) => (
          <Card key={post.id} className="hover:shadow-md transition-shadow duration-300">
            <CardContent className="p-4">
              <Link 
                to={`/blog/${post.id}`} 
                className="text-lg font-medium hover:text-primary transition-colors"
              >
                {post.title}
              </Link>
              <p className="text-sm text-muted-foreground mt-1">
                {post.profiles?.full_name || 'Anonymous'}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default RelatedPosts;
