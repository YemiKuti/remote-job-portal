
import React, { useState, useRef } from 'react';
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Upload, FileText, Download, Trash2, Eye, Plus } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

interface Resume {
  id: string;
  name: string;
  file_path: string;
  file_size: number;
  created_at: string;
  is_default: boolean;
}

interface ResumeManagementCardProps {
  userId: string;
}

export function ResumeManagementCard({ userId }: ResumeManagementCardProps) {
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    fetchResumes();
  }, [userId]);

  const fetchResumes = async () => {
    try {
      const { data, error } = await supabase
        .from('candidate_resumes')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setResumes(data || []);
    } catch (error) {
      console.error('Error fetching resumes:', error);
      toast.error('Failed to load resumes');
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (!allowedTypes.includes(file.type)) {
      toast.error('Please upload a PDF, DOC, or DOCX file');
      return;
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size must be less than 5MB');
      return;
    }

    setUploading(true);
    try {
      // Upload file to Supabase Storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${userId}-${Date.now()}.${fileExt}`;
      const filePath = `resumes/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('documents')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Save resume record to database
      const { error: dbError } = await supabase
        .from('candidate_resumes')
        .insert({
          user_id: userId,
          name: file.name,
          file_path: filePath,
          file_size: file.size,
          is_default: resumes.length === 0 // First resume is default
        });

      if (dbError) throw dbError;

      toast.success('Resume uploaded successfully');
      fetchResumes();
    } catch (error) {
      console.error('Error uploading resume:', error);
      toast.error('Failed to upload resume');
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleSetDefault = async (resumeId: string) => {
    try {
      // Remove default from all resumes
      await supabase
        .from('candidate_resumes')
        .update({ is_default: false })
        .eq('user_id', userId);

      // Set new default
      const { error } = await supabase
        .from('candidate_resumes')
        .update({ is_default: true })
        .eq('id', resumeId);

      if (error) throw error;

      toast.success('Default resume updated');
      fetchResumes();
    } catch (error) {
      console.error('Error setting default resume:', error);
      toast.error('Failed to update default resume');
    }
  };

  const handleDownload = async (resume: Resume) => {
    try {
      const { data, error } = await supabase.storage
        .from('documents')
        .download(resume.file_path);

      if (error) throw error;

      const url = URL.createObjectURL(data);
      const a = document.createElement('a');
      a.href = url;
      a.download = resume.name;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading resume:', error);
      toast.error('Failed to download resume');
    }
  };

  const handleDelete = async (resumeId: string, filePath: string) => {
    if (!confirm('Are you sure you want to delete this resume?')) return;

    try {
      // Delete from storage
      await supabase.storage
        .from('documents')
        .remove([filePath]);

      // Delete from database
      const { error } = await supabase
        .from('candidate_resumes')
        .delete()
        .eq('id', resumeId);

      if (error) throw error;

      toast.success('Resume deleted successfully');
      fetchResumes();
    } catch (error) {
      console.error('Error deleting resume:', error);
      toast.error('Failed to delete resume');
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Resume/CV Management</CardTitle>
          <CardDescription>Loading...</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Resume/CV Management</CardTitle>
        <CardDescription>
          Upload and manage your resumes. You can have multiple versions for different job applications.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Upload Section */}
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
          <Upload className="h-8 w-8 mx-auto text-gray-400 mb-2" />
          <p className="text-sm text-gray-600 mb-2">
            Upload your resume (PDF, DOC, DOCX - Max 5MB)
          </p>
          <Button 
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="mb-2"
          >
            <Plus className="h-4 w-4 mr-2" />
            {uploading ? 'Uploading...' : 'Choose File'}
          </Button>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept=".pdf,.doc,.docx"
            className="hidden"
          />
        </div>

        {/* Resumes List */}
        {resumes.length > 0 ? (
          <div className="space-y-3">
            <h4 className="font-medium">Your Resumes</h4>
            {resumes.map((resume) => (
              <div key={resume.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center space-x-3">
                  <FileText className="h-8 w-8 text-blue-500" />
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-medium">{resume.name}</span>
                      {resume.is_default && (
                        <Badge variant="secondary">Default</Badge>
                      )}
                    </div>
                    <div className="text-sm text-gray-500">
                      {formatFileSize(resume.file_size)} • {new Date(resume.created_at).toLocaleDateString()}
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  {!resume.is_default && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleSetDefault(resume.id)}
                    >
                      Set Default
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDownload(resume)}
                  >
                    <Download className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(resume.id, resume.file_path)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <FileText className="h-12 w-12 mx-auto text-gray-400 mb-2" />
            <p className="text-gray-500">No resumes uploaded yet</p>
            <p className="text-sm text-gray-400">Upload your first resume to get started</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
