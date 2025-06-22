
import React, { useState, useEffect, createContext, useContext } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  signIn: (email: string, redirect_to?: string) => Promise<void>;
  signOut: () => Promise<void>;
  isLoading: boolean;
  authError: string | null;
  refreshSession: () => Promise<Session | null | undefined>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

// Function to check if current URL contains recovery tokens
const isRecoveryFlow = () => {
  const hash = window.location.hash.substring(1);
  const search = window.location.search.substring(1);
  const hashParams = new URLSearchParams(hash);
  const searchParams = new URLSearchParams(search);
  
  const type = hashParams.get('type') || searchParams.get('type');
  const accessToken = hashParams.get('access_token') || searchParams.get('access_token');
  
  return type === 'recovery' && !!accessToken;
};

// Function to ensure user profile exists (deferred, non-blocking)
const ensureUserProfileDeferred = async (user: User) => {
  try {
    console.log('🔍 Deferred: Checking if profile exists for user:', user.id);
    
    // Check if profile already exists
    const { data: existingProfile, error: checkError } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', user.id)
      .single();

    if (checkError && checkError.code !== 'PGRST116') { // PGRST116 = no rows returned
      console.error('❌ Deferred: Error checking profile:', checkError);
      return;
    }

    if (existingProfile) {
      console.log('✅ Deferred: Profile already exists for user');
      return;
    }

    console.log('⚠️ Deferred: No profile found, creating one...');
    
    // Create profile if it doesn't exist
    const { error: insertError } = await supabase
      .from('profiles')
      .insert({
        id: user.id,
        username: user.user_metadata?.username || user.email?.split('@')[0] || null,
        full_name: user.user_metadata?.full_name || user.user_metadata?.name || null,
        avatar_url: user.user_metadata?.avatar_url || null
      });

    if (insertError) {
      console.error('❌ Deferred: Error creating profile:', insertError);
    } else {
      console.log('✅ Deferred: Profile created successfully');
    }
  } catch (error) {
    console.error('❌ Deferred: Exception in ensureUserProfile:', error);
  }
};

// Session validation - only check if clearly expired
const validateSession = (session: Session | null) => {
  if (!session) return null;
  
  try {
    const now = new Date().getTime() / 1000;
    // Only invalidate if clearly expired (with 5 minute buffer)
    if (session.expires_at && session.expires_at < (now - 300)) {
      console.log('🔐 Session clearly expired, cleaning up');
      return null;
    }
    return session;
  } catch (error) {
    console.error('🔐 Session validation error:', error);
    return null;
  }
};

// Check if this is an explicit logout (within last 5 seconds)
const isRecentExplicitLogout = () => {
  const logoutTimestamp = localStorage.getItem('explicit_logout_timestamp');
  if (!logoutTimestamp) return false;
  
  const timeSinceLogout = Date.now() - parseInt(logoutTimestamp);
  const isRecent = timeSinceLogout < 5000; // 5 seconds
  
  if (!isRecent) {
    // Clean up old logout timestamps
    localStorage.removeItem('explicit_logout_timestamp');
  }
  
  return isRecent;
};

// Selective auth state cleanup - only clear specific keys when explicitly logging out
const cleanupAuthState = () => {
  console.log('🔐 AuthProvider: Cleaning up auth state');
  
  try {
    // Only remove specific auth keys that might cause conflicts
    const keysToRemove = [
      'supabase.auth.token',
      'sb-mmbrvcndxhipaoxysvwr-auth-token'
    ];
    
    keysToRemove.forEach(key => {
      localStorage.removeItem(key);
      if (typeof sessionStorage !== 'undefined') {
        sessionStorage.removeItem(key);
      }
    });
    
    console.log('🔐 AuthProvider: Auth state cleanup completed');
  } catch (error) {
    console.error('🔐 AuthProvider: Error during cleanup:', error);
  }
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    console.log('🔐 AuthProvider: Starting auth initialization');
    let mounted = true;
    let authSubscription: any = null;
    
    const initializeAuth = async () => {
      try {
        // Check for recent explicit logout first
        if (isRecentExplicitLogout()) {
          console.log('🔐 AuthProvider: Recent explicit logout detected, clearing state');
          if (mounted) {
            setSession(null);
            setUser(null);
            setIsLoading(false);
          }
          return;
        }
        
        // Set up auth state listener FIRST to catch all events
        console.log('🔐 AuthProvider: Setting up auth state listener');
        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
          if (!mounted) return;
          
          console.log('🔐 AuthProvider: Auth state changed:', event, session?.user?.email || 'No session');
          
          // Validate session before setting
          const validatedSession = validateSession(session);
          
          setSession(validatedSession);
          setUser(validatedSession?.user ?? null);
          setAuthError(null);
          
          if (event === 'SIGNED_IN' && validatedSession?.user) {
            console.log('🔐 AuthProvider: User signed in successfully');
            
            // Check if this is a recovery flow
            if (isRecoveryFlow()) {
              console.log('🔐 AuthProvider: Recovery flow detected, redirecting to reset-password');
              setTimeout(() => {
                ensureUserProfileDeferred(validatedSession.user);
              }, 100);
              navigate('/reset-password', { replace: true });
              return;
            }
            
            // Normal sign-in flow - redirect based on role
            const userRole = validatedSession.user.user_metadata?.role;
            console.log('🔐 AuthProvider: Normal sign-in, user role:', userRole);
            
            // Only redirect if we're on auth pages
            const currentPath = window.location.pathname;
            if (currentPath === '/auth' || currentPath === '/signin' || currentPath === '/admin-signin') {
              setTimeout(() => {
                if (userRole === 'admin') {
                  navigate('/admin', { replace: true });
                } else if (userRole === 'employer') {
                  navigate('/employer', { replace: true });
                } else if (userRole === 'candidate') {
                  navigate('/candidate', { replace: true });
                } else {
                  navigate('/', { replace: true });
                }
              }, 100);
            }
            
            // Defer profile creation
            setTimeout(() => {
              ensureUserProfileDeferred(validatedSession.user);
            }, 100);
          } else if (event === 'SIGNED_OUT') {
            console.log('🔐 AuthProvider: User signed out');
          }
        });

        authSubscription = subscription;

        // Get initial session
        console.log('🔐 AuthProvider: Getting initial session');
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('🔐 AuthProvider: Error getting session:', error);
        }
        
        if (mounted) {
          const validatedSession = validateSession(session);
          console.log('🔐 AuthProvider: Initial session retrieved:', validatedSession?.user?.email || 'No session');
          
          setSession(validatedSession);
          setUser(validatedSession?.user ?? null);
          
          // Defer profile creation for existing session
          if (validatedSession?.user) {
            setTimeout(() => {
              ensureUserProfileDeferred(validatedSession.user);
            }, 100);
          }
        }

      } catch (error) {
        console.error('🔐 AuthProvider: Exception during initialization:', error);
        if (mounted) {
          console.log('🔐 AuthProvider: Proceeding without authentication due to initialization error');
        }
      } finally {
        if (mounted) {
          setIsLoading(false);
          console.log('🔐 AuthProvider: Auth initialization complete');
        }
      }
    };

    // Initialize auth with timeout protection
    const timeoutId = setTimeout(() => {
      if (isLoading && mounted) {
        console.warn('🔐 AuthProvider: Auth initialization timed out');
        setIsLoading(false);
      }
    }, 10000); // 10 second timeout

    initializeAuth().finally(() => {
      clearTimeout(timeoutId);
    });

    return () => {
      mounted = false;
      clearTimeout(timeoutId);
      if (authSubscription) {
        authSubscription.unsubscribe();
      }
    };
  }, [navigate]);

  const loginWithEmail = async (email: string, redirect_to?: string) => {
    setIsLoading(true);
    setAuthError(null);
    try {
      console.log('🔐 AuthProvider: Attempting email login for:', email);
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: redirect_to ? `${window.location.origin}${redirect_to}` : window.location.origin,
        },
      });
      if (error) throw error;
      toast.success('Check your email for the login link!');
    } catch (error: any) {
      console.error('🔐 AuthProvider: Login error:', error);
      setAuthError(error.message);
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = async () => {
    setIsLoading(true);
    try {
      console.log('🔐 AuthProvider: Starting sign out process');
      
      // Set explicit logout timestamp to prevent session restoration
      localStorage.setItem('explicit_logout_timestamp', Date.now().toString());
      
      // Clean up local state immediately
      setSession(null);
      setUser(null);
      setAuthError(null);
      
      // Try to sign out with Supabase
      try {
        await supabase.auth.signOut({ scope: 'global' });
        console.log('🔐 AuthProvider: Successfully signed out via API');
      } catch (error: any) {
        console.warn('🔐 AuthProvider: Sign out API failed:', error.message);
      }
      
      // Clean up auth state
      cleanupAuthState();
      
      console.log('🔐 AuthProvider: Sign out complete, navigating to home page');
      navigate('/', { replace: true });
      
    } catch (error: any) {
      console.error('🔐 AuthProvider: Exception during sign out:', error);
      
      // Even if there's an exception, try to clean up
      localStorage.setItem('explicit_logout_timestamp', Date.now().toString());
      cleanupAuthState();
      setSession(null);
      setUser(null);
      setAuthError(null);
      
      toast.error('Sign out completed');
      navigate('/', { replace: true });
    } finally {
      setIsLoading(false);
    }
  };

  const refreshSession = async () => {
    try {
      console.log('🔐 AuthProvider: Refreshing session');
      const { data } = await supabase.auth.refreshSession();
      const validatedSession = validateSession(data.session);
      setSession(validatedSession);
      setUser(validatedSession?.user ?? null);
      return validatedSession;
    } catch (error: any) {
      console.error("🔐 AuthProvider: Error refreshing session:", error);
      setAuthError('Failed to refresh session');
      return null;
    }
  };

  const contextValue = {
    user,
    session,
    signIn: loginWithEmail,
    signOut,
    isLoading,
    authError,
    refreshSession
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};
