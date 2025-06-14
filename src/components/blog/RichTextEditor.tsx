
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { 
  Bold, 
  Italic, 
  Underline, 
  Strikethrough,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  Code,
  Link,
  Image,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Eye,
  Edit
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

const RichTextEditor = ({ value, onChange, placeholder, className }: RichTextEditorProps) => {
  const [showPreview, setShowPreview] = useState(false);
  const [selectedText, setSelectedText] = useState('');
  const textareaRef = React.useRef<HTMLTextAreaElement>(null);

  const insertText = (before: string, after: string = '') => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = value.substring(start, end);
    
    const newText = value.substring(0, start) + before + selectedText + after + value.substring(end);
    onChange(newText);
    
    // Reset cursor position
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + before.length, start + before.length + selectedText.length);
    }, 0);
  };

  const insertAtCursor = (text: string) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    
    const newText = value.substring(0, start) + text + value.substring(end);
    onChange(newText);
    
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + text.length, start + text.length);
    }, 0);
  };

  const formatButtons = [
    {
      icon: <Bold className="h-4 w-4" />,
      action: () => insertText('**', '**'),
      tooltip: 'Bold'
    },
    {
      icon: <Italic className="h-4 w-4" />,
      action: () => insertText('*', '*'),
      tooltip: 'Italic'
    },
    {
      icon: <Underline className="h-4 w-4" />,
      action: () => insertText('<u>', '</u>'),
      tooltip: 'Underline'
    },
    {
      icon: <Strikethrough className="h-4 w-4" />,
      action: () => insertText('~~', '~~'),
      tooltip: 'Strikethrough'
    }
  ];

  const headingButtons = [
    {
      icon: <Heading1 className="h-4 w-4" />,
      action: () => insertAtCursor('\n# '),
      tooltip: 'Heading 1'
    },
    {
      icon: <Heading2 className="h-4 w-4" />,
      action: () => insertAtCursor('\n## '),
      tooltip: 'Heading 2'
    },
    {
      icon: <Heading3 className="h-4 w-4" />,
      action: () => insertAtCursor('\n### '),
      tooltip: 'Heading 3'
    }
  ];

  const listButtons = [
    {
      icon: <List className="h-4 w-4" />,
      action: () => insertAtCursor('\n- '),
      tooltip: 'Bullet List'
    },
    {
      icon: <ListOrdered className="h-4 w-4" />,
      action: () => insertAtCursor('\n1. '),
      tooltip: 'Numbered List'
    }
  ];

  const insertButtons = [
    {
      icon: <Quote className="h-4 w-4" />,
      action: () => insertText('\n> ', ''),
      tooltip: 'Quote'
    },
    {
      icon: <Code className="h-4 w-4" />,
      action: () => insertText('`', '`'),
      tooltip: 'Inline Code'
    },
    {
      icon: <Link className="h-4 w-4" />,
      action: () => insertText('[Link Text](', ')'),
      tooltip: 'Link'
    },
    {
      icon: <Image className="h-4 w-4" />,
      action: () => insertText('![Alt Text](', ')'),
      tooltip: 'Image'
    }
  ];

  // Simple markdown to HTML converter for preview
  const renderPreview = (markdown: string) => {
    let html = markdown
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
      .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="text-primary hover:underline">$1</a>')
      // Images
      .replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1" class="max-w-full my-4 rounded-md">')
      // Code
      .replace(/`([^`]+)`/g, '<code class="bg-muted px-1 py-0.5 rounded text-sm">$1</code>')
      // Quotes
      .replace(/^> (.*$)/gm, '<blockquote class="border-l-4 border-primary pl-4 my-4 text-muted-foreground">$1</blockquote>')
      // Lists
      .replace(/^\* (.*$)/gm, '<li>$1</li>')
      .replace(/^- (.*$)/gm, '<li>$1</li>')
      .replace(/^\d+\. (.*$)/gm, '<li>$1</li>')
      // Line breaks
      .replace(/\n/g, '<br>');

    // Wrap consecutive list items in ul/ol tags
    html = html.replace(/(<li>.*<\/li>)/g, '<ul class="list-disc pl-5 my-4">$1</ul>');
    
    return html;
  };

  return (
    <div className={className}>
      {/* Toolbar */}
      <div className="border border-b-0 rounded-t-md bg-muted/50 p-2">
        <div className="flex flex-wrap items-center gap-1">
          {/* Text Formatting */}
          <div className="flex items-center gap-1">
            {formatButtons.map((button, index) => (
              <Button
                key={index}
                variant="ghost"
                size="sm"
                onClick={button.action}
                title={button.tooltip}
                className="h-8 w-8 p-0"
              >
                {button.icon}
              </Button>
            ))}
          </div>

          <Separator orientation="vertical" className="h-6" />

          {/* Headings */}
          <div className="flex items-center gap-1">
            {headingButtons.map((button, index) => (
              <Button
                key={index}
                variant="ghost"
                size="sm"
                onClick={button.action}
                title={button.tooltip}
                className="h-8 w-8 p-0"
              >
                {button.icon}
              </Button>
            ))}
          </div>

          <Separator orientation="vertical" className="h-6" />

          {/* Lists */}
          <div className="flex items-center gap-1">
            {listButtons.map((button, index) => (
              <Button
                key={index}
                variant="ghost"
                size="sm"
                onClick={button.action}
                title={button.tooltip}
                className="h-8 w-8 p-0"
              >
                {button.icon}
              </Button>
            ))}
          </div>

          <Separator orientation="vertical" className="h-6" />

          {/* Insert Elements */}
          <div className="flex items-center gap-1">
            {insertButtons.map((button, index) => (
              <Button
                key={index}
                variant="ghost"
                size="sm"
                onClick={button.action}
                title={button.tooltip}
                className="h-8 w-8 p-0"
              >
                {button.icon}
              </Button>
            ))}
          </div>

          <Separator orientation="vertical" className="h-6" />

          {/* Preview Toggle */}
          <Button
            variant={showPreview ? "default" : "ghost"}
            size="sm"
            onClick={() => setShowPreview(!showPreview)}
            className="h-8"
          >
            {showPreview ? <Edit className="h-4 w-4 mr-1" /> : <Eye className="h-4 w-4 mr-1" />}
            {showPreview ? 'Edit' : 'Preview'}
          </Button>
        </div>

        {/* Format Guide */}
        <div className="mt-2 flex flex-wrap gap-1 text-xs text-muted-foreground">
          <Badge variant="outline" className="text-xs">**bold**</Badge>
          <Badge variant="outline" className="text-xs">*italic*</Badge>
          <Badge variant="outline" className="text-xs"># heading</Badge>
          <Badge variant="outline" className="text-xs">- list</Badge>
          <Badge variant="outline" className="text-xs">[link](url)</Badge>
          <Badge variant="outline" className="text-xs">![image](url)</Badge>
        </div>
      </div>

      {/* Editor Content */}
      <div className="border border-t-0 rounded-b-md">
        {showPreview ? (
          <div 
            className="min-h-[300px] p-3 prose max-w-none"
            dangerouslySetInnerHTML={{ __html: renderPreview(value) }}
          />
        ) : (
          <Textarea
            ref={textareaRef}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            className="min-h-[300px] border-0 resize-none focus-visible:ring-0 rounded-t-none"
            onSelect={(e) => {
              const target = e.target as HTMLTextAreaElement;
              const start = target.selectionStart;
              const end = target.selectionEnd;
              setSelectedText(value.substring(start, end));
            }}
          />
        )}
      </div>

      {/* Word Count */}
      <div className="flex justify-between items-center mt-2 text-xs text-muted-foreground">
        <span>Words: {value.split(/\s+/).filter(word => word.length > 0).length}</span>
        <span>Characters: {value.length}</span>
      </div>
    </div>
  );
};

export default RichTextEditor;
