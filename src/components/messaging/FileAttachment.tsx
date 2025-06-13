
import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { Paperclip, X, Upload, File, Image, FileText } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/components/AuthProvider';

interface FileAttachmentProps {
  onFileUploaded: (url: string, name: string, size: number) => void;
  onRemove: () => void;
  attachment?: {
    url: string;
    name: string;
    size: number;
  } | null;
  disabled?: boolean;
}

export const FileAttachment = ({ onFileUploaded, onRemove, attachment, disabled }: FileAttachmentProps) => {
  const { user } = useAuth();
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const handleFileSelect = async (file: File) => {
    if (!file || !user) return;

    // Validate file size (10MB max)
    if (file.size > 10 * 1024 * 1024) {
      toast.error('File size must be less than 10MB');
      return;
    }

    setUploading(true);
    try {
      // Generate unique filename with user folder structure
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}.${fileExt}`;
      const filePath = `${user.id}/${fileName}`;

      // Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('message-attachments')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data } = supabase.storage
        .from('message-attachments')
        .getPublicUrl(filePath);

      onFileUploaded(data.publicUrl, file.name, file.size);
      toast.success('File uploaded successfully');
    } catch (error) {
      console.error('Error uploading file:', error);
      toast.error('Failed to upload file');
    } finally {
      setUploading(false);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  if (attachment) {
    return (
      <div className="flex items-center space-x-2 p-2 bg-gray-50 rounded-md border">
        {getFileIcon(attachment.name)}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium truncate">{attachment.name}</p>
          <p className="text-xs text-muted-foreground">{formatFileSize(attachment.size)}</p>
        </div>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={onRemove}
          disabled={disabled}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    );
  }

  return (
    <>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => fileInputRef.current?.click()}
        disabled={disabled || uploading}
      >
        {uploading ? (
          <Upload className="h-4 w-4 animate-spin" />
        ) : (
          <Paperclip className="h-4 w-4" />
        )}
      </Button>
      <input
        ref={fileInputRef}
        type="file"
        onChange={handleFileInput}
        className="hidden"
        disabled={disabled || uploading}
        accept="image/*,.pdf,.doc,.docx,.txt"
      />
    </>
  );
};
