
import React, { useState, useEffect } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from './AuthProvider';
import { supabase } from '@/integrations/supabase/client';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const AdminRoute = () => {
  const { user, session } = useAuth();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  
  useEffect(() => {
    const checkAdminStatus = async () => {
      if (!user || !session) {
        console.log("No user or session, denying admin access");
        setIsAdmin(false);
        setLoading(false);
        return;
      }
      
      console.log("Checking admin status for user:", user.email);
      
      try {
        // Use the Edge Function to check admin status
        const response = await supabase.functions.invoke('is_admin');
        
        if (response.error) {
          console.error("Admin check error:", response.error);
          setError(response.error.message || "Failed to check admin status");
          toast({
            title: "Admin check failed",
            description: `Error: ${response.error.message}`,
            variant: "destructive",
          });
          setIsAdmin(false);
          return;
        }
        
        const adminStatus = response.data?.isAdmin === true;
        console.log("Admin status response:", response.data, "Is admin:", adminStatus);
        
        setIsAdmin(adminStatus);
        
        if (adminStatus) {
          toast({
            title: "Admin access granted",
            description: `Welcome, ${user.email}`,
          });
        } else {
          toast({
            title: "Admin access denied",
            description: "You do not have administrator privileges.",
            variant: "destructive",
          });
        }
      } catch (error: any) {
        console.error("Error checking admin status:", error);
        setIsAdmin(false);
        setError(error.message || "An unknown error occurred");
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
  }, [user, session, toast]);
  
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-10 w-10 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-lg font-medium">Verifying admin access...</p>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6 bg-red-50 rounded-lg border border-red-200">
          <p className="text-red-600 font-semibold text-lg mb-2">Error checking admin status</p>
          <p className="text-gray-700 mb-4">{error}</p>
          <Button 
            className="bg-red-600 hover:bg-red-700"
            onClick={() => navigate('/admin-signin')}
          >
            Return to Sign In
          </Button>
        </div>
      </div>
    );
  }
  
  return isAdmin ? <Outlet /> : <Navigate to="/admin-signin" replace />;
};

export default AdminRoute;
