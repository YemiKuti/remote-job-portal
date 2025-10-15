import React from 'react';
import DOMPurify from 'dompurify';
import { cn } from '@/lib/utils';

interface WysiwygRendererProps {
  content: string;
  className?: string;
}

export const WysiwygRenderer: React.FC<WysiwygRendererProps> = ({ 
  content, 
  className = '' 
}) => {
  if (!content) return null;

  // Sanitize HTML content to prevent XSS attacks
  const sanitizedContent = DOMPurify.sanitize(content, {
    ALLOWED_TAGS: [
      'p', 'br', 'strong', 'b', 'em', 'i', 'u', 's', 'strike',
      'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
      'ul', 'ol', 'li',
      'blockquote', 'code', 'pre',
      'a', 'img', 'table', 'thead', 'tbody', 'tr', 'th', 'td',
      'div', 'span', 'hr'
    ],
    ALLOWED_ATTR: ['href', 'target', 'rel', 'src', 'alt', 'class', 'style', 'colspan', 'rowspan'],
    ADD_ATTR: ['target'],
    KEEP_CONTENT: true,
  });

  return (
    <div className={cn("wysiwyg-content", className)}>
      <div 
        className="wysiwyg-rendered-content"
        dangerouslySetInnerHTML={{ __html: sanitizedContent }}
      />
    </div>
  );
};

export default WysiwygRenderer;
