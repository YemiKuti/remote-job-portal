
import React, { useState, useEffect } from 'react';
import { Navigate, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from './AuthProvider';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, ShieldX } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { logSecurityEvent } from '@/utils/securityLogger';

const AdminRoute = () => {
  const { user, session } = useAuth();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [verificationAttempts, setVerificationAttempts] = useState(0);
  const { toast } = useToast();
  const navigate = useNavigate();
  
  useEffect(() => {
    const checkAdminStatus = async () => {
      // Log access attempt
      await logSecurityEvent({
        event_type: 'admin_action',
        user_id: user?.id,
        details: { 
          action: 'admin_route_access_attempt',
          email: user?.email,
          url: window.location.pathname
        },
        severity: 'high'
      });

      if (!user || !session) {
        console.log("No user or session, denying admin access");
        setIsAdmin(false);
        setLoading(false);
        
        await logSecurityEvent({
          event_type: 'suspicious_activity',
          details: { 
            reason: 'admin_access_without_auth',
            url: window.location.pathname
          },
          severity: 'high'
        });
        return;
      }
      
      console.log("Checking admin status for user:", user.email);
      console.log("Session access token:", session.access_token ? "Present" : "Missing");
      
      try {
        setVerificationAttempts(prev => prev + 1);
        
        // First try using the database function directly with timeout
        const timeoutPromise = new Promise((_, reject) => {
          setTimeout(() => reject(new Error('Admin verification timeout')), 5000);
        });
        
        const verificationPromise = supabase.rpc('is_admin');
        
        const { data: directCheck, error: directError } = await Promise.race([
          verificationPromise,
          timeoutPromise
        ]) as any;
        
        console.log("Direct admin check response:", directCheck, directError);
        
        if (!directError && directCheck === true) {
          console.log("Admin status confirmed via direct database call");
          setIsAdmin(true);
          
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
          
          toast({
            title: "Admin access granted",
            description: `Welcome, ${user.email}`,
          });
          setLoading(false);
          return;
        }
        
        // Fallback to Edge Function if direct call fails
        console.log("Trying Edge Function as fallback...");
        const { data, error } = await supabase.functions.invoke('is_admin', {
          headers: {
            Authorization: `Bearer ${session.access_token}`
          }
        });
        
        console.log("Edge Function admin check response:", data, error);
        
        if (error) {
          console.error("Edge Function admin check error:", error);
          setError(error.message || "Failed to check admin status");
          
          await logSecurityEvent({
            event_type: 'suspicious_activity',
            user_id: user.id,
            details: { 
              reason: 'admin_verification_failed',
              error: error.message,
              attempts: verificationAttempts
            },
            severity: 'high'
          });
          
          toast({
            title: "Admin verification failed",
            description: `Error: ${error.message}`,
            variant: "destructive",
          });
          setIsAdmin(false);
          setLoading(false);
          return;
        }
        
        const adminStatus = data?.isAdmin === true;
        console.log("Final admin status result:", adminStatus);
        
        setIsAdmin(adminStatus);
        
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
          
          toast({
            title: "Admin access granted",
            description: `Welcome, ${user.email}`,
          });
        } else {
          await logSecurityEvent({
            event_type: 'suspicious_activity',
            user_id: user.id,
            details: { 
              reason: 'admin_access_denied_insufficient_privileges',
              email: user.email,
              url: window.location.pathname
            },
            severity: 'high'
          });
          
          toast({
            title: "Access denied",
            description: "You do not have administrator privileges.",
            variant: "destructive",
          });
        }
      } catch (error) {
        console.error("Error checking admin status:", error);
        setIsAdmin(false);
        setError(error.message || "An unknown error occurred");
        
        await logSecurityEvent({
          event_type: 'suspicious_activity',
          user_id: user?.id,
          details: { 
            reason: 'admin_verification_exception',
            error: error.message,
            attempts: verificationAttempts
          },
          severity: 'critical'
        });
        
        toast({
          title: "Admin access denied",
          description: "There was an error verifying your admin privileges.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };
    
    checkAdminStatus();
  }, [user, session, toast, verificationAttempts]);
  
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-center max-w-md mx-auto p-8">
          <Loader2 className="h-12 w-12 animate-spin mx-auto mb-6 text-gray-600" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Verifying Admin Access</h2>
          <p className="text-gray-600">Please wait while we verify your administrative privileges...</p>
          {verificationAttempts > 1 && (
            <p className="text-sm text-yellow-600 mt-2">
              Verification attempt {verificationAttempts}
            </p>
          )}
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-center max-w-md mx-auto p-8 bg-red-50 rounded-lg border border-red-200">
          <ShieldX className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-red-800 mb-2">Admin Verification Failed</h2>
          <p className="text-red-700 mb-6">{error}</p>
          <div className="space-y-3">
            <Button 
              className="w-full bg-red-600 hover:bg-red-700"
              onClick={() => navigate('/admin-signin')}
            >
              Return to Admin Sign In
            </Button>
            <Button 
              variant="outline"
              className="w-full"
              onClick={() => navigate('/')}
            >
              Go to Home Page
            </Button>
          </div>
        </div>
      </div>
    );
  }
  
  if (!user) {
    return <Navigate to="/admin-signin" replace />;
  }
  
  if (isAdmin === false) {
    return <Navigate to="/admin-signin" replace />;
  }
  
  return <Outlet />;
};

export default AdminRoute;
