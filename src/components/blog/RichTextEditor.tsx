
import React, { useState, useRef, useCallback } from 'react';
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
  Eye,
  Edit
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { RichTextRenderer } from '@/components/RichTextRenderer';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

const RichTextEditor = ({ value, onChange, placeholder, className }: RichTextEditorProps) => {
  const [showPreview, setShowPreview] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Ensure value is always a string
  const safeValue = String(value || '');

  const getSelectionInfo = useCallback(() => {
    const textarea = textareaRef.current;
    if (!textarea) return { start: 0, end: 0, selectedText: '' };
    
    return {
      start: textarea.selectionStart,
      end: textarea.selectionEnd,
      selectedText: safeValue.substring(textarea.selectionStart, textarea.selectionEnd)
    };
  }, [safeValue]);

  const insertTextAtCursor = useCallback((before: string, after: string = '', replaceSelection: boolean = false) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const { start, end, selectedText } = getSelectionInfo();
    
    let newText: string;
    let newCursorPos: number;

    if (replaceSelection && selectedText) {
      // Wrap selected text
      newText = safeValue.substring(0, start) + before + selectedText + after + safeValue.substring(end);
      newCursorPos = start + before.length + selectedText.length + after.length;
    } else if (selectedText && !replaceSelection) {
      // Insert at cursor, preserving selection
      newText = safeValue.substring(0, start) + before + after + safeValue.substring(start);
      newCursorPos = start + before.length;
    } else {
      // No selection, just insert
      newText = safeValue.substring(0, start) + before + after + safeValue.substring(end);
      newCursorPos = start + before.length;
    }

    onChange(newText);
    
    // Restore focus and cursor position
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(newCursorPos, newCursorPos);
    }, 0);
  }, [safeValue, onChange, getSelectionInfo]);

  const wrapSelectedText = useCallback((before: string, after: string = '') => {
    insertTextAtCursor(before, after, true);
  }, [insertTextAtCursor]);

  const insertAtNewLine = useCallback((text: string) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const { start } = getSelectionInfo();
    const beforeCursor = safeValue.substring(0, start);
    const afterCursor = safeValue.substring(start);
    
    // Check if we're at the beginning of a line or need to add a newline
    const needsNewlineBefore = beforeCursor.length > 0 && !beforeCursor.endsWith('\n');
    const needsNewlineAfter = !afterCursor.startsWith('\n') && afterCursor.length > 0;
    
    const prefix = needsNewlineBefore ? '\n' : '';
    const suffix = needsNewlineAfter ? '\n' : '';
    
    const newText = beforeCursor + prefix + text + suffix + afterCursor;
    const newCursorPos = beforeCursor.length + prefix.length + text.length;
    
    onChange(newText);
    
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(newCursorPos, newCursorPos);
    }, 0);
  }, [safeValue, onChange, getSelectionInfo]);

  const handlePaste = useCallback((e: React.ClipboardEvent) => {
    // Let the default paste behavior work for now
    // In the future, we could add smart paste formatting here
  }, []);

  const formatButtons = [
    {
      icon: <Bold className="h-4 w-4" />,
      action: () => wrapSelectedText('**', '**'),
      tooltip: 'Bold'
    },
    {
      icon: <Italic className="h-4 w-4" />,
      action: () => wrapSelectedText('*', '*'),
      tooltip: 'Italic'
    },
    {
      icon: <Underline className="h-4 w-4" />,
      action: () => wrapSelectedText('<u>', '</u>'),
      tooltip: 'Underline'
    },
    {
      icon: <Strikethrough className="h-4 w-4" />,
      action: () => wrapSelectedText('~~', '~~'),
      tooltip: 'Strikethrough'
    }
  ];

  const headingButtons = [
    {
      icon: <Heading1 className="h-4 w-4" />,
      action: () => insertAtNewLine('# '),
      tooltip: 'Heading 1'
    },
    {
      icon: <Heading2 className="h-4 w-4" />,
      action: () => insertAtNewLine('## '),
      tooltip: 'Heading 2'
    },
    {
      icon: <Heading3 className="h-4 w-4" />,
      action: () => insertAtNewLine('### '),
      tooltip: 'Heading 3'
    }
  ];

  const listButtons = [
    {
      icon: <List className="h-4 w-4" />,
      action: () => {
        const { selectedText } = getSelectionInfo();
        if (selectedText) {
          // Convert each line to a bullet point
          const lines = selectedText.split('\n');
          const bulletPoints = lines.map(line => line.trim() ? `- ${line.trim()}` : '').join('\n');
          wrapSelectedText('', '');
          insertTextAtCursor(bulletPoints);
        } else {
          insertAtNewLine('- ');
        }
      },
      tooltip: 'Bullet List'
    },
    {
      icon: <ListOrdered className="h-4 w-4" />,
      action: () => {
        const { selectedText } = getSelectionInfo();
        if (selectedText) {
          // Convert each line to a numbered point
          const lines = selectedText.split('\n');
          const numberedPoints = lines.map((line, index) => 
            line.trim() ? `${index + 1}. ${line.trim()}` : ''
          ).join('\n');
          wrapSelectedText('', '');
          insertTextAtCursor(numberedPoints);
        } else {
          insertAtNewLine('1. ');
        }
      },
      tooltip: 'Numbered List'
    }
  ];

  const insertButtons = [
    {
      icon: <Quote className="h-4 w-4" />,
      action: () => {
        const { selectedText } = getSelectionInfo();
        if (selectedText) {
          const quotedText = selectedText.split('\n').map(line => `> ${line}`).join('\n');
          wrapSelectedText('', '');
          insertTextAtCursor(quotedText);
        } else {
          insertAtNewLine('> ');
        }
      },
      tooltip: 'Quote'
    },
    {
      icon: <Code className="h-4 w-4" />,
      action: () => {
        const { selectedText } = getSelectionInfo();
        if (selectedText.includes('\n')) {
          // Multi-line code block
          wrapSelectedText('```\n', '\n```');
        } else {
          // Inline code
          wrapSelectedText('`', '`');
        }
      },
      tooltip: 'Code'
    },
    {
      icon: <Link className="h-4 w-4" />,
      action: () => {
        const { selectedText } = getSelectionInfo();
        if (selectedText) {
          wrapSelectedText(`[${selectedText}](`, ')');
        } else {
          insertTextAtCursor('[Link Text](', ')');
        }
      },
      tooltip: 'Link'
    },
    {
      icon: <Image className="h-4 w-4" />,
      action: () => insertTextAtCursor('![Alt Text](', ')'),
      tooltip: 'Image'
    }
  ];

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
          <div className="min-h-[300px] p-3">
            <RichTextRenderer 
              content={safeValue} 
              variant="blog"
              className="prose-headings:mt-0 prose-p:mb-2"
            />
          </div>
        ) : (
          <Textarea
            ref={textareaRef}
            value={safeValue}
            onChange={(e) => onChange(e.target.value)}
            onPaste={handlePaste}
            placeholder={placeholder}
            className="min-h-[300px] border-0 resize-none focus-visible:ring-0 rounded-t-none"
          />
        )}
      </div>

      {/* Word Count */}
      <div className="flex justify-between items-center mt-2 text-xs text-muted-foreground">
        <span>Words: {safeValue.split(/\s+/).filter(word => word.length > 0).length}</span>
        <span>Characters: {safeValue.length}</span>
      </div>
    </div>
  );
};

export default RichTextEditor;
