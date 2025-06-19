
import React, { useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Upload, Plus } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { extractResumeContent } from '@/utils/resumeProcessor';

interface ResumeUploadZoneProps {
  userId: string;
  onResumeUploaded: (resume: any) => void;
}

export function ResumeUploadZone({ userId, onResumeUploaded }: ResumeUploadZoneProps) {
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (file: File) => {
    if (!file) return;

    // Validate file type
    const allowedTypes = [
      'application/pdf', 
      'application/msword', 
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain'
    ];
    
    if (!allowedTypes.includes(file.type)) {
      toast.error('Please upload a PDF, DOC, DOCX, or TXT file');
      return;
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size must be less than 5MB');
      return;
    }

    setUploading(true);
    try {
      // Extract resume content and candidate data
      console.log('📄 Extracting resume content...');
      const resumeContent = await extractResumeContent(file);

      // Upload file to documents bucket
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `${userId}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('documents')
        .upload(filePath, file, {
          upsert: false,
          cacheControl: '3600'
        });

      if (uploadError) {
        console.error('Upload error:', uploadError);
        throw new Error(`Upload failed: ${uploadError.message}`);
      }

      // Convert candidate data to JSON-compatible format
      const candidateDataJson = JSON.parse(JSON.stringify(resumeContent.candidateData));

      // Save resume record to database with extracted candidate data
      const { data: resume, error: dbError } = await supabase
        .from('candidate_resumes')
        .insert({
          user_id: userId,
          name: file.name,
          file_path: filePath,
          file_size: file.size,
          is_default: false,
          candidate_data: candidateDataJson,
          extracted_content: resumeContent.text
        })
        .select()
        .single();

      if (dbError) {
        console.error('Database error:', dbError);
        // Clean up uploaded file if database insert fails
        await supabase.storage.from('documents').remove([filePath]);
        throw new Error(`Database error: ${dbError.message}`);
      }

      console.log('✅ Resume uploaded with candidate data:', resumeContent.candidateData);
      toast.success('Resume uploaded and processed successfully');
      onResumeUploaded(resume);
    } catch (error: any) {
      console.error('Error uploading resume:', error);
      toast.error(error.message || 'Failed to upload resume');
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

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
    <div
      className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
        dragOver
          ? 'border-blue-500 bg-blue-50'
          : 'border-gray-300 hover:border-gray-400'
      }`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <Upload className="h-12 w-12 mx-auto text-gray-400 mb-4" />
      <div className="space-y-2">
        <h3 className="text-lg font-medium">Upload Your Resume</h3>
        <p className="text-gray-600">
          Drag and drop your resume here, or click to browse
        </p>
        <p className="text-sm text-gray-500">
          Supports PDF, DOC, DOCX, TXT (Max 5MB)
        </p>
        {uploading && (
          <p className="text-sm text-blue-600">
            Processing resume and extracting candidate information...
          </p>
        )}
      </div>
      
      <Button 
        onClick={() => fileInputRef.current?.click()}
        disabled={uploading}
        className="mt-4"
      >
        <Plus className="h-4 w-4 mr-2" />
        {uploading ? 'Processing...' : 'Choose File'}
      </Button>
      
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept=".pdf,.doc,.docx,.txt"
        className="hidden"
      />
    </div>
  );
}
