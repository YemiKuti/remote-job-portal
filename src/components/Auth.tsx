import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { passwordSchema, emailSchema, sanitizeInput, checkRateLimit } from "@/utils/security";
import { SecureInput } from "@/components/security/SecureInput";

interface AuthProps {
  initialRole?: string;
  initialProvider?: string | null;
  initialTab?: 'signin' | 'signup';
}

export default function Auth({ initialRole = 'candidate', initialTab = 'signin' }: AuthProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'signin' | 'signup'>(initialTab);
  const [selectedRole, setSelectedRole] = useState(initialRole);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [validationErrors, setValidationErrors] = useState<{[key: string]: string}>({});
  const [rateLimited, setRateLimited] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [isResettingPassword, setIsResettingPassword] = useState(false);

  useEffect(() => {
    // Check if this is a password recovery flow and redirect to reset-password page immediately
    const hash = window.location.hash.substring(1);
    const search = window.location.search;
    const hashParams = new URLSearchParams(hash);
    const searchParams = new URLSearchParams(search);
    
    const type = hashParams.get('type') || searchParams.get('type');
    const accessToken = hashParams.get('access_token') || searchParams.get('access_token');
    
    console.log('🔐 Auth component: Checking for recovery flow', { type, hasAccessToken: !!accessToken });
    
    if (type === 'recovery' && accessToken) {
      console.log('🔐 Auth component: Recovery flow detected, redirecting to reset-password immediately');
      // Use replace to avoid adding to history stack
      navigate(`/reset-password${search}${window.location.hash}`, { replace: true });
      return;
    }
  }, [location, navigate]);

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

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const rateLimitKey = `forgot_password_${resetEmail}`;
    if (!checkRateLimit(rateLimitKey, 3, 60 * 60 * 1000)) {
      toast.error("Too many password reset attempts. Please try again later.");
      return;
    }

    try {
      emailSchema.parse(resetEmail);
    } catch (error: any) {
      toast.error("Please enter a valid email address");
      return;
    }

    setIsResettingPassword(true);
    
    try {
      const sanitizedEmail = sanitizeInput(resetEmail);
      const redirectUrl = `${window.location.origin}/reset-password`;
      
      const { error } = await supabase.auth.resetPasswordForEmail(sanitizedEmail, {
        redirectTo: redirectUrl
      });

      if (error) throw error;

      toast.success("Password reset email sent! Check your inbox for instructions.");
      setShowForgotPassword(false);
      setResetEmail("");
    } catch (error: any) {
      console.error("Error sending password reset:", error);
      toast.success("If an account with that email exists, you will receive a password reset link.");
    } finally {
      setIsResettingPassword(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsGoogleLoading(true);
    
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        },
      });

      if (error) {
        console.error("Google sign-in error:", error);
        toast.error("Failed to sign in with Google. Please try again.");
      }
    } catch (error: any) {
      console.error("Google sign-in error:", error);
      toast.error("Failed to sign in with Google. Please try again.");
    } finally {
      setIsGoogleLoading(false);
    }
  };

  const handleGoogleSignUp = async () => {
    setIsGoogleLoading(true);
    
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        },
      });

      if (error) {
        console.error("Google sign-up error:", error);
        toast.error("Failed to sign up with Google. Please try again.");
      }
    } catch (error: any) {
      console.error("Google sign-up error:", error);
      toast.error("Failed to sign up with Google. Please try again.");
    } finally {
      setIsGoogleLoading(false);
    }
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
        toast.error("Invalid credentials. Please check your email and password.");
        return;
      }

      const userRole = data.user?.user_metadata?.role;
      toast.success("Signed in successfully!");
      
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

  if (showForgotPassword) {
    return (
      <div className="flex items-center justify-center min-h-[80vh] px-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold">Reset Password</CardTitle>
            <CardDescription>
              Enter your email address and we'll send you a link to reset your password
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleForgotPassword} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="reset-email">Email</Label>
                <SecureInput
                  id="reset-email"
                  type="email"
                  placeholder="Enter your email"
                  value={resetEmail}
                  onSecureChange={setResetEmail}
                  disabled={isResettingPassword}
                  required
                />
              </div>
              <div className="space-y-4">
                <Button 
                  type="submit" 
                  className="w-full" 
                  disabled={isResettingPassword}
                >
                  {isResettingPassword ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Sending reset email...
                    </>
                  ) : (
                    "Send Reset Email"
                  )}
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  className="w-full"
                  onClick={() => {
                    setShowForgotPassword(false);
                    setResetEmail("");
                  }}
                  disabled={isResettingPassword}
                >
                  Back to Sign In
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Show only the relevant tab based on initialTab
  const showTabs = initialTab === 'signin' || initialTab === 'signup';

  return (
    <div className="flex items-center justify-center min-h-[60vh] px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">
            {initialTab === 'signup' ? 'Create Account' : 'Welcome Back'}
          </CardTitle>
          <CardDescription>
            {initialTab === 'signup' 
              ? 'Create your account to get started'
              : 'Sign in to your account or create a new one'
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          {showTabs ? (
            <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'signin' | 'signup')}>
              {initialTab === 'signin' && (
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="signin">Sign In</TabsTrigger>
                  <TabsTrigger value="signup">Sign Up</TabsTrigger>
                </TabsList>
              )}
              
              <TabsContent value="signin">
                <div className="space-y-4">
                  <Button 
                    onClick={handleGoogleSignIn}
                    variant="outline" 
                    className="w-full" 
                    disabled={isLoading || rateLimited || isGoogleLoading}
                  >
                    {isGoogleLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Signing in with Google...
                      </>
                    ) : (
                      <>
                        <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                          <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                          <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                          <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                          <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                        </svg>
                        Continue with Google
                      </>
                    )}
                  </Button>

                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <Separator className="w-full" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-background px-2 text-muted-foreground">
                        Or continue with email
                      </span>
                    </div>
                  </div>

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
                      <div className="text-right">
                        <button
                          type="button"
                          className="text-sm text-primary hover:underline"
                          onClick={() => setShowForgotPassword(true)}
                          disabled={isLoading || rateLimited}
                        >
                          Forgot password?
                        </button>
                      </div>
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
                </div>
              </TabsContent>
              
              <TabsContent value="signup">
                <div className="space-y-4">
                  <Button 
                    onClick={handleGoogleSignUp}
                    variant="outline" 
                    className="w-full" 
                    disabled={isLoading || rateLimited || isGoogleLoading}
                  >
                    {isGoogleLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Signing up with Google...
                      </>
                    ) : (
                      <>
                        <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                          <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                          <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                          <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                          <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                        </svg>
                        Sign up with Google
                      </>
                    )}
                  </Button>

                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <Separator className="w-full" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-background px-2 text-muted-foreground">
                        Or continue with email
                      </span>
                    </div>
                  </div>

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
                </div>
              </TabsContent>
            </Tabs>
          ) : (
            // For standalone signup page, show only signup form
            <div className="space-y-4">
              <Button 
                onClick={handleGoogleSignUp}
                variant="outline" 
                className="w-full" 
                disabled={isLoading || rateLimited || isGoogleLoading}
              >
                {isGoogleLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Signing up with Google...
                  </>
                ) : (
                  <>
                    <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                      <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                      <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </svg>
                    Sign up with Google
                  </>
                )}
              </Button>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <Separator className="w-full" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">
                    Or continue with email
                  </span>
                </div>
              </div>

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
            </div>
          )}

          {rateLimited && (
            <div className="mt-4 text-center text-sm text-red-500">
              Too many attempts. Please wait before trying again.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
