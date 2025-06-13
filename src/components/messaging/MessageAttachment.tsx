
import React from 'react';
import { Download, File, Image, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface MessageAttachmentProps {
  url: string;
  name: string;
  size: number;
}

export const MessageAttachment = ({ url, name, size }: MessageAttachmentProps) => {
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (filename: string) => {
    const extension = filename.split('.').pop()?.toLowerCase();
    if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(extension || '')) {
      return <Image className="h-4 w-4" />;
    }
    if (['pdf', 'doc', 'docx', 'txt'].includes(extension || '')) {
      return <FileText className="h-4 w-4" />;
    }
    return <File className="h-4 w-4" />;
  };

  const isImage = (filename: string) => {
    const extension = filename.split('.').pop()?.toLowerCase();
    return ['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(extension || '');
  };

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = url;
    link.download = name;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="mt-2">
      {isImage(name) ? (
        <div className="max-w-xs">
          <img
            src={url}
            alt={name}
            className="rounded-lg border max-h-48 object-cover cursor-pointer"
            onClick={() => window.open(url, '_blank')}
          />
          <div className="flex items-center justify-between mt-1">
            <span className="text-xs text-muted-foreground">{name}</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDownload}
              className="h-6 px-2"
            >
              <Download className="h-3 w-3" />
            </Button>
          </div>
        </div>
      ) : (
        <div className="flex items-center space-x-2 p-3 bg-white/10 rounded-lg border max-w-xs">
          {getFileIcon(name)}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{name}</p>
            <p className="text-xs opacity-70">{formatFileSize(size)}</p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDownload}
            className="h-8 px-2"
          >
            <Download className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
};
