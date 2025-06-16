
// Unified markdown processing utility for consistent rendering across the application
export const processMarkdown = (markdown: string): string => {
  if (!markdown) return '';

  let html = markdown
    // Headers (process in order from h3 to h1 to avoid conflicts)
    .replace(/^### (.*$)/gm, '<h3 class="text-xl font-bold mt-6 mb-2">$1</h3>')
    .replace(/^## (.*$)/gm, '<h2 class="text-2xl font-bold mt-8 mb-3">$1</h2>')
    .replace(/^# (.*$)/gm, '<h1 class="text-3xl font-bold mt-10 mb-4">$1</h1>')
    
    // Bold and Italic (process bold first to avoid conflicts)
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    
    // Strikethrough
    .replace(/~~(.*?)~~/g, '<del>$1</del>')
    
    // Underline (using HTML tags)
    .replace(/<u>(.*?)<\/u>/g, '<u>$1</u>')
    
    // Links
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="text-primary hover:underline" target="_blank" rel="noopener noreferrer">$1</a>')
    
    // Images
    .replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1" class="max-w-full my-4 rounded-md" />')
    
    // Inline code (process before other formatting)
    .replace(/`([^`]+)`/g, '<code class="bg-muted px-1 py-0.5 rounded text-sm font-mono">$1</code>')
    
    // Blockquotes
    .replace(/^> (.*$)/gm, '<blockquote class="border-l-4 border-primary pl-4 my-4 text-muted-foreground italic">$1</blockquote>')
    
    // Code blocks (simple version)
    .replace(/```([\s\S]*?)```/g, '<pre class="bg-muted p-4 rounded-md my-4 overflow-x-auto"><code class="text-sm font-mono">$1</code></pre>');

  // Process lists properly - handle consecutive list items
  html = processLists(html);
  
  // Convert remaining line breaks to <br> tags and wrap paragraphs
  html = processParagraphs(html);
  
  return html;
};

// Helper function to properly group consecutive list items
const processLists = (html: string): string => {
  // First, convert markdown list items to HTML list items
  html = html
    .replace(/^\* (.*$)/gm, '<li>$1</li>')
    .replace(/^- (.*$)/gm, '<li>$1</li>')
    .replace(/^\d+\. (.*$)/gm, '<li-ordered>$1</li-ordered>');

  // Group consecutive <li> elements into <ul>
  html = html.replace(/(<li>.*?<\/li>)(\s*<li>.*?<\/li>)*/g, (match) => {
    return `<ul class="list-disc pl-5 my-4">${match}</ul>`;
  });

  // Group consecutive <li-ordered> elements into <ol>
  html = html.replace(/(<li-ordered>.*?<\/li-ordered>)(\s*<li-ordered>.*?<\/li-ordered>)*/g, (match) => {
    const orderedItems = match.replace(/<li-ordered>/g, '<li>').replace(/<\/li-ordered>/g, '</li>');
    return `<ol class="list-decimal pl-5 my-4">${orderedItems}</ol>`;
  });

  return html;
};

// Helper function to handle paragraphs and line breaks
const processParagraphs = (html: string): string => {
  // Split by double line breaks to create paragraphs
  const paragraphs = html.split(/\n\s*\n/);
  
  return paragraphs
    .map(paragraph => {
      const trimmed = paragraph.trim();
      if (!trimmed) return '';
      
      // Don't wrap block elements in paragraphs
      if (trimmed.match(/^<(h[1-6]|ul|ol|li|blockquote|pre|div)/)) {
        return trimmed.replace(/\n/g, ' ');
      }
      
      // Wrap regular text in paragraphs
      return `<p class="mb-4 leading-relaxed">${trimmed.replace(/\n/g, '<br>')}</p>`;
    })
    .filter(p => p)
    .join('\n');
};

// Helper function for safe HTML rendering
export const sanitizeHtml = (html: string): string => {
  // Basic sanitization - remove script tags and dangerous attributes
  return html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+\s*=/gi, '');
};
