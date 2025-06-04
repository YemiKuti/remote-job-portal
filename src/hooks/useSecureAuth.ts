
import { useState, useEffect } from 'react';
import { useAuth } from '@/components/AuthProvider';
import { supabase } from '@/integrations/supabase/client';
import { checkRateLimit } from '@/utils/security';
import { toast } from 'sonner';

interface SecureAuthState {
  isAdmin: boolean;
  adminVerified: boolean;
  loginAttempts: number;
  accountLocked: boolean;
}

export const useSecureAuth = () => {
  const { user, session } = useAuth();
  const [secureState, setSecureState] = useState<SecureAuthState>({
    isAdmin: false,
    adminVerified: false,
    loginAttempts: 0,
    accountLocked: false
  });

  // Verify admin status using the database function
  const verifyAdminStatus = async () => {
    if (!user || !session) {
      setSecureState(prev => ({ ...prev, isAdmin: false, adminVerified: false }));
      return false;
    }

    try {
      const { data, error } = await supabase.functions.invoke('is_admin', {
        headers: {
          Authorization: `Bearer ${session.access_token}`
        }
      });

      if (error) {
        console.error('Admin verification error:', error);
        setSecureState(prev => ({ ...prev, isAdmin: false, adminVerified: false }));
        return false;
      }

      const isAdmin = data?.isAdmin === true;
      setSecureState(prev => ({ ...prev, isAdmin, adminVerified: true }));
      return isAdmin;
    } catch (error) {
      console.error('Admin verification failed:', error);
      setSecureState(prev => ({ ...prev, isAdmin: false, adminVerified: false }));
      return false;
    }
  };

  const secureSignIn = async (email: string, password: string) => {
    const rateLimitKey = `login_${email}`;
    
    if (!checkRateLimit(rateLimitKey, 5, 15 * 60 * 1000)) {
      setSecureState(prev => ({ ...prev, accountLocked: true }));
      toast.error("Too many login attempts. Please try again in 15 minutes.");
      return { error: "Rate limit exceeded" };
    }

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        setSecureState(prev => ({ 
          ...prev, 
          loginAttempts: prev.loginAttempts + 1 
        }));
        
        // Generic error message to prevent user enumeration
        toast.error("Invalid credentials. Please try again.");
        return { error: "Authentication failed" };
      }

      // Reset login attempts on successful login
      setSecureState(prev => ({ ...prev, loginAttempts: 0, accountLocked: false }));
      return { data, error: null };
    } catch (error) {
      console.error('Sign in error:', error);
      return { error: "Authentication failed" };
    }
  };

  useEffect(() => {
    if (user && session) {
      verifyAdminStatus();
    }
  }, [user, session]);

  return {
    ...secureState,
    verifyAdminStatus,
    secureSignIn
  };
};
