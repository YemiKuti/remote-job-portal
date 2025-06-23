
import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { passwordSchema } from "@/utils/security";
import { SecureInput } from "@/components/security/SecureInput";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function ResetPassword() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [isValidSession, setIsValidSession] = useState(false);
  const [isCheckingSession, setIsCheckingSession] = useState(true);

  useEffect(() => {
    const handlePasswordRecovery = async () => {
      try {
        // Parse URL parameters for recovery tokens
        const hash = window.location.hash.substring(1);
        const search = window.location.search;
        const hashParams = new URLSearchParams(hash);
        const searchParams = new URLSearchParams(search);
        
        // Check for recovery parameters
        const type = hashParams.get('type') || searchParams.get('type');
        const accessToken = hashParams.get('access_token') || searchParams.get('access_token');
        const refreshToken = hashParams.get('refresh_token') || searchParams.get('refresh_token');
        
        console.log('🔐 Reset Password: Checking recovery tokens', { 
          type, 
          hasAccessToken: !!accessToken, 
          hasRefreshToken: !!refreshToken 
        });

        if (type === 'recovery' && accessToken) {
          if (refreshToken) {
            // Standard recovery flow with both tokens
            console.log('🔐 Reset Password: Setting up session with tokens');
            const { data, error } = await supabase.auth.setSession({
              access_token: accessToken,
              refresh_token: refreshToken
            });

            if (error) {
              console.error('🔐 Reset Password: Session setup error:', error);
              toast.error('Invalid or expired reset link. Please request a new one.');
              navigate('/auth');
              return;
            }

            console.log('🔐 Reset Password: Session established successfully');
            setIsValidSession(true);
            toast.success('Please set your new password below.');
            
            // Clean up URL without causing page reload
            window.history.replaceState({}, document.title, window.location.pathname);
          } else {
            // Handle case where only access token is present
            console.log('🔐 Reset Password: Access token only, attempting to verify session');
            
            // Try to get the current session to see if we can proceed
            const { data: { session }, error: sessionError } = await supabase.auth.getSession();
            
            if (session && !sessionError) {
              console.log('🔐 Reset Password: Valid session found');
              setIsValidSession(true);
              toast.success('Please set your new password below.');
              window.history.replaceState({}, document.title, window.location.pathname);
            } else {
              console.log('🔐 Reset Password: No valid session, redirecting to auth');
              toast.error('Invalid or expired reset link. Please request a new one.');
              navigate('/auth');
              return;
            }
          }
        } else {
          console.log('🔐 Reset Password: No recovery tokens found, redirecting');
          toast.error('Invalid reset link. Please request a new password reset.');
          navigate('/auth');
          return;
        }
      } catch (error) {
        console.error('🔐 Reset Password: Error during recovery setup:', error);
        toast.error('An error occurred. Please try requesting a new reset link.');
        navigate('/auth');
      } finally {
        setIsCheckingSession(false);
      }
    };

    handlePasswordRecovery();
  }, [location, navigate]);

  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newPassword || !confirmNewPassword) {
      toast.error('Please fill in all fields');
      return;
    }

    try {
      passwordSchema.parse(newPassword);
    } catch (error: any) {
      toast.error(error.errors[0]?.message || "Password does not meet requirements");
      return;
    }

    if (newPassword !== confirmNewPassword) {
      toast.error('Passwords do not match');
      return;
    }

    setIsLoading(true);

    try {
      console.log('🔐 Reset Password: Attempting to update password');
      
      // Update the user's password
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) {
        console.error('🔐 Reset Password: Password update error:', error);
        throw error;
      }

      console.log('🔐 Reset Password: Password updated successfully');
      toast.success('Password updated successfully! Redirecting to sign in...');
      
      // Sign out the user to ensure clean state
      await supabase.auth.signOut();
      
      // Small delay before redirect to ensure the toast is visible
      setTimeout(() => {
        navigate('/auth', { 
          replace: true,
          state: { message: 'Password updated successfully. Please sign in with your new password.' }
        });
      }, 1500);

    } catch (error: any) {
      console.error('🔐 Reset Password: Password update failed:', error);
      
      if (error.message?.includes('session_not_found') || error.message?.includes('invalid_token')) {
        toast.error('Your reset link has expired. Please request a new password reset.');
        navigate('/auth');
      } else {
        toast.error('Failed to update password. Please try again or request a new reset link.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (isCheckingSession) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-grow flex items-center justify-center">
          <div className="space-y-4 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="text-muted-foreground">Verifying reset link...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!isValidSession) {
    return null; // Will redirect in useEffect
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow flex items-center justify-center px-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold">Set New Password</CardTitle>
            <CardDescription>
              Enter your new password below
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handlePasswordUpdate} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="new-password">New Password</Label>
                <SecureInput
                  id="new-password"
                  type="password"
                  placeholder="Enter your new password"
                  value={newPassword}
                  onSecureChange={setNewPassword}
                  disabled={isLoading}
                  required
                />
                <p className="text-xs text-gray-600">
                  Password must be at least 8 characters with uppercase, lowercase, number, and special character
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirm-new-password">Confirm New Password</Label>
                <SecureInput
                  id="confirm-new-password"
                  type="password"
                  placeholder="Confirm your new password"
                  value={confirmNewPassword}
                  onSecureChange={setConfirmNewPassword}
                  disabled={isLoading}
                  required
                />
              </div>
              <div className="space-y-4">
                <Button 
                  type="submit" 
                  className="w-full" 
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Updating password...
                    </>
                  ) : (
                    "Update Password"
                  )}
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  className="w-full"
                  onClick={() => navigate('/auth')}
                  disabled={isLoading}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </main>
      <Footer />
    </div>
  );
}
