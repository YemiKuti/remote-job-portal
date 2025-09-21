
import React, { useCallback, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Upload, FileText, AlertCircle, CheckCircle, Loader2 } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { extractResumeContent } from '@/utils/enhancedResumeProcessor';

interface ResumeUploadZoneProps {
  userId: string;
  onResumeUploaded: (resume: any) => void;
}

export function ResumeUploadZone({ userId, onResumeUploaded }: ResumeUploadZoneProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState<string>('');
  const [dragOver, setDragOver] = useState(false);

  // Enhanced error message mapping
  const getErrorMessage = (error: any): string => {
    const message = error.message || error.toString();
    
    // Handle structured error codes from backend
    if (error.errorCode) {
      switch (error.errorCode) {
        case 'RESUME_EMPTY_OR_UNREADABLE':
          return 'Your resume seems empty or unreadable. Please upload a DOCX, TXT, or text-based PDF (not a scanned template).';
        case 'FILE_EMPTY':
          return 'Your resume seems empty or unreadable. Please upload a DOCX, TXT, or text-based PDF (not a scanned template).';
        case 'PDF_NO_TEXT_CONTENT':
          return 'Your resume seems empty or unreadable. Please upload a DOCX, TXT, or text-based PDF (not a scanned template).';
        case 'PDF_PROCESSING_ERROR':
          return 'We could not read the full document. Please try uploading in DOCX format.';
        case 'FILE_TOO_LARGE':
          return 'Your file is too large. Please upload a resume under 5MB.';
        case 'FILE_TOO_SMALL':
          return 'Your resume seems empty or unreadable. Please upload a DOCX, TXT, or text-based PDF (not a scanned template).';
        case 'UNSUPPORTED_ENCODING':
          return 'Your file contains unsupported characters. Please re-save in UTF-8 format and try again.';
        case 'INVALID_FORMAT':
          return 'Your resume seems empty or unreadable. Please upload a DOCX, TXT, or text-based PDF (not a scanned template).';
        case 'CONTENT_TOO_SHORT':
          return 'Your career profile needs at least 3-4 sentences. Include your key skills, achievements, and career goals.';
        case 'CONTENT_TOO_LARGE':
          return 'Your resume is longer than average. We\'ll process the essential content, but for best results, consider shortening less critical sections (like references or older roles).';
        case 'TIMEOUT':
          return 'Processing took too long. Please try with a shorter resume or simpler format.';
        default:
          return error.error || message;
      }
    }
    
    // Legacy error message handling
    if (message.includes('FILE_TOO_LARGE') || message.includes('too large')) {
      return 'Your file is too large. Please upload a resume under 10MB.';
    }
    if (message.includes('UNSUPPORTED_ENCODING') || message.includes('Unicode') || message.includes('encoding')) {
      return 'Your file contains unsupported characters. Please re-save in UTF-8 format and try again.';
    }
    if (message.includes('INVALID_FORMAT') || message.includes('format') || message.includes('supported')) {
      return 'Unsupported file format. Please upload PDF, DOC, DOCX, or TXT.';
    }
    if (message.includes('CONTENT_TOO_SHORT') || message.includes('too short')) {
      return 'Your career profile needs at least 3-4 sentences. Include your key skills, achievements, and career goals.';
    }
    if (message.includes('CONTENT_TOO_LARGE') || message.includes('longer than average') || message.includes('unusually long')) {
      return 'Your resume is longer than average. We\'ll process the essential content, but for best results, consider shortening less critical sections (like references or older roles).';
    }
    
    return message;
  };

  const handleFileUpload = useCallback(async (file: File) => {
    if (!file) return;

    setUploading(true);
    setError(null);
    setUploadProgress('0%');

    try {
      // Enhanced file validation with progress updates
      setUploadProgress('10% - Validating file format...');
      const fileName = file.name.toLowerCase();
      const supportedFormats = ['.pdf', '.doc', '.docx', '.txt'];
      const isSupported = supportedFormats.some(format => fileName.endsWith(format)) || 
                          ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain'].includes(file.type);
      
      if (!isSupported) {
        throw { errorCode: 'INVALID_FORMAT', message: 'Unsupported file format' };
      }

      setUploadProgress('20% - Checking file size...');
      // Check if file is empty or corrupted (0 bytes)
      if (file.size === 0) {
        throw { errorCode: 'FILE_EMPTY', message: 'Your resume file seems to be empty or invalid. Please upload a valid PDF, DOC, DOCX, or TXT file (max 10MB).' };
      }
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        throw { errorCode: 'FILE_TOO_LARGE', message: 'File too large' };
      }

      // Validate minimum file size
      if (file.size < 1024) {
        throw { errorCode: 'RESUME_EMPTY_OR_UNREADABLE', message: 'Your resume seems empty or unreadable. Please upload a DOCX, TXT, or text-based PDF (not a scanned template).' };
      }

      setUploadProgress('30% - Extracting resume content...');
      
      // Extract content from the resume with enhanced error handling
      let resumeContent;
      try {
        resumeContent = await extractResumeContent(file);
        
        // Additional validation for extracted content
        if (!resumeContent.text || resumeContent.text.trim().length < 30) {
          throw { errorCode: 'CONTENT_TOO_SHORT', message: 'Insufficient content extracted' };
        }
        
        setUploadProgress('50% - Content extracted successfully...');
        console.log('✅ Resume content validated:', {
          textLength: resumeContent.text.length,
          hasPersonalInfo: !!resumeContent.candidateData.personalInfo,
          sectionsFound: Object.keys(resumeContent.sections).length
        });
        
      } catch (extractError: any) {
        console.error('Content extraction error:', extractError);
        
        // Handle structured error codes from extraction
        if (extractError.message === 'CONTENT_TOO_SHORT') {
          throw { errorCode: 'CONTENT_TOO_SHORT', message: extractError.message };
        } else if (extractError.message === 'CONTENT_TOO_LARGE') {
          throw { errorCode: 'CONTENT_TOO_LARGE', message: extractError.message };
        } else if (extractError.message === 'UNSUPPORTED_ENCODING') {
          throw { errorCode: 'UNSUPPORTED_ENCODING', message: extractError.message };
        } else if (extractError.message && extractError.message.includes('format')) {
          throw { errorCode: 'INVALID_FORMAT', message: extractError.message };
        } else {
          throw { errorCode: 'PROCESSING_ERROR', message: 'Unable to process resume file' };
        }
      }

      setUploadProgress('70% - Uploading to storage...');

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

      setUploadProgress('90% - Saving resume data...');

      // Convert candidate data to JSON-compatible format with Unicode sanitization
      let candidateDataJson;
      try {
        const candidateDataString = JSON.stringify(resumeContent.candidateData)
          .replace(/[\u0000-\u001F\u007F-\u009F]/g, ' ') // Remove control characters
          .replace(/[\uFFFD]/g, ' ') // Remove replacement characters
          .replace(/\\u[0-9a-fA-F]{4}/g, ' '); // Remove Unicode escape sequences
        candidateDataJson = JSON.parse(candidateDataString);
      } catch (jsonError) {
        console.warn('JSON serialization issue, using fallback:', jsonError);
        candidateDataJson = {
          personalInfo: {
            name: resumeContent.candidateData.personalInfo?.name || 'Professional',
            email: resumeContent.candidateData.personalInfo?.email || '',
            phone: resumeContent.candidateData.personalInfo?.phone || ''
          }
        };
      }

      // Sanitize extracted content for database storage
      const sanitizedContent = resumeContent.text
        .replace(/[\u0000-\u001F\u007F-\u009F]/g, ' ') // Remove control characters
        .replace(/[\uFFFD]/g, ' ') // Remove replacement characters
        .replace(/\\u[0-9a-fA-F]{4}/g, ' ') // Remove Unicode escape sequences
        .trim();

      // Save resume record to database
      const { data: savedResume, error: saveError } = await supabase
        .from('candidate_resumes')
        .insert({
          user_id: userId,
          name: file.name,
          file_path: filePath,
          file_size: file.size,
          extracted_content: sanitizedContent,
          candidate_data: candidateDataJson,
          is_default: false
        })
        .select()
        .single();

      if (saveError) {
        // Clean up uploaded file if database insert fails
        await supabase.storage.from('documents').remove([filePath]);
        console.error('Database save error:', saveError);
        throw { errorCode: 'DATABASE_ERROR', message: `Failed to save resume: ${saveError.message}` };
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

      setUploadProgress('100% - Upload complete!');
      
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
      const errorMessage = getErrorMessage(error);
      setError(errorMessage);
      toast.error(errorMessage);
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
              {uploadProgress.includes('%') && (
                <div className="w-48 bg-gray-200 rounded-full h-2 mt-2">
                  <div 
                    className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: uploadProgress.match(/(\d+)%/)?.[1] + '%' || '0%' }}
                  />
                </div>
              )}
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
        <div className="border-t pt-2 mt-2">
          <p className="text-xs text-gray-500 flex items-center gap-1">
            💡 <strong>Tip:</strong> For optimal results, save your resume as a .txt file to ensure all content is properly extracted.
          </p>
          <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
            🔤 <strong>Unicode Support:</strong> Files with special characters (accents, symbols) are automatically processed with UTF-8 encoding fallback.
          </p>
        </div>
      </div>
    </div>
  );
}
