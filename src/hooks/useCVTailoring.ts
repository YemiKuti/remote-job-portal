
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const useCVTailoring = () => {
  const [tailoredResumes, setTailoredResumes] = useState<any[]>([]);
  const [sessions, setSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchTailoredResumes = async () => {
    try {
      setLoading(true);
      console.log('🔍 Fetching tailored resumes...');
      
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) {
        console.log('❌ User not authenticated');
        setTailoredResumes([]);
        return;
      }

      // First get the tailored resumes without joins to avoid foreign key issues
      const { data: resumesData, error: resumesError } = await supabase
        .from('tailored_resumes')
        .select('*')
        .eq('user_id', user.user.id)
        .order('created_at', { ascending: false });

      if (resumesError) {
        console.error('❌ Error fetching tailored resumes:', resumesError);
        throw resumesError;
      }

      console.log('✅ Raw tailored resumes fetched:', resumesData?.length || 0);

      // If we have resumes, enrich them with job and resume data
      if (resumesData && resumesData.length > 0) {
        const enrichedResumes = await Promise.all(
          resumesData.map(async (resume) => {
            const enrichedResume = { ...resume, jobs: null, candidate_resumes: null };

            // Fetch job data if job_id exists
            if (resume.job_id) {
              try {
                const { data: jobData } = await supabase
                  .from('jobs')
                  .select('title, company')
                  .eq('id', resume.job_id)
                  .single();
                
                if (jobData) {
                  enrichedResume.jobs = jobData;
                }
              } catch (error) {
                console.warn('Could not fetch job data for resume:', resume.id, error);
              }
            }

            // Fetch resume data if original_resume_id exists
            if (resume.original_resume_id) {
              try {
                const { data: resumeData } = await supabase
                  .from('candidate_resumes')
                  .select('name')
                  .eq('id', resume.original_resume_id)
                  .single();
                
                if (resumeData) {
                  enrichedResume.candidate_resumes = resumeData;
                }
              } catch (error) {
                console.warn('Could not fetch resume data for tailored resume:', resume.id, error);
              }
            }

            return enrichedResume;
          })
        );

        setTailoredResumes(enrichedResumes);
      } else {
        console.log('ℹ️ No tailored resumes found');
        setTailoredResumes([]);
      }
    } catch (error) {
      console.error('Error fetching tailored resumes:', error);
      toast.error('Failed to load tailored resumes');
      setTailoredResumes([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchTailoringSessions = async () => {
    try {
      console.log('🔍 Fetching tailoring sessions...');
      
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) {
        console.log('❌ User not authenticated');
        setSessions([]);
        return;
      }

      // First get the sessions without joins to avoid foreign key issues
      const { data: sessionsData, error: sessionsError } = await supabase
        .from('cv_tailoring_sessions')
        .select('*')
        .eq('user_id', user.user.id)
        .order('created_at', { ascending: false });

      if (sessionsError) {
        console.error('❌ Error fetching tailoring sessions:', sessionsError);
        throw sessionsError;
      }

      console.log('✅ Raw sessions fetched:', sessionsData?.length || 0);

      // If we have sessions, enrich them with job and resume data
      if (sessionsData && sessionsData.length > 0) {
        const enrichedSessions = await Promise.all(
          sessionsData.map(async (session) => {
            const enrichedSession = { ...session, jobs: null, candidate_resumes: null };

            // Fetch job data if job_id exists
            if (session.job_id) {
              try {
                const { data: jobData } = await supabase
                  .from('jobs')
                  .select('title, company')
                  .eq('id', session.job_id)
                  .single();
                
                if (jobData) {
                  enrichedSession.jobs = jobData;
                }
              } catch (error) {
                console.warn('Could not fetch job data for session:', session.id, error);
              }
            }

            // Fetch resume data if original_resume_id exists
            if (session.original_resume_id) {
              try {
                const { data: resumeData } = await supabase
                  .from('candidate_resumes')
                  .select('name')
                  .eq('id', session.original_resume_id)
                  .single();
                
                if (resumeData) {
                  enrichedSession.candidate_resumes = resumeData;
                }
              } catch (error) {
                console.warn('Could not fetch resume data for session:', session.id, error);
              }
            }

            return enrichedSession;
          })
        );

        setSessions(enrichedSessions);
      } else {
        console.log('ℹ️ No tailoring sessions found');
        setSessions([]);
      }
    } catch (error) {
      console.error('Error fetching tailoring sessions:', error);
      toast.error('Failed to load tailoring sessions');
      setSessions([]);
    }
  };

  const createTailoringSession = async (jobId: string, resumeId: string) => {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error('User not authenticated');

      console.log('🔄 Creating tailoring session for job:', jobId, 'resume:', resumeId);

      const { data, error } = await supabase
        .from('cv_tailoring_sessions')
        .insert({
          user_id: user.user.id,
          job_id: jobId,
          original_resume_id: resumeId,
          status: 'in_progress'
        })
        .select()
        .single();

      if (error) {
        console.error('❌ Error creating tailoring session:', error);
        throw error;
      }
      
      console.log('✅ Tailoring session created:', data.id);
      setSessions(prev => [data, ...prev]);
      toast.success('Tailoring session created successfully');
      return data;
    } catch (error) {
      console.error('Error creating tailoring session:', error);
      toast.error('Failed to create tailoring session');
      return null;
    }
  };

  const updateTailoringSession = async (sessionId: string, updates: any) => {
    try {
      console.log('🔄 Updating tailoring session:', sessionId, updates);
      
      const { error } = await supabase
        .from('cv_tailoring_sessions')
        .update(updates)
        .eq('id', sessionId);

      if (error) {
        console.error('❌ Error updating tailoring session:', error);
        throw error;
      }
      
      setSessions(prev => 
        prev.map(session => 
          session.id === sessionId ? { ...session, ...updates } : session
        )
      );
      
      console.log('✅ Tailoring session updated');
      toast.success('Session updated successfully');
    } catch (error) {
      console.error('Error updating tailoring session:', error);
      toast.error('Failed to update session');
    }
  };

  const deleteTailoredResume = async (resumeId: string) => {
    try {
      console.log('🗑️ Deleting tailored resume:', resumeId);
      
      const { error } = await supabase
        .from('tailored_resumes')
        .delete()
        .eq('id', resumeId);

      if (error) {
        console.error('❌ Error deleting tailored resume:', error);
        throw error;
      }
      
      setTailoredResumes(prev => prev.filter(resume => resume.id !== resumeId));
      console.log('✅ Tailored resume deleted');
      toast.success('Tailored resume deleted successfully');
    } catch (error) {
      console.error('Error deleting tailored resume:', error);
      toast.error('Failed to delete tailored resume');
    }
  };

  useEffect(() => {
    fetchTailoredResumes();
    fetchTailoringSessions();
  }, []);

  return {
    tailoredResumes,
    sessions,
    loading,
    fetchTailoredResumes,
    fetchTailoringSessions,
    createTailoringSession,
    updateTailoringSession,
    deleteTailoredResume,
  };
};
