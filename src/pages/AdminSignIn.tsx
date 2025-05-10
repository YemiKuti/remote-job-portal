
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ShieldCheck, Loader2 } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/components/AuthProvider";

const AdminSignIn = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, session, refreshSession } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [checkingAdmin, setCheckingAdmin] = useState(false);

  // Redirect if already authenticated and is admin
  useEffect(() => {
    const checkAdmin = async () => {
      if (!user || !session) {
        return;
      }
      
      setCheckingAdmin(true);
      try {
        console.log("Checking if user is already admin:", user.email);
        
        // Use Edge Function to check admin status with explicit authorization
        const { data, error } = await supabase.functions.invoke('is_admin', {
          headers: {
            Authorization: `Bearer ${session.access_token}`
          }
        });
        
        console.log("Admin check response:", data, error);
        
        if (error) {
          console.error("Admin check error:", error);
          toast({
            title: "Error checking admin status",
            description: error.message,
            variant: "destructive",
          });
          return;
        }
        
        if (data?.isAdmin === true) {
          console.log("User is admin, redirecting to admin dashboard");
          navigate('/admin');
        } else if (data?.isAdmin === false) {
          toast({
            title: "Admin access denied",
            description: "You do not have administrator privileges.",
            variant: "destructive",
          });
        }
      } catch (error) {
        console.error("Error checking admin status:", error);
        toast({
          title: "Error",
          description: "Failed to verify admin status.",
          variant: "destructive",
        });
      } finally {
        setCheckingAdmin(false);
      }
    };
    
    checkAdmin();
  }, [user, session, navigate, toast]);

  const handleAdminSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast({
        title: "Missing information",
        description: "Please enter both email and password.",
        variant: "destructive",
      });
      return;
    }
    
    setIsLoading(true);
    
    try {
      // First attempt regular sign in
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (authError) {
        throw authError;
      }
      
      console.log("Successfully signed in, refreshing session");
      
      // Refresh session to ensure we have the latest token
      await refreshSession();
      
      const currentSession = await supabase.auth.getSession();
      const accessToken = currentSession?.data?.session?.access_token;
      
      if (!accessToken) {
        throw new Error("Failed to get access token after login");
      }
      
      console.log("Session refreshed, checking admin status");
      
      // Verify admin status with explicit authorization header
      const { data: adminCheck, error: adminCheckError } = await supabase.functions.invoke('is_admin', {
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      });
      
      console.log("Admin check response:", adminCheck);
      
      if (adminCheckError) {
        console.error("Admin check error:", adminCheckError);
        throw adminCheckError;
      }
      
      if (adminCheck?.isAdmin === true) {
        toast({
          title: "Admin access granted",
          description: "Welcome to the admin dashboard.",
        });
        navigate('/admin');
      } else {
        // Sign out if not admin
        await supabase.auth.signOut();
        toast({
          title: "Access denied",
          description: "You do not have administrator privileges.",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      console.error("Error during admin sign in:", error);
      toast({
        title: "Authentication failed",
        description: error.message || "Could not authenticate as administrator.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1 bg-gray-50">
        <div className="container mx-auto py-12 px-4 md:px-6">
          <div className="max-w-md mx-auto">
            <Card>
              <CardHeader className="text-center">
                <ShieldCheck className="w-12 h-12 mx-auto mb-2 text-gray-800" />
                <CardTitle className="text-2xl font-bold">Admin Access</CardTitle>
                <CardDescription>
                  Sign in to access the administrator portal
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleAdminSignIn} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input 
                      id="email"
                      type="email" 
                      placeholder="admin@example.com" 
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      disabled={isLoading || checkingAdmin}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <Input 
                      id="password"
                      type="password" 
                      placeholder="•••••••••" 
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      disabled={isLoading || checkingAdmin}
                    />
                  </div>
                  <Button 
                    type="submit" 
                    className="w-full bg-gray-800 hover:bg-gray-900"
                    disabled={isLoading || checkingAdmin}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Verifying...
                      </>
                    ) : checkingAdmin ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Checking admin status...
                      </>
                    ) : (
                      "Sign in as Administrator"
                    )}
                  </Button>
                </form>
              </CardContent>
              <CardFooter className="flex justify-center">
                <div className="text-sm text-gray-500">
                  Note: Only users with admin role can access this portal
                </div>
              </CardFooter>
            </Card>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default AdminSignIn;
