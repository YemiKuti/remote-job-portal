
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

// Function to ensure user profile exists
const ensureUserProfile = async (user: User) => {
  try {
    console.log('🔍 Checking if profile exists for user:', user.id);
    
    // Check if profile already exists
    const { data: existingProfile, error: checkError } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', user.id)
      .single();

    if (checkError && checkError.code !== 'PGRST116') { // PGRST116 = no rows returned
      console.error('❌ Error checking profile:', checkError);
      return;
    }

    if (existingProfile) {
      console.log('✅ Profile already exists for user');
      return;
    }

    console.log('⚠️ No profile found, creating one...');
    
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
      console.error('❌ Error creating profile:', insertError);
    } else {
      console.log('✅ Profile created successfully');
    }
  } catch (error) {
    console.error('❌ Exception in ensureUserProfile:', error);
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
    
    const getSession = async () => {
      try {
        console.log('🔐 AuthProvider: Getting initial session');
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('🔐 AuthProvider: Error getting session:', error);
          setAuthError(error.message);
        } else {
          console.log('🔐 AuthProvider: Initial session:', session?.user?.email || 'No session');
          setSession(session);
          setUser(session?.user ?? null);
          
          // Ensure profile exists for the user
          if (session?.user) {
            setTimeout(() => {
              ensureUserProfile(session.user);
            }, 0);
          }
        }
      } catch (error) {
        console.error('🔐 AuthProvider: Exception getting session:', error);
        setAuthError('Failed to initialize authentication');
      } finally {
        setIsLoading(false);
        console.log('🔐 AuthProvider: Auth initialization complete');
      }
    };

    // Set up auth state listener
    console.log('🔐 AuthProvider: Setting up auth state listener');
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('🔐 AuthProvider: Auth state changed:', event, session?.user?.email || 'No session');
      setSession(session);
      setUser(session?.user ?? null);
      setAuthError(null); // Clear any previous errors
      
      if (event === 'SIGNED_IN') {
        console.log('🔐 AuthProvider: User signed in successfully');
        // Ensure profile exists for the user
        if (session?.user) {
          setTimeout(() => {
            ensureUserProfile(session.user);
          }, 0);
        }
      } else if (event === 'SIGNED_OUT') {
        console.log('🔐 AuthProvider: User signed out');
      }
    });

    // Get initial session
    getSession();

    // Set timeout for auth initialization (fallback after 10 seconds)
    authTimeout = setTimeout(() => {
      if (isLoading) {
        console.warn('🔐 AuthProvider: Auth initialization timed out, proceeding anyway');
        setIsLoading(false);
        setAuthError('Authentication initialization took too long');
      }
    }, 10000);

    return () => {
      console.log('🔐 AuthProvider: Cleaning up auth provider');
      subscription.unsubscribe();
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
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
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
