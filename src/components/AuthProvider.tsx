
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

// Session validation with cleanup
const validateAndCleanupSession = async (session: Session | null) => {
  if (!session) return null;
  
  try {
    // Quick validation of session
    const now = new Date().getTime() / 1000;
    if (session.expires_at && session.expires_at < now) {
      console.log('🔐 Session expired, cleaning up');
      await supabase.auth.signOut();
      return null;
    }
    return session;
  } catch (error) {
    console.error('🔐 Session validation error, cleaning up:', error);
    await supabase.auth.signOut();
    return null;
  }
};

// Enhanced session retrieval with retry logic
const getSessionWithRetry = async (maxRetries = 1) => {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`🔐 AuthProvider: Getting session (attempt ${attempt}/${maxRetries})`);
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error(`🔐 AuthProvider: Session error on attempt ${attempt}:`, error);
        if (attempt === maxRetries) throw error;
        
        // Short backoff
        await new Promise(resolve => setTimeout(resolve, 500));
        continue;
      }
      
      return await validateAndCleanupSession(session);
    } catch (error) {
      console.error(`🔐 AuthProvider: Exception on attempt ${attempt}:`, error);
      if (attempt === maxRetries) return null;
      
      // Short backoff
      await new Promise(resolve => setTimeout(resolve, 500));
    }
  }
  return null;
};

// Comprehensive auth state cleanup utility
const cleanupAuthState = () => {
  console.log('🔐 AuthProvider: Starting comprehensive auth state cleanup');
  
  try {
    // Clear standard Supabase auth keys
    const keysToRemove = [
      'supabase.auth.token',
      'sb-mmbrvcndxhipaoxysvwr-auth-token',
      'sb-auth-token',
      'supabase.auth.session',
    ];
    
    // Remove specific keys
    keysToRemove.forEach(key => {
      localStorage.removeItem(key);
      if (typeof sessionStorage !== 'undefined') {
        sessionStorage.removeItem(key);
      }
    });
    
    // Clear all keys that start with 'sb-' (Supabase storage pattern)
    Object.keys(localStorage).forEach(key => {
      if (key.startsWith('sb-') || key.startsWith('supabase.auth.') || key.includes('mmbrvcndxhipaoxysvwr')) {
        localStorage.removeItem(key);
        console.log('🔐 Removed localStorage key:', key);
      }
    });
    
    // Clear sessionStorage if available
    if (typeof sessionStorage !== 'undefined') {
      Object.keys(sessionStorage).forEach(key => {
        if (key.startsWith('sb-') || key.startsWith('supabase.auth.') || key.includes('mmbrvcndxhipaoxysvwr')) {
          sessionStorage.removeItem(key);
          console.log('🔐 Removed sessionStorage key:', key);
        }
      });
    }
    
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
  const [isExplicitLogout, setIsExplicitLogout] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    console.log('🔐 AuthProvider: Starting auth initialization');
    let authTimeout: NodeJS.Timeout;
    let mounted = true;
    let authSubscription: any = null;
    
    const initializeAuth = async () => {
      try {
        // Check if user explicitly logged out
        const logoutFlag = localStorage.getItem('explicit_logout');
        if (logoutFlag === 'true') {
          console.log('🔐 AuthProvider: Explicit logout detected, clearing state');
          localStorage.removeItem('explicit_logout');
          cleanupAuthState();
          setIsExplicitLogout(true);
          setIsLoading(false);
          return;
        }
        
        // Set up auth state listener FIRST
        console.log('🔐 AuthProvider: Setting up auth state listener');
        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
          if (!mounted) return;
          
          console.log('🔐 AuthProvider: Auth state changed:', event, session?.user?.email || 'No session');
          
          // If user explicitly logged out, don't restore session
          if (isExplicitLogout && event === 'SIGNED_IN') {
            console.log('🔐 AuthProvider: Ignoring sign-in event due to explicit logout');
            return;
          }
          
          // Validate session before setting
          const validatedSession = session?.expires_at && (session.expires_at * 1000) > Date.now() ? session : null;
          
          setSession(validatedSession);
          setUser(validatedSession?.user ?? null);
          setAuthError(null); // Clear any previous errors
          
          if (event === 'SIGNED_IN' && validatedSession?.user) {
            console.log('🔐 AuthProvider: User signed in successfully');
            setIsExplicitLogout(false); // Reset logout flag
            
            // Check if this is a recovery flow - if so, redirect to reset password page
            if (isRecoveryFlow()) {
              console.log('🔐 AuthProvider: Recovery flow detected, redirecting to reset-password');
              // Defer profile creation to avoid blocking
              setTimeout(() => {
                ensureUserProfileDeferred(validatedSession.user);
              }, 100);
              // Force redirect to reset password page for recovery flows
              navigate('/reset-password', { replace: true });
              return;
            }
            
            // Normal sign-in flow - redirect based on role
            const userRole = validatedSession.user.user_metadata?.role;
            console.log('🔐 AuthProvider: Normal sign-in, redirecting based on role:', userRole);
            
            // Only redirect if we're on auth pages
            const currentPath = window.location.pathname;
            if (currentPath === '/auth' || currentPath === '/signin' || currentPath === '/admin-signin') {
              setTimeout(() => {
                if (userRole === 'admin') {
                  navigate('/admin');
                } else if (userRole === 'employer') {
                  navigate('/employer');
                } else if (userRole === 'candidate') {
                  navigate('/candidate');
                } else {
                  navigate('/');
                }
              }, 100);
            }
            
            // Defer profile creation to avoid blocking
            setTimeout(() => {
              ensureUserProfileDeferred(validatedSession.user);
            }, 100);
          } else if (event === 'SIGNED_OUT') {
            console.log('🔐 AuthProvider: User signed out');
            setIsExplicitLogout(false); // Reset when officially signed out
          }
        });

        authSubscription = subscription;

        // THEN get initial session with retry logic (only if not explicit logout)
        if (!isExplicitLogout) {
          const initialSession = await getSessionWithRetry();
          
          if (mounted) {
            console.log('🔐 AuthProvider: Initial session retrieved:', initialSession?.user?.email || 'No session');
            setSession(initialSession);
            setUser(initialSession?.user ?? null);
            
            // Defer profile creation for existing session
            if (initialSession?.user) {
              setTimeout(() => {
                ensureUserProfileDeferred(initialSession.user);
              }, 100);
            }
          }
        }

      } catch (error) {
        console.error('🔐 AuthProvider: Exception during initialization:', error);
        if (mounted) {
          // Don't set an error for timeout - just proceed without auth
          console.log('🔐 AuthProvider: Proceeding without authentication due to initialization error');
          cleanupAuthState();
        }
      } finally {
        if (mounted) {
          setIsLoading(false);
          console.log('🔐 AuthProvider: Auth initialization complete');
        }
      }
    };

    // Set timeout for auth initialization (reduced to 3 seconds)
    authTimeout = setTimeout(() => {
      if (isLoading && mounted) {
        console.warn('🔐 AuthProvider: Auth initialization timed out, proceeding without auth');
        setIsLoading(false);
        // Don't set authError for timeout - just proceed
        cleanupAuthState();
      }
    }, 3000);

    // Initialize auth
    initializeAuth();

    return () => {
      mounted = false;
      clearTimeout(authTimeout);
      if (authSubscription) {
        authSubscription.unsubscribe();
      }
    };
  }, [navigate, isExplicitLogout]);

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
      console.log('🔐 AuthProvider: Starting comprehensive sign out process');
      
      // Set explicit logout flag FIRST
      localStorage.setItem('explicit_logout', 'true');
      setIsExplicitLogout(true);
      
      // Clean up local state immediately
      setSession(null);
      setUser(null);
      setAuthError(null);
      
      // Comprehensive auth state cleanup
      cleanupAuthState();
      
      // Additional cleanup - force clear any remaining auth state
      setTimeout(() => {
        cleanupAuthState();
      }, 100);
      
      // Try to sign out with Supabase (but don't wait for it or fail on errors)
      try {
        await supabase.auth.signOut({ scope: 'global' });
        console.log('🔐 AuthProvider: Successfully signed out via API');
      } catch (error: any) {
        console.warn('🔐 AuthProvider: Sign out API failed, but continuing with cleanup:', error.message);
        // Continue with navigation even if API call fails
      }
      
      console.log('🔐 AuthProvider: Sign out complete, navigating to signin');
      
      // Small delay to ensure cleanup completes before redirect
      setTimeout(() => {
        // Force a page reload to ensure completely clean state
        window.location.href = '/signin';
      }, 200);
      
    } catch (error: any) {
      console.error('🔐 AuthProvider: Exception during sign out:', error);
      
      // Even if there's an exception, try to clean up and navigate
      localStorage.setItem('explicit_logout', 'true');
      cleanupAuthState();
      setSession(null);
      setUser(null);
      setAuthError(null);
      setIsExplicitLogout(true);
      
      toast.error('Sign out failed, but local session cleared');
      setTimeout(() => {
        window.location.href = '/signin';
      }, 200);
    } finally {
      setIsLoading(false);
    }
  };

  const refreshSession = async () => {
    try {
      console.log('🔐 AuthProvider: Refreshing session');
      const { data } = await supabase.auth.refreshSession();
      const validatedSession = await validateAndCleanupSession(data.session);
      setSession(validatedSession);
      setUser(validatedSession?.user ?? null);
      return validatedSession;
    } catch (error: any) {
      console.error("🔐 AuthProvider: Error refreshing session:", error);
      setAuthError('Failed to refresh session');
      cleanupAuthState();
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
