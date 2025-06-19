
// Enhanced markdown processing utility for better formatting across the application
export const processMarkdown = (markdown: string | string[] | null | undefined): string => {
  // Handle various input types safely
  if (!markdown) return '';
  
  // If it's an array, join it with line breaks
  if (Array.isArray(markdown)) {
    return processMarkdown(markdown.join('\n'));
  }
  
  // Ensure we have a string
  const content = String(markdown);
  if (!content || content.trim() === '') return '';

  let html = content
    // Headers (process in order from h6 to h1 to avoid conflicts)
    .replace(/^###### (.*$)/gm, '<h6 class="text-base font-semibold mt-4 mb-2 text-gray-800">$1</h6>')
    .replace(/^##### (.*$)/gm, '<h5 class="text-lg font-semibold mt-4 mb-2 text-gray-800">$1</h5>')
    .replace(/^#### (.*$)/gm, '<h4 class="text-xl font-semibold mt-5 mb-3 text-gray-800">$1</h4>')
    .replace(/^### (.*$)/gm, '<h3 class="text-xl font-bold mt-6 mb-3 text-gray-900 border-b border-gray-200 pb-1">$1</h3>')
    .replace(/^## (.*$)/gm, '<h2 class="text-2xl font-bold mt-8 mb-4 text-gray-900 border-b-2 border-primary pb-2">$1</h2>')
    .replace(/^# (.*$)/gm, '<h1 class="text-3xl font-bold mt-10 mb-5 text-gray-900 border-b-2 border-primary pb-3">$1</h1>')
    
    // Enhanced text formatting
    .replace(/\*\*\*(.*?)\*\*\*/g, '<strong><em class="font-bold italic">$1</em></strong>')
    .replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold text-gray-900">$1</strong>')
    .replace(/(?<!\*)\*([^*\n]+)\*(?!\*)/g, '<em class="italic text-gray-700">$1</em>')
    
    // Strikethrough and underline
    .replace(/~~(.*?)~~/g, '<del class="line-through text-gray-500">$1</del>')
    .replace(/<u>(.*?)<\/u>/g, '<u class="underline decoration-2 underline-offset-2">$1</u>')
    
    // Enhanced links with better styling
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="text-primary hover:text-primary/80 underline decoration-2 underline-offset-2 font-medium transition-colors" target="_blank" rel="noopener noreferrer">$1</a>')
    
    // Enhanced images with better responsive handling
    .replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<figure class="my-6"><img src="$2" alt="$1" class="max-w-full h-auto rounded-lg shadow-sm border border-gray-200" loading="lazy" /><figcaption class="text-sm text-gray-600 mt-2 text-center italic">$1</figcaption></figure>')
    
    // Enhanced inline code
    .replace(/`([^`]+)`/g, '<code class="bg-gray-100 text-gray-800 px-2 py-1 rounded text-sm font-mono border">$1</code>')
    
    // Enhanced blockquotes
    .replace(/^> (.*$)/gm, '<blockquote class="border-l-4 border-primary bg-gray-50 pl-6 pr-4 py-3 my-6 text-gray-700 italic rounded-r-md">$1</blockquote>');

  // Process code blocks with syntax highlighting classes
  html = html.replace(/```(\w+)?\n([\s\S]*?)```/g, (match, lang, code) => {
    const language = lang ? ` data-language="${lang}"` : '';
    return `<div class="my-6">
      <pre class="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto border"${language}>
        <code class="text-sm font-mono leading-relaxed">${code.trim()}</code>
      </pre>
    </div>`;
  });

  // Process lists with better styling
  html = processEnhancedLists(html);
  
  // Process paragraphs and line breaks
  html = processEnhancedParagraphs(html);
  
  return html;
};

// Enhanced list processing with better styling and nesting support
const processEnhancedLists = (html: string): string => {
  const lines = html.split('\n');
  const processedLines = [];
  let inList = false;
  let listType = '';

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmedLine = line.trim();
    
    // Check for list items
    const unorderedMatch = trimmedLine.match(/^[*+-] (.+)$/);
    const orderedMatch = trimmedLine.match(/^\d+\. (.+)$/);
    
    if (unorderedMatch || orderedMatch) {
      const content = (unorderedMatch || orderedMatch)[1];
      const currentListType = unorderedMatch ? 'ul' : 'ol';
      
      if (!inList || listType !== currentListType) {
        if (inList) {
          processedLines.push(`</${listType}>`);
        }
        const listClass = currentListType === 'ul' 
          ? 'list-disc pl-6 my-4 space-y-2 text-gray-700'
          : 'list-decimal pl-6 my-4 space-y-2 text-gray-700';
        processedLines.push(`<${currentListType} class="${listClass}">`);
        inList = true;
        listType = currentListType;
      }
      
      processedLines.push(`<li class="leading-relaxed">${content}</li>`);
    } else {
      if (inList && trimmedLine === '') {
        continue;
      } else if (inList) {
        processedLines.push(`</${listType}>`);
        inList = false;
        listType = '';
      }
      
      if (trimmedLine !== '') {
        processedLines.push(line);
      }
    }
  }
  
  if (inList) {
    processedLines.push(`</${listType}>`);
  }
  
  return processedLines.join('\n');
};

// Enhanced paragraph processing with better line break handling
const processEnhancedParagraphs = (html: string): string => {
  const paragraphs = html.split(/\n\s*\n/);
  
  return paragraphs
    .map(paragraph => {
      const trimmed = paragraph.trim();
      if (!trimmed) return '';
      
      // Don't wrap block elements in paragraphs
      if (trimmed.match(/^<(h[1-6]|ul|ol|li|blockquote|pre|div|figure)/)) {
        return trimmed.replace(/\n/g, ' ');
      }
      
      // Handle single line breaks within paragraphs
      const withLineBreaks = trimmed.replace(/\n(?!$)/g, '<br class="my-1">');
      
      // Wrap regular text in styled paragraphs
      return `<p class="mb-4 leading-relaxed text-gray-700 text-base">${withLineBreaks}</p>`;
    })
    .filter(p => p)
    .join('\n');
};

// Enhanced sanitization with more comprehensive security
export const sanitizeHtml = (html: string): string => {
  const content = String(html || '');
  
  return content
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
    .replace(/<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi, '')
    .replace(/<embed\b[^<]*(?:(?!<\/embed>)<[^<]*)*<\/embed>/gi, '')
    .replace(/javascript:/gi, '')
    .replace(/data:/gi, '')
    .replace(/vbscript:/gi, '')
    .replace(/on\w+\s*=/gi, '')
    .replace(/style\s*=\s*["'][^"']*["']/gi, '');
};

// Utility function to extract plain text for previews
export const extractPlainText = (markdown: string | string[] | null | undefined, maxLength: number = 160): string => {
  if (!markdown) return '';
  
  const content = Array.isArray(markdown) ? markdown.join(' ') : String(markdown);
  
  return content
    .replace(/[#*_~`\[\]()]/g, '')
    .replace(/!\[.*?\]\(.*?\)/g, '')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/\n/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .substring(0, maxLength)
    .concat(content.length > maxLength ? '...' : '');
};
