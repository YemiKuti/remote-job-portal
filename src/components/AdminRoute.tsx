
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/components/AuthProvider';
import { supabase } from '@/integrations/supabase/client';
import { logSecurityEvent } from '@/utils/securityLogger';
import { Loader2 } from 'lucide-react';

interface AdminRouteProps {
  children: React.ReactNode;
}

export const AdminRoute = ({ children }: AdminRouteProps) => {
  const { user, session } = useAuth();
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const checkAdminStatus = async () => {
    if (!user || !session) {
      console.log('No user or session available');
      setIsAdmin(false);
      setIsLoading(false);
      return;
    }

    try {
      console.log('Checking admin status for user:', user.email);

      // Log admin route access attempt (only once)
      await logSecurityEvent({
        event_type: 'admin_action',
        user_id: user.id,
        details: { 
          action: 'admin_route_access_attempt',
          email: user.email,
          url: window.location.pathname
        },
        severity: 'high'
      });

      // Use direct database call first
      const { data: directResult, error: directError } = await supabase.rpc('is_admin');
      
      console.log('Direct admin check response:', directResult, directError);

      if (!directError && directResult === true) {
        console.log('Admin status confirmed via direct database call');
        
        // Log successful admin verification (only once)
        await logSecurityEvent({
          event_type: 'admin_login',
          user_id: user.id,
          details: { 
            verification_method: 'direct_database',
            email: user.email,
            url: window.location.pathname
          },
          severity: 'high'
        });

        setIsAdmin(true);
        setIsLoading(false);
        return;
      }

      // Fallback to Edge Function if direct call fails
      console.log('Direct call failed, trying Edge Function');
      const { data, error } = await supabase.functions.invoke('is_admin', {
        headers: {
          Authorization: `Bearer ${session.access_token}`
        }
      });

      if (error) {
        console.error('Admin verification error:', error);
        setIsAdmin(false);
        setIsLoading(false);
        return;
      }

      const adminStatus = data?.isAdmin === true;
      
      if (adminStatus) {
        await logSecurityEvent({
          event_type: 'admin_login',
          user_id: user.id,
          details: { 
            verification_method: 'edge_function',
            email: user.email,
            url: window.location.pathname
          },
          severity: 'high'
        });
      }

      setIsAdmin(adminStatus);
      setIsLoading(false);
    } catch (error) {
      console.error('Admin verification failed:', error);
      setIsAdmin(false);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Only check admin status once when component mounts or user changes
    if (user && session && isAdmin === null) {
      checkAdminStatus();
    } else if (!user || !session) {
      setIsAdmin(false);
      setIsLoading(false);
    }
  }, [user?.id, session?.access_token]); // Only depend on user ID and session token

  useEffect(() => {
    if (!isLoading && isAdmin === false) {
      console.log('User is not admin, redirecting to admin sign-in');
      navigate('/admin-signin');
    }
  }, [isLoading, isAdmin, navigate]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="space-y-4 text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto" />
          <p className="text-muted-foreground">Verifying admin access...</p>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return null; // Will redirect via useEffect
  }

  return <>{children}</>;
};
