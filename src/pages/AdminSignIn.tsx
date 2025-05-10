
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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

  // Redirect if already authenticated and is admin
  useEffect(() => {
    const checkAdmin = async () => {
      if (user && session) {
        try {
          // Use RPC function to check admin status
          const { data, error } = await supabase.rpc('is_admin');
          if (error) throw error;
          
          if (data === true) {
            navigate('/admin');
          }
        } catch (error) {
          console.error("Error checking admin status:", error);
        }
      }
    };
    
    checkAdmin();
  }, [user, session, navigate]);

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
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (error) throw error;
      
      // Refresh session to ensure we have the latest token
      await refreshSession();
      
      // Verify admin status
      const { data: isAdmin, error: adminCheckError } = await supabase.rpc('is_admin');
      
      if (adminCheckError) throw adminCheckError;
      
      if (isAdmin === true) {
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
                      disabled={isLoading}
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
                      disabled={isLoading}
                    />
                  </div>
                  <Button 
                    type="submit" 
                    className="w-full bg-gray-800 hover:bg-gray-900"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Verifying...
                      </>
                    ) : (
                      "Sign in as Administrator"
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default AdminSignIn;
