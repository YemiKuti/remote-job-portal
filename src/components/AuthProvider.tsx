
import React, { useState, useEffect, createContext, useContext } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
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

// Simplified cleanup function for explicit logouts only
const cleanupAuthStateOnLogout = () => {
  console.log('🔐 AuthProvider: Explicit logout cleanup');
  
  try {
    // Clear Supabase auth keys
    const keysToRemove = [
      'supabase.auth.token',
      'sb-mmbrvcndxhipaoxysvwr-auth-token',
    ];
    
    keysToRemove.forEach(key => {
      localStorage.removeItem(key);
      if (typeof sessionStorage !== 'undefined') {
        sessionStorage.removeItem(key);
      }
    });
    
    console.log('🔐 AuthProvider: Logout cleanup completed');
  } catch (error) {
    console.error('🔐 AuthProvider: Error during logout cleanup:', error);
  }
};

// Safe navigation function that doesn't require Router context
const navigateTo = (path: string, replace: boolean = false) => {
  if (replace) {
    window.location.replace(path);
  } else {
    window.location.href = path;
  }
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);

  useEffect(() => {
    console.log('🔐 AuthProvider: Starting auth initialization');
    let mounted = true;
    let authSubscription: any = null;
    
    const initializeAuth = async () => {
      try {
        // Set up auth state listener FIRST
        console.log('🔐 AuthProvider: Setting up auth state listener');
        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
          if (!mounted) return;
          
          console.log('🔐 AuthProvider: Auth state changed:', event, session?.user?.email || 'No session');
          
          setSession(session);
          setUser(session?.user ?? null);
          setAuthError(null);
          
          if (event === 'SIGNED_IN' && session?.user) {
            console.log('🔐 AuthProvider: User signed in successfully');
            
            // Check if this is a recovery flow - if so, redirect to reset password page
            if (isRecoveryFlow()) {
              console.log('🔐 AuthProvider: Recovery flow detected, redirecting to reset-password');
              // Defer profile creation to avoid blocking
              setTimeout(() => {
                ensureUserProfileDeferred(session.user);
              }, 100);
              navigateTo('/reset-password', true);
              return;
            }
            
            // Normal sign-in flow - redirect based on role
            const userRole = session.user.user_metadata?.role;
            console.log('🔐 AuthProvider: Normal sign-in, redirecting based on role:', userRole);
            
            // Only redirect if we're on auth pages
            const currentPath = window.location.pathname;
            if (currentPath === '/auth' || currentPath === '/signin' || currentPath === '/admin-signin') {
              setTimeout(() => {
                if (userRole === 'admin') {
                  navigateTo('/admin');
                } else if (userRole === 'employer') {
                  navigateTo('/employer');
                } else if (userRole === 'candidate') {
                  navigateTo('/candidate');
                } else {
                  navigateTo('/');
                }
              }, 100);
            }
            
            // Defer profile creation to avoid blocking
            setTimeout(() => {
              ensureUserProfileDeferred(session.user);
            }, 100);
          } else if (event === 'SIGNED_OUT') {
            console.log('🔐 AuthProvider: User signed out');
          }
        });

        authSubscription = subscription;

        // THEN get initial session
        console.log('🔐 AuthProvider: Getting initial session');
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('🔐 AuthProvider: Error getting initial session:', error);
          // Don't treat this as a fatal error - user might not be authenticated
        }
        
        if (mounted) {
          console.log('🔐 AuthProvider: Initial session retrieved:', session?.user?.email || 'No session');
          setSession(session);
          setUser(session?.user ?? null);
          
          // Defer profile creation for existing session
          if (session?.user) {
            setTimeout(() => {
              ensureUserProfileDeferred(session.user);
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

    // Initialize auth
    initializeAuth();

    return () => {
      mounted = false;
      if (authSubscription) {
        authSubscription.unsubscribe();
      }
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
      console.log('🔐 AuthProvider: Starting sign out process');
      
      // Clean up local state immediately
      setSession(null);
      setUser(null);
      setAuthError(null);
      
      // Clean up auth state
      cleanupAuthStateOnLogout();
      
      // Sign out with Supabase
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('🔐 AuthProvider: Sign out error:', error);
        // Continue with navigation even if sign out fails
      }
      
      console.log('🔐 AuthProvider: Sign out complete, navigating to home page');
      
      // Navigate to home page
      navigateTo('/');
      
    } catch (error: any) {
      console.error('🔐 AuthProvider: Exception during sign out:', error);
      
      // Even if there's an exception, clean up and navigate
      cleanupAuthStateOnLogout();
      setSession(null);
      setUser(null);
      setAuthError(null);
      
      toast.error('Sign out failed, but local session cleared');
      navigateTo('/');
    } finally {
      setIsLoading(false);
    }
  };

  const refreshSession = async () => {
    try {
      console.log('🔐 AuthProvider: Refreshing session');
      const { data, error } = await supabase.auth.refreshSession();
      if (error) throw error;
      
      setSession(data.session);
      setUser(data.session?.user ?? null);
      return data.session;
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
