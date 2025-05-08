
import { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

type AuthContextType = {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  isLoading: false, // Set to false for testing
  signOut: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }: { children: ReactNode }) {
  // For testing, create a mock user that properly satisfies the User type
  const mockUser = {
    id: 'test-user-id',
    app_metadata: {},
    user_metadata: {
      full_name: 'Test User',
      username: 'testuser'
    },
    aud: 'authenticated',
    created_at: new Date().toISOString(),
  } as User;
  
  const [user, setUser] = useState<User | null>(mockUser);
  const [session, setSession] = useState<Session | null>({
    access_token: 'mock-token',
    refresh_token: 'mock-refresh-token',
    user: mockUser
  } as Session);
  const [isLoading, setIsLoading] = useState(false); // Set to false for testing

  const signOut = async () => {
    // For testing, just clear the mock user
    setUser(null);
    setSession(null);
  };

  return (
    <AuthContext.Provider value={{ user, session, isLoading, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}
