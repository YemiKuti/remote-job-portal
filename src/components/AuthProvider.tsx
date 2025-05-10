import React, { useState, useEffect, createContext, useContext } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  signIn: (email: string, redirect_to?: string) => Promise<void>;
  signOut: () => Promise<void>;
  isLoading: boolean;
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

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();

      setSession(session);
      setUser(session?.user ?? null);
      setIsLoading(false);
    };

    getSession();

    supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
    });
  }, []);

  const loginWithEmail = async (email: string, redirect_to?: string) => {
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: redirect_to ? `${window.location.origin}${redirect_to}` : window.location.origin,
        },
      });
      if (error) throw error;
      alert('Check your email for the login link!');
    } catch (error) {
      alert(error);
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = async () => {
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      navigate('/signin');
    } catch (error) {
      alert(error);
    } finally {
      setIsLoading(false);
    }
  };

  const refreshSession = async () => {
    const { data } = await supabase.auth.refreshSession();
    setSession(data.session);
    setUser(data.session?.user ?? null);
    return data.session;
  };

  const contextValue = {
    user,
    session,
    signIn: loginWithEmail,
    signOut,
    isLoading,
    refreshSession
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {!isLoading && children}
    </AuthContext.Provider>
  );
};
