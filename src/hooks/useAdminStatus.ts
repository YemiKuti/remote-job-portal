
import { useState, useEffect } from 'react';
import { useAuth } from '@/components/AuthProvider';
import { supabase } from '@/integrations/supabase/client';

export const useAdminStatus = () => {
  const { user, session } = useAuth();
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const checkAdminStatus = async () => {
      if (!user || !session) {
        setIsAdmin(false);
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase.rpc('is_admin');
        if (error) {
          const msg = error?.message || 'Unknown error';
          let hint = 'Check Supabase URL and anon key; verify internet connectivity.';
          if (/Failed to fetch|NetworkError|TypeError/i.test(msg)) hint = 'Network error: Could not reach Supabase (check internet/CORS).';
          if (/401|invalid token|JWT/i.test(msg)) hint = 'Auth error: Invalid anon key or expired session token.';
          if (/permission|rls|policy/i.test(msg)) hint = 'RLS/permission error: User not permitted to call is_admin.';
          console.error('Error checking admin status:', { message: msg, hint, code: (error as any)?.code || '' });
          setIsAdmin(false);
        } else {
          setIsAdmin(data === true);
        }
      } catch (err: any) {
        const msg = err?.message || String(err);
        console.error('Error checking admin status:', { message: msg, hint: 'Unexpected error calling Supabase.' });
        setIsAdmin(false);
      } finally {
        setLoading(false);
      }
    };

    checkAdminStatus();
  }, [user, session]);

  return { isAdmin, loading };
};
