
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
      const { data, error } = await supabase
        .from('tailored_resumes')
        .select(`
          *,
          jobs:job_id(title, company),
          candidate_resumes:original_resume_id(name)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTailoredResumes(data || []);
    } catch (error) {
      console.error('Error fetching tailored resumes:', error);
      toast.error('Failed to load tailored resumes');
    } finally {
      setLoading(false);
    }
  };

  const fetchTailoringSessions = async () => {
    try {
      const { data, error } = await supabase
        .from('cv_tailoring_sessions')
        .select(`
          *,
          jobs:job_id(title, company),
          candidate_resumes:original_resume_id(name)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setSessions(data || []);
    } catch (error) {
      console.error('Error fetching tailoring sessions:', error);
      toast.error('Failed to load tailoring sessions');
    }
  };

  const createTailoringSession = async (jobId: string, resumeId: string) => {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error('User not authenticated');

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

      if (error) throw error;
      
      setSessions(prev => [data, ...prev]);
      return data;
    } catch (error) {
      console.error('Error creating tailoring session:', error);
      toast.error('Failed to create tailoring session');
      return null;
    }
  };

  const updateTailoringSession = async (sessionId: string, updates: any) => {
    try {
      const { error } = await supabase
        .from('cv_tailoring_sessions')
        .update(updates)
        .eq('id', sessionId);

      if (error) throw error;
      
      setSessions(prev => 
        prev.map(session => 
          session.id === sessionId ? { ...session, ...updates } : session
        )
      );
    } catch (error) {
      console.error('Error updating tailoring session:', error);
      toast.error('Failed to update session');
    }
  };

  const deleteTailoredResume = async (resumeId: string) => {
    try {
      const { error } = await supabase
        .from('tailored_resumes')
        .delete()
        .eq('id', resumeId);

      if (error) throw error;
      
      setTailoredResumes(prev => prev.filter(resume => resume.id !== resumeId));
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
