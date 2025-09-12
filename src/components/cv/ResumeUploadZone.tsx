import React, { useState } from 'react';
import { Upload, FileText, AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface ResumeUploadZoneProps {
  userId: string;
  onResumeUploaded: (resume: any) => void;
}

export const ResumeUploadZone = ({ userId, onResumeUploaded }: ResumeUploadZoneProps) => {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [dragOver, setDragOver] = useState(false);

  const handleFileUpload = async (file: File) => {
    setUploading(true);
    setError(null);
    setUploadProgress(0);
    
    try {
      console.log('🔄 Starting file upload:', file.name, file.type, file.size);

      // Validate file type
      const allowedTypes = [
        'application/pdf',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/msword',
        'text/plain'
      ];
      
      const allowedExtensions = ['.pdf', '.docx', '.doc', '.txt'];
      const fileExtension = file.name.toLowerCase().slice(file.name.lastIndexOf('.'));
      
      if (!allowedTypes.includes(file.type) && !allowedExtensions.includes(fileExtension)) {
        throw new Error('Please upload a valid resume (PDF, DOCX, or TXT).');
      }

      // Validate file size (max 10MB)
      const maxSize = 10 * 1024 * 1024; // 10MB
      if (file.size > maxSize) {
        throw new Error('File size must be less than 10MB.');
      }

      if (file.size === 0) {
        throw new Error('Please upload a valid resume (PDF, DOCX, or TXT).');
      }

      setUploadProgress(20);

      // Create unique file path
      const fileName = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
      const filePath = `${userId}/${fileName}`;

      console.log('📤 Uploading to storage:', filePath);

      // Upload to Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('resumes')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) {
        console.error('❌ Storage upload error:', uploadError);
        throw new Error('Upload failed. Please check file format.');
      }

      setUploadProgress(60);
      console.log('✅ File uploaded successfully:', uploadData.path);

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('resumes')
        .getPublicUrl(uploadData.path);

      setUploadProgress(80);

      // Extract text content from file
      let extractedContent = '';
      try {
        if (file.type === 'text/plain') {
          extractedContent = await file.text();
        } else {
          // For PDF/DOCX, we'll let the edge function handle extraction
          extractedContent = 'Content will be extracted during processing';
        }
      } catch (extractError) {
        console.warn('⚠️ Could not extract text locally, will extract server-side:', extractError);
        extractedContent = 'Content extraction pending';
      }

      // Save resume record to database
      const resumeRecord = {
        user_id: userId,
        file_url: publicUrl,
        file_name: file.name,
        file_size: file.size,
        status: 'uploaded'
      };

      console.log('💾 Saving resume record:', resumeRecord);

      const { data: savedResume, error: dbError } = await supabase
        .from('resumes')
        .insert(resumeRecord)
        .select()
        .single();

      if (dbError) {
        console.error('❌ Database save error:', dbError);
        // Try to clean up uploaded file
        await supabase.storage.from('resumes').remove([uploadData.path]);
        throw new Error('Failed to save resume record.');
      }

      setUploadProgress(100);
      console.log('✅ Resume uploaded and saved successfully:', savedResume.id);

      // Prepare resume data with extracted content for compatibility
      const resumeWithContent = {
        ...savedResume,
        content: { text: extractedContent },
        resume_text: extractedContent,
        parsed_content: extractedContent,
        original_filename: file.name
      };

      toast.success(`Resume "${file.name}" uploaded successfully!`);
      onResumeUploaded(resumeWithContent);

    } catch (error) {
      console.error('❌ Upload failed:', error);
      const errorMessage = error instanceof Error 
        ? error.message 
        : 'Upload failed. Please check file format.';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      handleFileUpload(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFileUpload(file);
    }
  };

  return (
    <Card className="w-full">
      <CardContent className="p-6">
        <div
          className={`
            border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all duration-200
            ${dragOver 
              ? 'border-blue-400 bg-blue-50 dark:bg-blue-950/20' 
              : 'border-gray-300 dark:border-gray-600'
            }
            ${uploading ? 'pointer-events-none opacity-60' : 'hover:border-blue-400 hover:bg-gray-50 dark:hover:bg-gray-900'}
          `}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <input 
            type="file"
            accept=".pdf,.docx,.doc,.txt"
            onChange={handleFileChange}
            disabled={uploading}
            className="hidden"
            id="resume-upload"
          />
          
          <div className="space-y-4">
            {uploading ? (
              <>
                <Loader2 className="h-12 w-12 text-blue-500 mx-auto animate-spin" />
                <div className="space-y-2">
                  <p className="text-lg font-medium">Uploading Resume...</p>
                  <Progress value={uploadProgress} className="w-full max-w-xs mx-auto" />
                  <p className="text-sm text-gray-600">{uploadProgress}%</p>
                </div>
              </>
            ) : (
              <>
                <Upload className="h-12 w-12 text-gray-400 mx-auto" />
                <div>
                  <p className="text-lg font-medium mb-2">
                    {dragOver ? 'Drop your resume here' : 'Upload Your Resume'}
                  </p>
                  <p className="text-gray-600 mb-4">
                    Drag and drop your resume file, or click to browse
                  </p>
                  <Button variant="outline" className="mx-auto" asChild>
                    <label htmlFor="resume-upload">
                      <FileText className="h-4 w-4 mr-2" />
                      Choose File
                    </label>
                  </Button>
                </div>
              </>
            )}
          </div>
        </div>

        {error && (
          <Alert className="mt-4 border-red-200 bg-red-50">
            <AlertCircle className="h-4 w-4 text-red-500" />
            <AlertDescription className="text-red-700">
              {error}
            </AlertDescription>
          </Alert>
        )}

        <div className="mt-6 space-y-2 text-sm text-gray-600">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-green-500" />
            <span>Supported formats: PDF, DOCX, DOC, TXT</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-green-500" />
            <span>Maximum file size: 10MB</span>
          </div>
          <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
            <p className="text-blue-800 dark:text-blue-200 text-sm">
              💡 <strong>Tip:</strong> For best results, upload a resume with clear sections and detailed work experience.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};