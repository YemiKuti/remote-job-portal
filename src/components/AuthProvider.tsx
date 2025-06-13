
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
const getSessionWithRetry = async (maxRetries = 2) => {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`🔐 AuthProvider: Getting session (attempt ${attempt}/${maxRetries})`);
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error(`🔐 AuthProvider: Session error on attempt ${attempt}:`, error);
        if (attempt === maxRetries) throw error;
        
        // Exponential backoff
        await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
        continue;
      }
      
      return await validateAndCleanupSession(session);
    } catch (error) {
      console.error(`🔐 AuthProvider: Exception on attempt ${attempt}:`, error);
      if (attempt === maxRetries) throw error;
      
      // Exponential backoff
      await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
    }
  }
  return null;
};

// Auth state cleanup utility
const cleanupAuthState = () => {
  console.log('🔐 AuthProvider: Cleaning up auth state');
  // Clear any potential stuck auth state
  try {
    localStorage.removeItem('supabase.auth.token');
    // Clear other potential auth keys
    Object.keys(localStorage).forEach(key => {
      if (key.startsWith('supabase.auth.')) {
        localStorage.removeItem(key);
      }
    });
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
    let authTimeout: NodeJS.Timeout;
    let mounted = true;
    
    const initializeAuth = async () => {
      try {
        // Set up auth state listener FIRST
        console.log('🔐 AuthProvider: Setting up auth state listener');
        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
          if (!mounted) return;
          
          console.log('🔐 AuthProvider: Auth state changed:', event, session?.user?.email || 'No session');
          
          // Validate session before setting
          const validatedSession = session?.expires_at && (session.expires_at * 1000) > Date.now() ? session : null;
          
          setSession(validatedSession);
          setUser(validatedSession?.user ?? null);
          setAuthError(null); // Clear any previous errors
          
          if (event === 'SIGNED_IN' && validatedSession?.user) {
            console.log('🔐 AuthProvider: User signed in successfully');
            // Defer profile creation to avoid blocking
            setTimeout(() => {
              ensureUserProfileDeferred(validatedSession.user);
            }, 100);
          } else if (event === 'SIGNED_OUT') {
            console.log('🔐 AuthProvider: User signed out');
          }
        });

        // THEN get initial session with retry logic
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

        return () => {
          console.log('🔐 AuthProvider: Cleaning up auth subscription');
          subscription.unsubscribe();
        };
      } catch (error) {
        console.error('🔐 AuthProvider: Exception during initialization:', error);
        if (mounted) {
          setAuthError('Failed to initialize authentication');
          cleanupAuthState();
        }
        return () => {};
      } finally {
        if (mounted) {
          setIsLoading(false);
          console.log('🔐 AuthProvider: Auth initialization complete');
        }
      }
    };

    // Set reduced timeout for auth initialization (5 seconds instead of 10)
    authTimeout = setTimeout(() => {
      if (isLoading && mounted) {
        console.warn('🔐 AuthProvider: Auth initialization timed out, cleaning up and proceeding');
        setIsLoading(false);
        setAuthError('Authentication initialization timed out');
        cleanupAuthState();
      }
    }, 5000);

    // Initialize auth
    initializeAuth().then(cleanup => {
      if (cleanup && mounted) {
        // Store cleanup function for component unmount
        return cleanup;
      }
    });

    return () => {
      mounted = false;
      clearTimeout(authTimeout);
    };
  }, []);

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
      console.log('🔐 AuthProvider: Signing out user');
      
      // Clean up auth state first
      cleanupAuthState();
      
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      // Clear local state
      setSession(null);
      setUser(null);
      setAuthError(null);
      
      navigate('/signin');
    } catch (error: any) {
      console.error('🔐 AuthProvider: Sign out error:', error);
      setAuthError(error.message);
      toast.error(error.message);
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
