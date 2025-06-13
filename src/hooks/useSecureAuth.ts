
import { useState, useEffect } from 'react';
import { useAuth } from '@/components/AuthProvider';
import { supabase } from '@/integrations/supabase/client';
import { checkRateLimit } from '@/utils/security';
import { logSecurityEvent } from '@/utils/securityLogger';
import { toast } from 'sonner';

interface SecureAuthState {
  isAdmin: boolean;
  adminVerified: boolean;
  loginAttempts: number;
  accountLocked: boolean;
  lastActivity: Date | null;
}

export const useSecureAuth = () => {
  const { user, session } = useAuth();
  const [secureState, setSecureState] = useState<SecureAuthState>({
    isAdmin: false,
    adminVerified: false,
    loginAttempts: 0,
    accountLocked: false,
    lastActivity: null
  });

  // Enhanced admin verification with better error handling and timeout protection
  const verifyAdminStatus = async () => {
    if (!user || !session) {
      setSecureState(prev => ({ ...prev, isAdmin: false, adminVerified: false }));
      return false;
    }

    try {
      // Add timeout protection for admin verification
      const verificationPromise = new Promise<boolean>(async (resolve, reject) => {
        try {
          // Log admin verification attempt
          await logSecurityEvent({
            event_type: 'admin_action',
            user_id: user.id,
            details: { action: 'admin_verification_attempt' },
            severity: 'medium'
          });

          // First try direct database call with timeout
          const { data: directResult, error: directError } = await supabase
            .rpc('is_admin');

          if (!directError && directResult === true) {
            console.log('Admin status verified via direct database call');
            
            // Log successful admin verification
            await logSecurityEvent({
              event_type: 'admin_login',
              user_id: user.id,
              details: { 
                verification_method: 'direct_database',
                email: user.email 
              },
              severity: 'high'
            });

            resolve(true);
            return;
          }

          // Fallback to Edge Function
          console.log('Using Edge Function as fallback for admin verification');
          const { data, error } = await supabase.functions.invoke('is_admin', {
            headers: {
              Authorization: `Bearer ${session.access_token}`
            }
          });

          if (error) {
            console.error('Admin verification error:', error);
            
            await logSecurityEvent({
              event_type: 'failed_login',
              user_id: user.id,
              details: { 
                reason: 'admin_verification_failed',
                error: error.message 
              },
              severity: 'medium'
            });

            resolve(false);
            return;
          }

          const isAdmin = data?.isAdmin === true;
          
          if (isAdmin) {
            await logSecurityEvent({
              event_type: 'admin_login',
              user_id: user.id,
              details: { 
                verification_method: 'edge_function',
                email: user.email 
              },
              severity: 'high'
            });
          }

          resolve(isAdmin);
        } catch (error) {
          reject(error);
        }
      });

      // Add timeout protection
      const timeoutPromise = new Promise<boolean>((_, reject) => {
        setTimeout(() => reject(new Error('Admin verification timeout')), 3000);
      });

      const isAdmin = await Promise.race([verificationPromise, timeoutPromise]);

      setSecureState(prev => ({ 
        ...prev, 
        isAdmin, 
        adminVerified: true,
        lastActivity: new Date()
      }));
      return isAdmin;
    } catch (error) {
      console.error('Admin verification failed:', error);
      
      await logSecurityEvent({
        event_type: 'failed_login',
        user_id: user?.id,
        details: { 
          reason: 'admin_verification_exception',
          error: error.message 
        },
        severity: 'high'
      });

      setSecureState(prev => ({ ...prev, isAdmin: false, adminVerified: false }));
      return false;
    }
  };

  const secureSignIn = async (email: string, password: string) => {
    const rateLimitKey = `login_${email}`;
    
    // Enhanced rate limiting with security logging
    if (!checkRateLimit(rateLimitKey, 5, 15 * 60 * 1000)) {
      setSecureState(prev => ({ ...prev, accountLocked: true }));
      
      await logSecurityEvent({
        event_type: 'suspicious_activity',
        details: { 
          reason: 'rate_limit_exceeded',
          email,
          attempts: 5 
        },
        severity: 'high'
      });
      
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
        
        await logSecurityEvent({
          event_type: 'failed_login',
          details: { 
            email,
            reason: error.message,
            attempt_number: secureState.loginAttempts + 1
          },
          severity: 'medium'
        });
        
        // Generic error message to prevent user enumeration
        toast.error("Invalid credentials. Please try again.");
        return { error: "Authentication failed" };
      }

      // Reset login attempts on successful login
      setSecureState(prev => ({ 
        ...prev, 
        loginAttempts: 0, 
        accountLocked: false,
        lastActivity: new Date()
      }));
      
      // Log successful login
      await logSecurityEvent({
        event_type: 'admin_login',
        user_id: data.user?.id,
        details: { 
          email,
          login_method: 'password'
        },
        severity: 'medium'
      });
      
      // Defer admin status verification to avoid blocking
      setTimeout(() => {
        verifyAdminStatus();
      }, 100);
      
      return { data, error: null };
    } catch (error) {
      console.error('Sign in error:', error);
      
      await logSecurityEvent({
        event_type: 'failed_login',
        details: { 
          email,
          reason: 'exception_during_login',
          error: error.message
        },
        severity: 'high'
      });
      
      return { error: "Authentication failed" };
    }
  };

  // Optimized session monitoring for security
  useEffect(() => {
    if (user && session) {
      // Defer admin verification to avoid blocking render
      setTimeout(() => {
        verifyAdminStatus();
      }, 100);
      
      // Update last activity
      setSecureState(prev => ({ ...prev, lastActivity: new Date() }));
      
      // Set up session monitoring with longer intervals to reduce overhead
      const activityInterval = setInterval(() => {
        const now = new Date();
        const lastActivity = secureState.lastActivity;
        
        if (lastActivity && (now.getTime() - lastActivity.getTime()) > 30 * 60 * 1000) {
          // Session timeout after 30 minutes of inactivity
          toast.warning("Session expired due to inactivity");
          supabase.auth.signOut();
        }
      }, 5 * 60 * 1000); // Check every 5 minutes instead of every minute

      return () => clearInterval(activityInterval);
    }
  }, [user, session]);

  // Optimized activity tracking with throttling
  const updateActivity = () => {
    setSecureState(prev => ({ ...prev, lastActivity: new Date() }));
  };

  useEffect(() => {
    // Add activity listeners with throttling
    let lastUpdate = 0;
    const throttledUpdate = () => {
      const now = Date.now();
      if (now - lastUpdate > 60000) { // Throttle to once per minute
        updateActivity();
        lastUpdate = now;
      }
    };

    const events = ['mousedown', 'keypress', 'scroll', 'touchstart'];
    events.forEach(event => {
      document.addEventListener(event, throttledUpdate, { passive: true });
    });

    return () => {
      events.forEach(event => {
        document.removeEventListener(event, throttledUpdate);
      });
    };
  }, []);

  return {
    ...secureState,
    verifyAdminStatus,
    secureSignIn,
    updateActivity
  };
};
