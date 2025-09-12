import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { 
  FileText, 
  Download, 
  Trash2, 
  Eye, 
  Calendar, 
  FileCheck, 
  FileX, 
  Loader2,
  Upload,
  RefreshCw
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';

interface MyResumesDashboardProps {
  userId: string;
}

export const MyResumesDashboard = ({ userId }: MyResumesDashboardProps) => {
  const [resumes, setResumes] = useState<any[]>([]);
  const [tailoredResumes, setTailoredResumes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchResumes();
  }, [userId]);

  const fetchResumes = async () => {
    try {
      setLoading(true);
      console.log('🔍 Fetching user resumes and tailored resumes...');

      // Fetch original resumes
      const { data: resumesData, error: resumesError } = await supabase
        .from('resumes')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (resumesError) {
        console.error('❌ Error fetching resumes:', resumesError);
        throw resumesError;
      }

      // Fetch tailored resumes
      const { data: tailoredData, error: tailoredError } = await supabase
        .from('tailored_resumes')
        .select(`
          *,
          candidate_resumes (
            name
          )
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (tailoredError) {
        console.error('❌ Error fetching tailored resumes:', tailoredError);
        // Don't throw here, just log the error
        setTailoredResumes([]);
      } else {
        setTailoredResumes(tailoredData || []);
      }

      setResumes(resumesData || []);
      console.log('✅ Fetched resumes:', resumesData?.length || 0, 'tailored:', tailoredData?.length || 0);
    } catch (error) {
      console.error('❌ Error fetching resumes:', error);
      toast.error('Failed to load resumes');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchResumes();
  };

  const handleDeleteResume = async (resumeId: string) => {
    try {
      console.log('🗑️ Deleting resume:', resumeId);

      const { error } = await supabase
        .from('resumes')
        .delete()
        .eq('id', resumeId)
        .eq('user_id', userId);

      if (error) {
        console.error('❌ Error deleting resume:', error);
        throw error;
      }

      setResumes(prev => prev.filter(resume => resume.id !== resumeId));
      toast.success('Resume deleted successfully');
    } catch (error) {
      console.error('❌ Error deleting resume:', error);
      toast.error('Failed to delete resume');
    }
  };

  const handleDeleteTailoredResume = async (resumeId: string) => {
    try {
      console.log('🗑️ Deleting tailored resume:', resumeId);

      const { error } = await supabase
        .from('tailored_resumes')
        .delete()
        .eq('id', resumeId)
        .eq('user_id', userId);

      if (error) {
        console.error('❌ Error deleting tailored resume:', error);
        throw error;
      }

      setTailoredResumes(prev => prev.filter(resume => resume.id !== resumeId));
      toast.success('Tailored resume deleted successfully');
    } catch (error) {
      console.error('❌ Error deleting tailored resume:', error);
      toast.error('Failed to delete tailored resume');
    }
  };

  const handleDownload = async (resume: any, isTailored = false) => {
    try {
      if (isTailored) {
        // Download tailored resume content as text/PDF
        if (resume.tailored_file_path) {
          // If there's a PDF file, download it
          const { data, error } = await supabase.storage
            .from('tailored-resumes')
            .download(resume.tailored_file_path);

          if (error) throw error;

          const url = URL.createObjectURL(data);
          const a = document.createElement('a');
          a.href = url;
          a.download = `tailored-${resume.job_title || 'resume'}.pdf`;
          a.click();
          URL.revokeObjectURL(url);
        } else if (resume.tailored_content) {
          // Download as text file
          const blob = new Blob([resume.tailored_content], { type: 'text/plain' });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `tailored-${resume.job_title || 'resume'}.txt`;
          a.click();
          URL.revokeObjectURL(url);
        }
        
        // Update download count
        await supabase
          .from('tailored_resumes')
          .update({ download_count: (resume.download_count || 0) + 1 })
          .eq('id', resume.id);
      } else {
        // Download original resume from storage
        if (resume.file_url) {
          const a = document.createElement('a');
          a.href = resume.file_url;
          a.download = resume.file_name;
          a.target = '_blank';
          a.click();
        }
      }
      
      toast.success('Download started');
    } catch (error) {
      console.error('❌ Error downloading resume:', error);
      toast.error('Failed to download resume');
    }
  };

  const handlePreview = (resume: any, isTailored = false) => {
    if (isTailored && resume.tailored_content) {
      // Open tailored content in new window
      const newWindow = window.open('', '_blank');
      if (newWindow) {
        newWindow.document.write(`
          <html>
            <head>
              <title>Tailored Resume Preview</title>
              <style>
                body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; line-height: 1.6; }
                h1 { color: #333; border-bottom: 2px solid #333; padding-bottom: 10px; }
                .meta { background: #f5f5f5; padding: 10px; margin-bottom: 20px; border-left: 4px solid #007bff; }
                .content { white-space: pre-wrap; }
              </style>
            </head>
            <body>
              <h1>Tailored Resume Preview</h1>
              <div class="meta">
                <p><strong>Job Title:</strong> ${resume.job_title || 'N/A'}</p>
                <p><strong>Company:</strong> ${resume.company_name || 'N/A'}</p>
                <p><strong>Tailoring Score:</strong> ${resume.tailoring_score || 0}%</p>
                <p><strong>Created:</strong> ${new Date(resume.created_at).toLocaleDateString()}</p>
              </div>
              <div class="content">${resume.tailored_content.replace(/\n/g, '<br>')}</div>
            </body>
          </html>
        `);
        newWindow.document.close();
      }
    } else if (resume.file_url) {
      // Open original resume in new tab
      window.open(resume.file_url, '_blank');
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      uploaded: { variant: 'default' as const, icon: FileCheck, color: 'text-green-600' },
      processing: { variant: 'secondary' as const, icon: Loader2, color: 'text-blue-600' },
      tailored: { variant: 'default' as const, icon: FileCheck, color: 'text-green-600' },
      failed: { variant: 'destructive' as const, icon: FileX, color: 'text-red-600' }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.uploaded;
    const Icon = config.icon;

    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className={`h-3 w-3 ${config.color} ${status === 'processing' ? 'animate-spin' : ''}`} />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
            <p>Loading your resumes...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                My Resumes
              </CardTitle>
              <CardDescription>
                Manage your uploaded resumes and tailored versions
              </CardDescription>
            </div>
            <Button 
              variant="outline" 
              onClick={handleRefresh} 
              disabled={refreshing}
              className="flex items-center gap-2"
            >
              <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </CardHeader>
      </Card>

      {/* Original Resumes */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Original Resumes ({resumes.length})</h3>
        {resumes.length === 0 ? (
          <Card>
            <CardContent className="text-center py-8">
              <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 mb-4">No resumes uploaded yet</p>
              <p className="text-sm text-gray-500">Upload a resume to get started with AI tailoring</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {resumes.map((resume) => (
              <Card key={resume.id}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h4 className="font-medium truncate" title={resume.file_name}>
                        {resume.file_name}
                      </h4>
                      <p className="text-sm text-gray-500">
                        {(resume.file_size / 1024 / 1024).toFixed(1)} MB
                      </p>
                    </div>
                    {getStatusBadge(resume.status)}
                  </div>

                  <div className="flex items-center gap-2 text-xs text-gray-500 mb-4">
                    <Calendar className="h-3 w-3" />
                    {formatDistanceToNow(new Date(resume.created_at), { addSuffix: true })}
                  </div>

                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => handlePreview(resume)}
                      className="flex-1"
                    >
                      <Eye className="h-3 w-3 mr-1" />
                      Preview
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => handleDownload(resume)}
                    >
                      <Download className="h-3 w-3" />
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="outline" size="sm">
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Resume</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to delete "{resume.file_name}"? This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleDeleteResume(resume.id)}>
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Tailored Resumes */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Tailored Resumes ({tailoredResumes.length})</h3>
        {tailoredResumes.length === 0 ? (
          <Card>
            <CardContent className="text-center py-8">
              <FileCheck className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 mb-4">No tailored resumes yet</p>
              <p className="text-sm text-gray-500">Upload a resume and tailor it for specific job opportunities</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {tailoredResumes.map((resume) => (
              <Card key={resume.id}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h4 className="font-medium truncate" title={resume.job_title}>
                        {resume.job_title || 'Tailored Resume'}
                      </h4>
                      <p className="text-sm text-gray-500">
                        {resume.company_name || 'Unknown Company'}
                      </p>
                    </div>
                    <Badge variant="secondary" className="text-green-600">
                      {resume.tailoring_score || 0}%
                    </Badge>
                  </div>

                  <div className="flex items-center gap-2 text-xs text-gray-500 mb-2">
                    <Calendar className="h-3 w-3" />
                    {formatDistanceToNow(new Date(resume.created_at), { addSuffix: true })}
                  </div>

                  {resume.download_count > 0 && (
                    <div className="flex items-center gap-2 text-xs text-gray-500 mb-4">
                      <Download className="h-3 w-3" />
                      Downloaded {resume.download_count} times
                    </div>
                  )}

                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => handlePreview(resume, true)}
                      className="flex-1"
                    >
                      <Eye className="h-3 w-3 mr-1" />
                      Preview
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => handleDownload(resume, true)}
                    >
                      <Download className="h-3 w-3" />
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="outline" size="sm">
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Tailored Resume</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to delete this tailored resume for "{resume.job_title}"? This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleDeleteTailoredResume(resume.id)}>
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};