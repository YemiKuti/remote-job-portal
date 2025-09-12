import React from 'react';

interface RichTextRendererProps {
  content: string;
  className?: string;
}

export const RichTextRenderer = ({ content, className = '' }: RichTextRendererProps) => {
  if (!content) return null;
  
  // Enhanced text processing for better formatting
  const processedContent = content
    // Preserve existing line breaks and paragraphs
    .replace(/\n\n+/g, '\n\n') // Normalize multiple line breaks to double
    .replace(/\n/g, '<br>') // Convert single line breaks to HTML breaks
    .replace(/<br><br>/g, '</p><p>') // Convert double breaks to paragraphs
    // Process bullet points
    .replace(/^[•\-\*]\s*/gm, '• ') // Normalize bullet points
    .replace(/<br>•\s*/g, '<br>• ') // Ensure bullets after line breaks
    // Process numbered lists
    .replace(/^(\d+)[\.\)]\s*/gm, '$1. ') // Normalize numbered lists
    // Process bold text patterns
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') // **bold**
    .replace(/__(.*?)__/g, '<strong>$1</strong>') // __bold__
    // Process italic text patterns  
    .replace(/\*(.*?)\*/g, '<em>$1</em>') // *italic*
    .replace(/_(.*?)_/g, '<em>$1</em>') // _italic_
    // Clean up any stray HTML
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    // Restore our intentional HTML
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