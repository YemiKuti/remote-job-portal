
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
        const { data, error } = await supabase.functions.invoke('is_admin');
        
        if (error) {
          console.error("Admin check error:", error);
          toast({
            title: "Admin check failed",
            description: `Error: ${error.message}`,
            variant: "destructive",
          });
          throw error;
        }
        
        const adminStatus = data?.isAdmin === true;
        console.log("Admin status response:", data, "Is admin:", adminStatus);
        
        setIsAdmin(adminStatus);
        
        if (adminStatus) {
          toast({
            title: "Admin access granted",
            description: `Welcome, ${user.email}`,
          });
        }
      } catch (error) {
        console.error("Error checking admin status:", error);
        setIsAdmin(false);
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
  
  return isAdmin ? <Outlet /> : <Navigate to="/admin-signin" replace />;
};

export default AdminRoute;
