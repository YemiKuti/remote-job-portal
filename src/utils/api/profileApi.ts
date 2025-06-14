
import { supabase } from '@/integrations/supabase/client';

export interface Resume {
  id: string;
  name: string;
  file_path: string;
  file_size: number;
  created_at: string;
  is_default: boolean;
}

export interface PublicProfileData {
  id: string;
  username?: string;
  full_name?: string;
  avatar_url?: string;
  title?: string;
  bio?: string;
  skills?: string;
  experience?: number;
  location?: string;
  website?: string;
  // Add other public fields as needed from the 'profiles' table
}

export const fetchPublicProfileById = async (userId: string): Promise<PublicProfileData | null> => {
  console.log(`🔄 Fetching public profile for user ID: ${userId}`);
  const { data, error } = await supabase
    .from('profiles')
    .select('id, username, full_name, avatar_url, title, bio, skills, experience, location, website')
    .eq('id', userId)
    .single();

  if (error) {
    console.error('❌ Error fetching public profile:', error);
    // PGRST116 is 'No rows found'
    if (error.code === 'PGRST116') { 
        console.warn(`No profile found for user ID: ${userId}`);
        return null;
    }
    throw error;
  }
  if (!data) {
    console.warn(`No profile data returned for user ID: ${userId}`);
    return null;
  }
  console.log('✅ Fetched public profile data:', data);
  return data as PublicProfileData;
};

export const fetchCandidateResumes = async (userId: string): Promise<Resume[]> => {
  console.log(`🔄 Fetching resumes for user ID: ${userId}`);
  const { data, error } = await supabase
    .from('candidate_resumes')
    .select('id, name, file_path, file_size, created_at, is_default')
    .eq('user_id', userId)
    .order('is_default', { ascending: false })
    .order('created_at', { ascending: false });

  if (error) {
    console.error('❌ Error fetching resumes:', error);
    return [];
  }
  
  console.log('✅ Fetched resumes:', data);
  return data || [];
};
