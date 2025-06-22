
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
    const checkResetSession = async () => {
      console.log('🔐 ResetPassword: Checking reset session');
      
      // Parse URL parameters for recovery tokens
      const hash = window.location.hash.substring(1);
      const hashParams = new URLSearchParams(hash);
      
      // Also check search params as fallback
      const searchParams = new URLSearchParams(location.search);
      
      // Check both hash and query parameters for tokens
      const type = hashParams.get('type') || searchParams.get('type');
      const accessToken = hashParams.get('access_token') || searchParams.get('access_token');
      const refreshToken = hashParams.get('refresh_token') || searchParams.get('refresh_token');

      console.log('🔐 ResetPassword: Recovery parameters:', { 
        type, 
        hasAccessToken: !!accessToken, 
        hasRefreshToken: !!refreshToken,
        hash,
        search: location.search
      });

      if (type === 'recovery' && accessToken && refreshToken) {
        console.log('🔐 ResetPassword: Valid recovery tokens found, setting up session');
        
        try {
          // Set the session with the recovery tokens
          const { data, error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken
          });

          if (error) {
            console.error('🔐 ResetPassword: Error setting recovery session:', error);
            toast.error('Invalid or expired reset link. Please request a new password reset.');
            navigate('/signin');
            return;
          }

          if (data.session) {
            console.log('🔐 ResetPassword: Recovery session established successfully');
            setIsValidSession(true);
            toast.success('Please set your new password below.');
            // Clean up the URL parameters
            window.history.replaceState({}, document.title, window.location.pathname);
          } else {
            console.error('🔐 ResetPassword: No session returned from setSession');
            toast.error('Invalid reset link. Please request a new password reset.');
            navigate('/signin');
          }
        } catch (error) {
          console.error('🔐 ResetPassword: Exception during session setup:', error);
          toast.error('Invalid reset link. Please request a new password reset.');
          navigate('/signin');
        }
      } else {
        console.log('🔐 ResetPassword: No valid recovery tokens found, redirecting to signin');
        toast.error('Invalid reset link. Please request a new password reset.');
        navigate('/signin');
      }
      
      setIsCheckingSession(false);
    };

    checkResetSession();
  }, [location, navigate]);

  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log('🔐 ResetPassword: Starting password update process');
    
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
      // Verify we have a valid session
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        console.error('🔐 ResetPassword: No active session for password update');
        toast.error('Session expired. Please request a new password reset.');
        navigate('/signin');
        return;
      }

      console.log('🔐 ResetPassword: Updating password with valid session');

      // Update the user's password
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) {
        console.error('🔐 ResetPassword: Error updating password:', error);
        throw error;
      }

      console.log('🔐 ResetPassword: Password updated successfully');
      
      // Sign out to ensure clean state
      await supabase.auth.signOut();
      
      toast.success('Password updated successfully! Please sign in with your new password.');
      navigate('/signin');
    } catch (error: any) {
      console.error('🔐 ResetPassword: Exception during password update:', error);
      
      if (error.message?.includes('session_not_found') || error.message?.includes('invalid_session')) {
        toast.error('Session expired. Please request a new password reset.');
        navigate('/signin');
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
                  onClick={() => navigate('/signin')}
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
