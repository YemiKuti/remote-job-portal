import React from 'react';
import DOMPurify from 'dompurify';

interface RichTextRendererProps {
  content: string;
  className?: string;
}

export const RichTextRenderer = ({ content, className = '' }: RichTextRendererProps) => {
  if (!content) return null;
  
  // Process content with markdown-like formatting
  const processedContent = content
    // Process bold text patterns
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/__(.*?)__/g, '<strong>$1</strong>')
    // Process italic text patterns  
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/_(.*?)_/g, '<em>$1</em>')
    // Normalize line breaks
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .replace(/\n\n+/g, '\n\n')
    // Process bullet points and lists
    .replace(/^[•\-\*\+]\s*/gm, '• ')
    .replace(/^(\d+)[\.\)]\s*/gm, '$1. ')
    // Convert line breaks to HTML
    .replace(/\n\n/g, '</p><p>')
    .replace(/\n/g, '<br>');

  // Wrap in paragraphs if not already wrapped
  const htmlContent = processedContent.includes('<p>') 
    ? processedContent 
    : `<p>${processedContent}</p>`;

  // Sanitize HTML with DOMPurify to prevent XSS attacks
  const sanitizedContent = DOMPurify.sanitize(htmlContent, {
    ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'ul', 'ol', 'li'],
    ALLOWED_ATTR: [],
    KEEP_CONTENT: true,
  });

  return (
    <div 
      className={`prose prose-sm max-w-none ${className}`}
      dangerouslySetInnerHTML={{ 
        __html: sanitizedContent
      }}
      style={{
        lineHeight: '1.6',
        whiteSpace: 'pre-wrap'
      }}
    />
  );
};