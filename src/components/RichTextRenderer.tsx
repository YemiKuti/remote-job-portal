
import React from "react";
import { processMarkdown, sanitizeHtml } from "@/utils/markdownProcessor";
import { cn } from "@/lib/utils";

interface RichTextRendererProps {
  content: string | string[] | null | undefined;
  className?: string;
  variant?: 'default' | 'compact' | 'blog' | 'job';
}

export const RichTextRenderer: React.FC<RichTextRendererProps> = ({ 
  content, 
  className,
  variant = 'default'
}) => {
  // Safely process the content with type checking
  const processedHtml = processMarkdown(content);
  const sanitizedHtml = sanitizeHtml(processedHtml);

  const baseClasses = "rich-text-content";
  
  const variantClasses = {
    default: "prose max-w-none text-gray-700",
    compact: "prose prose-sm max-w-none text-gray-700 [&>p]:mb-2 [&>h1]:mb-2 [&>h2]:mb-2 [&>h3]:mb-2 [&>h4]:mb-2 [&>h5]:mb-2 [&>h6]:mb-2 [&>ul]:mb-2 [&>ol]:mb-2",
    blog: "prose prose-lg max-w-none text-gray-800 prose-headings:text-gray-900 prose-a:text-primary prose-strong:text-gray-900 prose-p:leading-relaxed prose-li:leading-relaxed",
    job: "prose max-w-none text-gray-700 prose-headings:text-gray-800 prose-ul:my-3 prose-ol:my-3 prose-li:my-1 prose-p:my-3 prose-h2:mt-6 prose-h2:mb-4 prose-h3:mt-5 prose-h3:mb-3 prose-strong:font-semibold prose-em:italic"
  };

  // Handle empty content
  if (!content || (typeof content === 'string' && content.trim() === '') || (Array.isArray(content) && content.length === 0)) {
    return (
      <div className={cn(baseClasses, variantClasses[variant], className)}>
        <p className="text-gray-500 italic">No content provided</p>
      </div>
    );
  }

  return (
    <div
      className={cn(baseClasses, variantClasses[variant], className)}
      dangerouslySetInnerHTML={{ __html: sanitizedHtml }}
    />
  );
};

export default RichTextRenderer;
