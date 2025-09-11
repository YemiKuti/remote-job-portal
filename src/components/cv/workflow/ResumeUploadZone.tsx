
import React, { useCallback, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Upload, FileText, AlertCircle, CheckCircle, Loader2 } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { extractResumeContent } from '@/utils/resumeProcessor';

interface ResumeUploadZoneProps {
  userId: string;
  onResumeUploaded: (resume: any) => void;
}

export function ResumeUploadZone({ userId, onResumeUploaded }: ResumeUploadZoneProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState<string>('');
  const [dragOver, setDragOver] = useState(false);

  const handleFileUpload = useCallback(async (file: File) => {
    if (!file) return;

    setUploading(true);
    setError(null);
    setUploadProgress('Validating file...');

    try {
      // Enhanced file validation
      const fileName = file.name.toLowerCase();
      const supportedFormats = ['.pdf', '.doc', '.docx', '.txt'];
      const isSupported = supportedFormats.some(format => fileName.endsWith(format));
      
      if (!isSupported) {
        throw new Error('Please upload a PDF, DOC, DOCX, or TXT file.');
      }

      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        throw new Error('File is too large. Please upload a file smaller than 10MB.');
      }

      // Validate minimum file size
      if (file.size < 1024) {
        throw new Error('File is too small. Please upload a resume with more content.');
      }

      setUploadProgress('Extracting resume content...');
      
      // Extract content from the resume with enhanced error handling
      let resumeContent;
      try {
        resumeContent = await extractResumeContent(file);
      } catch (extractError: any) {
        console.error('Content extraction error:', extractError);
        throw new Error(extractError.message || 'Unable to read resume content.');
      }

      setUploadProgress('Uploading to storage...');

      // Upload file to Supabase storage
      const fileName_unique = `${Date.now()}-${file.name}`;
      const filePath = `${userId}/${fileName_unique}`;

      const { error: uploadError } = await supabase.storage
        .from('documents')
        .upload(filePath, file, {
          upsert: false,
          cacheControl: '3600'
        });

      if (uploadError) {
        throw new Error(`Upload failed: ${uploadError.message}`);
      }

      setUploadProgress('Saving resume data...');

      // Convert candidate data to JSON-compatible format
      const candidateDataJson = JSON.parse(JSON.stringify(resumeContent.candidateData));

      // Save resume record to database
      const { data: savedResume, error: saveError } = await supabase
        .from('candidate_resumes')
        .insert({
          user_id: userId,
          name: file.name,
          file_path: filePath,
          file_size: file.size,
          extracted_content: resumeContent.text,
          candidate_data: candidateDataJson,
          is_default: false
        })
        .select()
        .single();

      if (saveError) {
        // Clean up uploaded file if database insert fails
        await supabase.storage.from('documents').remove([filePath]);
        throw new Error(`Failed to save resume: ${saveError.message}`);
      }

      // Enhance the resume object with content for immediate use
      const enhancedResume = {
        ...savedResume,
        content: resumeContent,
        resume_text: resumeContent.text,
        parsed_content: resumeContent.text,
        original_filename: file.name,
        sections: resumeContent.sections
      };

      console.log('✅ Resume uploaded successfully:', {
        id: savedResume.id,
        name: file.name,
        contentLength: resumeContent.text.length,
        hasPersonalInfo: !!resumeContent.candidateData.personalInfo
      });

      onResumeUploaded(enhancedResume);
      toast.success('Resume uploaded and processed successfully!');

    } catch (error: any) {
      console.error('❌ Resume upload error:', error);
      setError(error.message || 'Failed to upload resume');
      toast.error(error.message || 'Failed to upload resume');
    } finally {
      setUploading(false);
      setUploadProgress('');
    }
  }, [userId, onResumeUploaded]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      handleFileUpload(file);
    }
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setDragOver(false);
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setDragOver(false);
    
    const file = event.dataTransfer.files[0];
    if (file) {
      handleFileUpload(file);
    }
  };

  return (
    <div className="space-y-4">
      <div
        className={`
          border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
          ${dragOver ? 'border-blue-400 bg-blue-50' : 'border-gray-300'}
          ${uploading ? 'opacity-50 cursor-not-allowed' : 'hover:border-blue-400 hover:bg-blue-50'}
        `}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => !uploading && document.getElementById('file-input')?.click()}
      >
        <div className="space-y-4">
          {uploading ? (
            <div className="flex flex-col items-center gap-2">
              <Loader2 className="h-12 w-12 animate-spin text-blue-500" />
              <div className="text-sm font-medium">{uploadProgress}</div>
            </div>
          ) : (
            <Upload className="h-12 w-12 text-gray-400 mx-auto" />
          )}
          
          <div>
            <p className="text-lg font-medium text-gray-700">
              {dragOver
                ? 'Drop your resume here...'
                : 'Drop your resume here, or click to browse'
              }
            </p>
            <p className="text-sm text-gray-500 mt-2">
              Supports PDF, DOC, DOCX, and TXT files (max 10MB)
            </p>
          </div>
          
          {!uploading && (
            <Button type="button" variant="outline" disabled={uploading}>
              <FileText className="h-4 w-4 mr-2" />
              Choose File
            </Button>
          )}
        </div>
      </div>

      <input
        id="file-input"
        type="file"
        onChange={handleFileChange}
        accept=".pdf,.doc,.docx,.txt"
        className="hidden"
      />

      {error && (
        <Alert className="border-red-200 bg-red-50">
          <AlertCircle className="h-4 w-4 text-red-500" />
          <AlertDescription className="text-red-700">
            {error}
          </AlertDescription>
        </Alert>
      )}

      <div className="text-sm text-gray-600 space-y-2">
        <p className="font-medium">📋 Supported Formats:</p>
        <ul className="list-disc list-inside space-y-1 text-sm">
          <li><strong>PDF (.pdf)</strong> - Most common format (text extraction available)</li>
          <li><strong>Word Document (.docx)</strong> - Good compatibility</li>
          <li><strong>Legacy Word (.doc)</strong> - Limited support</li>
          <li><strong>Plain Text (.txt)</strong> - Recommended for best results</li>
        </ul>
        <p className="text-xs text-gray-500 mt-2">
          💡 <strong>Tip:</strong> For optimal CV tailoring, save your resume as a .txt file to ensure all content is properly extracted.
        </p>
      </div>
    </div>
  );
}
