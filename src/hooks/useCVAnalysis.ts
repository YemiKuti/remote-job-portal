
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface CVAnalysis {
  id: string;
  user_id: string;
  resume_id: string;
  extracted_skills: string[];
  extracted_experience: string[];
  industry_keywords: string[];
  experience_level: string;
  analysis_data: any;
  created_at: string;
  updated_at: string;
}

interface JobRecommendation {
  id: string;
  user_id: string;
  cv_analysis_id: string;
  job_id: string;
  match_score: number;
  matching_keywords: string[];
  recommendation_reason: string;
  created_at: string;
  job?: any; // Will be populated with job details
}

export const useCVAnalysis = () => {
  const [analyses, setAnalyses] = useState<CVAnalysis[]>([]);
  const [recommendations, setRecommendations] = useState<JobRecommendation[]>([]);
  const [loading, setLoading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);

  const fetchAnalyses = async () => {
    try {
      setLoading(true);
      console.log('🔍 Fetching CV analyses...');
      
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) {
        console.log('❌ User not authenticated');
        setAnalyses([]);
        return;
      }

      const { data, error } = await supabase
        .from('cv_analysis')
        .select('*')
        .eq('user_id', user.user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ Error fetching CV analyses:', error);
        throw error;
      }

      console.log('✅ CV analyses fetched:', data?.length || 0);
      setAnalyses(data || []);
    } catch (error) {
      console.error('Error fetching CV analyses:', error);
      toast.error('Failed to load CV analyses');
    } finally {
      setLoading(false);
    }
  };

  const fetchRecommendations = async (cvAnalysisId?: string) => {
    try {
      console.log('🔍 Fetching job recommendations...');
      
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) {
        console.log('❌ User not authenticated');
        setRecommendations([]);
        return;
      }

      let query = supabase
        .from('job_recommendations')
        .select(`
          *,
          jobs (*)
        `)
        .eq('user_id', user.user.id)
        .order('match_score', { ascending: false });

      if (cvAnalysisId) {
        query = query.eq('cv_analysis_id', cvAnalysisId);
      }

      const { data, error } = await query;

      if (error) {
        console.error('❌ Error fetching job recommendations:', error);
        throw error;
      }

      console.log('✅ Job recommendations fetched:', data?.length || 0);
      setRecommendations(data || []);
    } catch (error) {
      console.error('Error fetching job recommendations:', error);
      toast.error('Failed to load job recommendations');
    }
  };

  const analyzeCV = async (resumeId: string, resumeContent: string) => {
    setAnalyzing(true);
    
    try {
      console.log('🔄 Starting CV analysis for resume:', resumeId);

      const { data, error } = await supabase.functions.invoke('analyze-cv', {
        body: {
          resumeId,
          resumeContent
        }
      });

      if (error) {
        console.error('❌ CV analysis error:', error);
        throw new Error('CV analysis failed. Please try again.');
      }

      console.log('✅ CV analysis completed:', data);
      toast.success(`CV analyzed successfully! Found ${data.recommendationsCount} job matches.`);
      
      // Refresh data
      await fetchAnalyses();
      await fetchRecommendations();
      
      return data;
    } catch (error) {
      console.error('Error analyzing CV:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to analyze CV');
      throw error;
    } finally {
      setAnalyzing(false);
    }
  };

  const deleteAnalysis = async (analysisId: string) => {
    try {
      console.log('🗑️ Deleting CV analysis:', analysisId);
      
      const { error } = await supabase
        .from('cv_analysis')
        .delete()
        .eq('id', analysisId);

      if (error) {
        console.error('❌ Error deleting CV analysis:', error);
        throw error;
      }
      
      setAnalyses(prev => prev.filter(analysis => analysis.id !== analysisId));
      console.log('✅ CV analysis deleted');
      toast.success('CV analysis deleted successfully');
    } catch (error) {
      console.error('Error deleting CV analysis:', error);
      toast.error('Failed to delete CV analysis');
    }
  };

  useEffect(() => {
    fetchAnalyses();
    fetchRecommendations();
  }, []);

  return {
    analyses,
    recommendations,
    loading,
    analyzing,
    fetchAnalyses,
    fetchRecommendations,
    analyzeCV,
    deleteAnalysis,
  };
};
