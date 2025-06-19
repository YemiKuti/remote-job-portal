
import React from "react";
import { processMarkdown, sanitizeHtml } from "@/utils/markdownProcessor";
import { cn } from "@/lib/utils";

interface RichTextRendererProps {
  content: string;
  className?: string;
  variant?: 'default' | 'compact' | 'blog' | 'job';
}

export const RichTextRenderer: React.FC<RichTextRendererProps> = ({ 
  content, 
  className,
  variant = 'default'
}) => {
  const processedHtml = processMarkdown(content || "");
  const sanitizedHtml = sanitizeHtml(processedHtml);

  const baseClasses = "rich-text-content";
  
  const variantClasses = {
    default: "prose max-w-none text-gray-700",
    compact: "prose prose-sm max-w-none text-gray-700",
    blog: "prose prose-lg max-w-none text-gray-800 prose-headings:text-gray-900 prose-a:text-primary prose-strong:text-gray-900",
    job: "prose max-w-none text-gray-700 prose-headings:text-gray-800 prose-ul:my-3 prose-ol:my-3 prose-li:my-1 prose-p:my-3 prose-h2:mt-6 prose-h2:mb-4 prose-h3:mt-5 prose-h3:mb-3 prose-strong:font-semibold prose-em:italic"
  };

  // Handle empty content
  if (!content || content.trim() === '') {
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
