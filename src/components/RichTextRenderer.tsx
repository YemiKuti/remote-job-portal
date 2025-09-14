import React from 'react';

interface RichTextRendererProps {
  content: string;
  className?: string;
}

export const RichTextRenderer = ({ content, className = '' }: RichTextRendererProps) => {
  if (!content) return null;
  
  // Enhanced text processing for better formatting
  const processedContent = content
    // First, escape HTML entities to prevent issues
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    // Process bold text patterns before line breaks
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') // **bold**
    .replace(/__(.*?)__/g, '<strong>$1</strong>') // __bold__
    // Process italic text patterns  
    .replace(/\*(.*?)\*/g, '<em>$1</em>') // *italic*
    .replace(/_(.*?)_/g, '<em>$1</em>') // _italic_
    // Normalize line breaks - preserve paragraph structure
    .replace(/\r\n/g, '\n') // Normalize Windows line endings
    .replace(/\r/g, '\n') // Normalize Mac line endings
    .replace(/\n\n+/g, '\n\n') // Normalize multiple line breaks to double
    // Process bullet points and lists
    .replace(/^[•\-\*\+]\s*/gm, '• ') // Normalize bullet points
    .replace(/^(\d+)[\.\)]\s*/gm, '$1. ') // Normalize numbered lists
    // Convert line breaks to HTML
    .replace(/\n\n/g, '</p><p>') // Convert paragraph breaks
    .replace(/\n/g, '<br>') // Convert line breaks
    // Restore our intentional HTML (unescape our formatted elements)
    .replace(/&lt;br&gt;/g, '<br>')
    .replace(/&lt;\/p&gt;&lt;p&gt;/g, '</p><p>')
    .replace(/&lt;strong&gt;(.*?)&lt;\/strong&gt;/g, '<strong>$1</strong>')
    .replace(/&lt;em&gt;(.*?)&lt;\/em&gt;/g, '<em>$1</em>');

  // Wrap in paragraphs if not already wrapped
  const finalContent = processedContent.includes('<p>') 
    ? processedContent 
    : `<p>${processedContent}</p>`;

  return (
    <div 
      className={`prose prose-sm max-w-none ${className}`}
      dangerouslySetInnerHTML={{ 
        __html: finalContent
      }}
      style={{
        lineHeight: '1.6',
        whiteSpace: 'pre-wrap'
      }}
    />
  );
};