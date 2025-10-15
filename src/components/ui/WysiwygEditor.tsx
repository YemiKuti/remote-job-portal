import React, { useMemo } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { cn } from '@/lib/utils';

interface WysiwygEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  readOnly?: boolean;
  height?: string;
}

const WysiwygEditor: React.FC<WysiwygEditorProps> = ({
  value,
  onChange,
  placeholder = "Start typing...",
  className,
  readOnly = false,
  height = "300px"
}) => {
  // Configure Quill modules for rich formatting
  const modules = useMemo(() => ({
    toolbar: [
      [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ 'color': [] }, { 'background': [] }],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      [{ 'indent': '-1'}, { 'indent': '+1' }],
      [{ 'align': [] }],
      ['blockquote', 'code-block'],
      ['link', 'image'],
      ['clean']
    ],
    clipboard: {
      // Enhanced clipboard handling for better copy/paste
      matchVisual: false,
    }
  }), []);

  const formats = [
    'header', 'font', 'size',
    'bold', 'italic', 'underline', 'strike',
    'color', 'background',
    'list', 'bullet', 'indent',
    'align', 'direction',
    'blockquote', 'code-block',
    'link', 'image', 'video'
  ];

  return (
    <div className={cn("wysiwyg-editor", className)}>
      <ReactQuill
        theme="snow"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        readOnly={readOnly}
        modules={modules}
        formats={formats}
        style={{
          height: height,
          display: 'flex',
          flexDirection: 'column'
        }}
        className="wysiwyg-quill"
      />
      
      {/* Custom styles to integrate with your design system */}
      <style jsx global>{`
        .wysiwyg-quill .ql-editor {
          min-height: ${height};
          font-size: 14px;
          line-height: 1.5;
        }
        
        .wysiwyg-quill .ql-toolbar {
          border-top: 1px solid #e2e8f0;
          border-left: 1px solid #e2e8f0;
          border-right: 1px solid #e2e8f0;
          border-bottom: none;
          border-radius: 8px 8px 0 0;
          background: #f8fafc;
        }
        
        .wysiwyg-quill .ql-container {
          border-bottom: 1px solid #e2e8f0;
          border-left: 1px solid #e2e8f0;
          border-right: 1px solid #e2e8f0;
          border-top: none;
          border-radius: 0 0 8px 8px;
          font-family: inherit;
        }
        
        .wysiwyg-quill .ql-editor.ql-blank::before {
          color: #94a3b8;
          font-style: normal;
          left: 12px;
          right: 12px;
        }
        
        .wysiwyg-quill .ql-toolbar .ql-formats {
          margin-right: 15px;
        }
        
        .wysiwyg-quill .ql-toolbar button {
          width: 28px;
          height: 28px;
          border-radius: 4px;
          margin: 1px;
        }
        
        .wysiwyg-quill .ql-toolbar button:hover {
          background-color: #e2e8f0;
        }
        
        .wysiwyg-quill .ql-toolbar button.ql-active {
          background-color: #3b82f6;
          color: white;
        }
        
        .wysiwyg-quill .ql-editor h1,
        .wysiwyg-quill .ql-editor h2,
        .wysiwyg-quill .ql-editor h3,
        .wysiwyg-quill .ql-editor h4,
        .wysiwyg-quill .ql-editor h5,
        .wysiwyg-quill .ql-editor h6 {
          margin-top: 1em;
          margin-bottom: 0.5em;
          font-weight: 600;
        }
        
        .wysiwyg-quill .ql-editor h1 { font-size: 2em; }
        .wysiwyg-quill .ql-editor h2 { font-size: 1.5em; }
        .wysiwyg-quill .ql-editor h3 { font-size: 1.25em; }
        .wysiwyg-quill .ql-editor h4 { font-size: 1.1em; }
        .wysiwyg-quill .ql-editor h5 { font-size: 1em; }
        .wysiwyg-quill .ql-editor h6 { font-size: 0.9em; }
        
        .wysiwyg-quill .ql-editor ul,
        .wysiwyg-quill .ql-editor ol {
          padding-left: 1.5em;
          margin: 0.5em 0;
        }
        
        .wysiwyg-quill .ql-editor li {
          margin: 0.25em 0;
        }
        
        .wysiwyg-quill .ql-editor blockquote {
          border-left: 4px solid #e2e8f0;
          padding-left: 1em;
          margin: 1em 0;
          font-style: italic;
          color: #64748b;
        }
        
        .wysiwyg-quill .ql-editor a {
          color: #3b82f6;
          text-decoration: underline;
        }
        
        .wysiwyg-quill .ql-editor a:hover {
          color: #2563eb;
        }
        
        .wysiwyg-quill .ql-editor strong {
          font-weight: 600;
        }
        
        .wysiwyg-quill .ql-editor em {
          font-style: italic;
        }
        
        /* Ensure proper spacing for pasted content */
        .wysiwyg-quill .ql-editor p {
          margin: 0.5em 0;
        }
        
        .wysiwyg-quill .ql-editor p:first-child {
          margin-top: 0;
        }
        
        .wysiwyg-quill .ql-editor p:last-child {
          margin-bottom: 0;
        }
      `}</style>
    </div>
  );
};

export default WysiwygEditor;
