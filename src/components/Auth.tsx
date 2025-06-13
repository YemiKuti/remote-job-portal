import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { passwordSchema, emailSchema, sanitizeInput, checkRateLimit } from "@/utils/security";
import { SecureInput } from "@/components/security/SecureInput";

interface AuthProps {
  initialRole?: string;
  initialProvider?: string | null;
}

export default function Auth({ initialRole = 'candidate', initialProvider = null }: AuthProps) {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("signin");
  const [selectedRole, setSelectedRole] = useState(initialRole);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [validationErrors, setValidationErrors] = useState<{[key: string]: string}>({});
  const [rateLimited, setRateLimited] = useState(false);

  useEffect(() => {
    if (initialProvider === 'linkedin_oidc') {
      handleLinkedInAuth();
    }
  }, [initialProvider]);

  const validateInputs = (isSignUp: boolean = false): boolean => {
    const errors: {[key: string]: string} = {};
    
    try {
      emailSchema.parse(email);
    } catch (error: any) {
      errors.email = error.errors[0]?.message || "Invalid email";
    }

    if (isSignUp) {
      if (!fullName.trim()) {
        errors.fullName = "Full name is required";
      } else if (fullName.trim().length < 2) {
        errors.fullName = "Full name must be at least 2 characters";
      }

      try {
        passwordSchema.parse(password);
      } catch (error: any) {
        errors.password = error.errors[0]?.message || "Invalid password";
      }

      if (password !== confirmPassword) {
        errors.confirmPassword = "Passwords do not match";
      }
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const rateLimitKey = `signup_${email}`;
    if (!checkRateLimit(rateLimitKey, 3, 60 * 60 * 1000)) {
      setRateLimited(true);
      toast.error("Too many sign-up attempts. Please try again later.");
      return;
    }

    if (!validateInputs(true)) {
      return;
    }

    setIsLoading(true);
    
    try {
      const sanitizedEmail = sanitizeInput(email);
      const sanitizedPassword = sanitizeInput(password);
      const sanitizedFullName = sanitizeInput(fullName);
      
      const { data, error } = await supabase.auth.signUp({
        email: sanitizedEmail,
        password: sanitizedPassword,
        options: {
          data: {
            role: selectedRole,
            full_name: sanitizedFullName,
          },
        },
      });

      if (error) throw error;

      if (data.user && !data.session) {
        toast.success("Check your email for the confirmation link!");
      } else {
        toast.success("Account created successfully!");
        navigate("/");
      }
    } catch (error: any) {
      console.error("Error signing up:", error);
      toast.error("Failed to create account. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const rateLimitKey = `signin_${email}`;
    if (!checkRateLimit(rateLimitKey, 5, 15 * 60 * 1000)) {
      setRateLimited(true);
      toast.error("Too many sign-in attempts. Please try again in 15 minutes.");
      return;
    }

    if (!validateInputs(false)) {
      return;
    }

    setIsLoading(true);
    
    try {
      const sanitizedEmail = sanitizeInput(email);
      const sanitizedPassword = sanitizeInput(password);
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email: sanitizedEmail,
        password: sanitizedPassword,
      });

      if (error) {
        // Generic error message to prevent user enumeration
        toast.error("Invalid credentials. Please check your email and password.");
        return;
      }

      const userRole = data.user?.user_metadata?.role;
      toast.success("Signed in successfully!");
      
      // Navigate based on role
      if (userRole === 'admin') {
        navigate('/admin');
      } else if (userRole === 'employer') {
        navigate('/employer');
      } else {
        navigate('/candidate');
      }
    } catch (error: any) {
      console.error("Error signing in:", error);
      toast.error("Authentication failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleLinkedInAuth = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'linkedin_oidc',
        options: {
          redirectTo: `${window.location.origin}/auth?role=${selectedRole}`,
        },
      });
      
      if (error) throw error;
    } catch (error: any) {
      console.error("Error with LinkedIn auth:", error);
      toast.error("LinkedIn authentication failed. Please try again.");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[80vh] px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">Welcome</CardTitle>
          <CardDescription>
            Sign in to your account or create a new one
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="signin">Sign In</TabsTrigger>
              <TabsTrigger value="signup">Sign Up</TabsTrigger>
            </TabsList>
            
            <TabsContent value="signin">
              <form onSubmit={handleSignIn} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <SecureInput
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onSecureChange={setEmail}
                    disabled={isLoading || rateLimited}
                    className={validationErrors.email ? "border-red-500" : ""}
                  />
                  {validationErrors.email && (
                    <p className="text-sm text-red-500">{validationErrors.email}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <SecureInput
                    id="password"
                    type="password"
                    placeholder="Enter your password"
                    value={password}
                    onSecureChange={setPassword}
                    disabled={isLoading || rateLimited}
                  />
                </div>
                <Button 
                  type="submit" 
                  className="w-full" 
                  disabled={isLoading || rateLimited}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Signing in...
                    </>
                  ) : (
                    "Sign In"
                  )}
                </Button>
              </form>
            </TabsContent>
            
            <TabsContent value="signup">
              <form onSubmit={handleSignUp} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="role">I am a</Label>
                  <select
                    value={selectedRole}
                    onChange={(e) => setSelectedRole(e.target.value)}
                    className="w-full p-2 border rounded-md"
                    disabled={isLoading || rateLimited}
                  >
                    <option value="candidate">Job Seeker</option>
                    <option value="employer">Employer</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-full-name">Full Name</Label>
                  <SecureInput
                    id="signup-full-name"
                    type="text"
                    placeholder="Enter your full name"
                    value={fullName}
                    onSecureChange={setFullName}
                    disabled={isLoading || rateLimited}
                    className={validationErrors.fullName ? "border-red-500" : ""}
                  />
                  {validationErrors.fullName && (
                    <p className="text-sm text-red-500">{validationErrors.fullName}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-email">Email</Label>
                  <SecureInput
                    id="signup-email"
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onSecureChange={setEmail}
                    disabled={isLoading || rateLimited}
                    className={validationErrors.email ? "border-red-500" : ""}
                  />
                  {validationErrors.email && (
                    <p className="text-sm text-red-500">{validationErrors.email}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-password">Password</Label>
                  <SecureInput
                    id="signup-password"
                    type="password"
                    placeholder="Create a strong password"
                    value={password}
                    onSecureChange={setPassword}
                    disabled={isLoading || rateLimited}
                    className={validationErrors.password ? "border-red-500" : ""}
                  />
                  {validationErrors.password && (
                    <p className="text-sm text-red-500">{validationErrors.password}</p>
                  )}
                  <p className="text-xs text-gray-600">
                    Password must be at least 8 characters with uppercase, lowercase, number, and special character
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirm-password">Confirm Password</Label>
                  <SecureInput
                    id="confirm-password"
                    type="password"
                    placeholder="Confirm your password"
                    value={confirmPassword}
                    onSecureChange={setConfirmPassword}
                    disabled={isLoading || rateLimited}
                    className={validationErrors.confirmPassword ? "border-red-500" : ""}
                  />
                  {validationErrors.confirmPassword && (
                    <p className="text-sm text-red-500">{validationErrors.confirmPassword}</p>
                  )}
                </div>
                <Button 
                  type="submit" 
                  className="w-full" 
                  disabled={isLoading || rateLimited}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating account...
                    </>
                  ) : (
                    "Create Account"
                  )}
                </Button>
              </form>
            </TabsContent>
          </Tabs>

          {rateLimited && (
            <div className="mt-4 text-center text-sm text-red-500">
              Too many attempts. Please wait before trying again.
            </div>
          )}

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">Or continue with</span>
              </div>
            </div>
            <Button
              variant="outline"
              onClick={handleLinkedInAuth}
              disabled={isLoading || rateLimited}
              className="w-full mt-4"
            >
              <img src="/lovable-uploads/9405a07c-077e-4655-ba6c-5c796119dfcc.png" alt="LinkedIn" className="h-5 w-5 mr-2" />
              Continue with LinkedIn
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
