
import { useState, useEffect } from 'react';
import { useAuth } from '@/components/AuthProvider';
import { supabase } from '@/integrations/supabase/client';

export function useUserAvatar(userId?: string) {
  const { user } = useAuth();
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  const targetUserId = userId || user?.id;

  useEffect(() => {
    const fetchAvatar = async () => {
      if (!targetUserId) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        
        // First try to get from profiles table
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('avatar_url')
          .eq('id', targetUserId)
          .single();

        if (profileError && profileError.code !== 'PGRST116') {
          console.error('Error fetching profile avatar:', profileError);
        }

        // Priority: profiles.avatar_url → user_metadata.avatar_url → null
        let finalAvatarUrl = null;
        
        if (profileData?.avatar_url) {
          finalAvatarUrl = profileData.avatar_url;
        } else if (user?.user_metadata?.avatar_url && targetUserId === user.id) {
          finalAvatarUrl = user.user_metadata.avatar_url;
        }

        setAvatarUrl(finalAvatarUrl);
      } catch (error) {
        console.error('Error in useUserAvatar:', error);
        setAvatarUrl(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAvatar();
  }, [targetUserId, user?.user_metadata?.avatar_url]);

  // Refresh function to force update
  const refreshAvatar = async () => {
    if (!targetUserId) return;
    
    try {
      const { data: profileData } = await supabase
        .from('profiles')
        .select('avatar_url')
        .eq('id', targetUserId)
        .single();

      if (profileData?.avatar_url) {
        setAvatarUrl(profileData.avatar_url);
      } else if (user?.user_metadata?.avatar_url && targetUserId === user.id) {
        setAvatarUrl(user.user_metadata.avatar_url);
      } else {
        setAvatarUrl(null);
      }
    } catch (error) {
      console.error('Error refreshing avatar:', error);
    }
  };

  return {
    avatarUrl,
    isLoading,
    refreshAvatar
  };
}
