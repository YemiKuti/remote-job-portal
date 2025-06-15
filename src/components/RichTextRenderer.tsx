
import React from "react";

// Simple markdown-to-HTML converter (same logic as in RichTextEditor preview)
function renderMarkdown(markdown: string) {
  let html = (markdown || "")
    // Headers
    .replace(/^### (.*$)/gm, '<h3 class="text-xl font-bold mt-6 mb-2">$1</h3>')
    .replace(/^## (.*$)/gm, '<h2 class="text-2xl font-bold mt-8 mb-3">$1</h2>')
    .replace(/^# (.*$)/gm, '<h1 class="text-3xl font-bold mt-10 mb-4">$1</h1>')
    // Bold and Italic
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    // Strikethrough
    .replace(/~~(.*?)~~/g, '<del>$1</del>')
    // Underline
    .replace(/<u>(.*?)<\/u>/g, '<u>$1</u>')
    // Links
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="text-primary hover:underline" target="_blank" rel="noopener noreferrer">$1</a>')
    // Images
    .replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1" class="max-w-full my-4 rounded-md">')
    // Code
    .replace(/`([^`]+)`/g, '<code class="bg-muted px-1 py-0.5 rounded text-sm">$1</code>')
    // Quotes
    .replace(/^> (.*$)/gm, '<blockquote class="border-l-4 border-primary pl-4 my-4 text-muted-foreground">$1</blockquote>')
    // Lists (ul/ol/markdown-style)
    .replace(/^\* (.*$)/gm, '<li>$1</li>')
    .replace(/^- (.*$)/gm, '<li>$1</li>')
    .replace(/^\d+\. (.*$)/gm, '<li>$1</li>')
    // Line breaks
    .replace(/\n/g, '<br>');

  // Wrap consecutive <li> in <ul>
  html = html.replace(/(<li>.*?<\/li>)/g, '<ul class="list-disc pl-5 my-4">$1</ul>');

  return html;
}

export const RichTextRenderer: React.FC<{ content: string }> = ({ content }) => (
  <div
    className="prose max-w-none text-gray-700"
    dangerouslySetInnerHTML={{ __html: renderMarkdown(content) }}
  />
);

export default RichTextRenderer;
