
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
import { useAuth } from "@/components/AuthProvider";
import { useSecureAuth } from "@/hooks/useSecureAuth";
import { passwordSchema, emailSchema, sanitizeInput } from "@/utils/security";

const AdminSignIn = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const { isAdmin, adminVerified, accountLocked, secureSignIn } = useSecureAuth();
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [validationErrors, setValidationErrors] = useState<{email?: string; password?: string}>({});

  // Redirect if already authenticated and is admin
  useEffect(() => {
    if (user && adminVerified && isAdmin) {
      navigate('/admin');
    }
  }, [user, adminVerified, isAdmin, navigate]);

  const validateInputs = (): boolean => {
    const errors: {email?: string; password?: string} = {};
    
    try {
      emailSchema.parse(email);
    } catch (error: any) {
      errors.email = error.errors[0]?.message || "Invalid email";
    }

    try {
      passwordSchema.parse(password);
    } catch (error: any) {
      errors.password = error.errors[0]?.message || "Invalid password";
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleAdminSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (accountLocked) {
      toast({
        title: "Account temporarily locked",
        description: "Too many failed attempts. Please try again later.",
        variant: "destructive",
      });
      return;
    }

    if (!validateInputs()) {
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Sanitize inputs
      const sanitizedEmail = sanitizeInput(email);
      const sanitizedPassword = sanitizeInput(password);
      
      const result = await secureSignIn(sanitizedEmail, sanitizedPassword);
      
      if (result.error) {
        toast({
          title: "Authentication failed",
          description: "Invalid credentials or insufficient privileges.",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Admin access granted",
        description: "Welcome to the admin dashboard.",
      });
      
      navigate('/admin');
    } catch (error: any) {
      console.error("Error during admin sign in:", error);
      toast({
        title: "Authentication failed",
        description: "An error occurred during authentication.",
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
                  Secure administrator portal access
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
                      disabled={isLoading || accountLocked}
                      className={validationErrors.email ? "border-red-500" : ""}
                    />
                    {validationErrors.email && (
                      <p className="text-sm text-red-500">{validationErrors.email}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <Input 
                      id="password"
                      type="password" 
                      placeholder="•••••••••" 
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      disabled={isLoading || accountLocked}
                      className={validationErrors.password ? "border-red-500" : ""}
                    />
                    {validationErrors.password && (
                      <p className="text-sm text-red-500">{validationErrors.password}</p>
                    )}
                  </div>
                  {accountLocked && (
                    <div className="text-sm text-red-500 text-center">
                      Account temporarily locked due to multiple failed attempts
                    </div>
                  )}
                  <Button 
                    type="submit" 
                    className="w-full bg-gray-800 hover:bg-gray-900"
                    disabled={isLoading || accountLocked}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Authenticating...
                      </>
                    ) : (
                      "Sign in as Administrator"
                    )}
                  </Button>
                </form>
              </CardContent>
              <CardFooter className="flex justify-center">
                <div className="text-sm text-gray-500">
                  Protected by advanced security measures
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
