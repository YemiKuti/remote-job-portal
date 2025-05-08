
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
  // For testing, create a mock user
  const mockUser = {
    id: 'test-user-id',
    user_metadata: {
      full_name: 'Test User',
      username: 'testuser'
    }
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
