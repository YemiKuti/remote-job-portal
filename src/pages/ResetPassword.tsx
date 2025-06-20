
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
  const [hasLegacyToken, setHasLegacyToken] = useState(false);

  useEffect(() => {
    const checkResetSession = async () => {
      // Parse URL fragment for recovery tokens
      const hash = window.location.hash.substring(1);
      const hashParams = new URLSearchParams(hash);
      
      // Also check search params as fallback
      const searchParams = new URLSearchParams(location.search);
      
      // Check both hash and query parameters for tokens
      const type = hashParams.get('type') || searchParams.get('type');
      const accessToken = hashParams.get('access_token') || searchParams.get('access_token');
      const refreshToken = hashParams.get('refresh_token') || searchParams.get('refresh_token');
      
      // Handle legacy 'token' parameter from older email formats
      const legacyToken = searchParams.get('token');

      console.log('🔐 Reset session check:', { 
        type, 
        hasAccessToken: !!accessToken, 
        hasRefreshToken: !!refreshToken,
        hasLegacyToken: !!legacyToken,
        hash,
        search: location.search
      });

      // Handle legacy token format - allow password reset without requiring existing session
      if (legacyToken && type === 'recovery') {
        console.log('🔐 Legacy token detected, allowing password reset');
        setHasLegacyToken(true);
        setIsValidSession(true);
        toast.success('Please set your new password below.');
        // Clear the URL parameters to clean up the interface
        window.history.replaceState({}, document.title, window.location.pathname);
      } else if (type === 'recovery' && accessToken && refreshToken) {
        console.log('🔐 Standard recovery tokens detected, setting up session');
        
        try {
          const { error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken
          });

          if (error) {
            console.error('Error setting recovery session:', error);
            toast.error('Invalid recovery link. Please request a new password reset.');
            navigate('/auth');
          } else {
            setIsValidSession(true);
            toast.success('Please set your new password below.');
            // Clear the URL fragment to clean up the interface
            window.history.replaceState({}, document.title, window.location.pathname);
          }
        } catch (error) {
          console.error('Error during session setup:', error);
          toast.error('Invalid recovery link. Please request a new password reset.');
          navigate('/auth');
        }
      } else {
        console.log('🔐 No valid recovery tokens found, redirecting to auth');
        toast.error('Invalid reset link. Please request a new password reset.');
        navigate('/auth');
      }
      
      setIsCheckingSession(false);
    };

    checkResetSession();
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
      // For legacy tokens, we need to handle password update differently
      if (hasLegacyToken) {
        // For legacy tokens, we'll attempt to update the password directly
        // This may require the user to be signed in first
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
          // If no session exists, we can't update the password with legacy tokens
          toast.error('This reset link format is no longer supported. Please request a new password reset.');
          navigate('/auth');
          return;
        }
      }

      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) throw error;

      toast.success('Password updated successfully! You can now sign in with your new password.');
      navigate('/auth');
    } catch (error: any) {
      console.error('Error updating password:', error);
      if (hasLegacyToken) {
        toast.error('This reset link has expired. Please request a new password reset.');
        navigate('/auth');
      } else {
        toast.error('Failed to update password. Please try again.');
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
            {hasLegacyToken && (
              <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                <p className="text-sm text-yellow-800">
                  You're using an older reset link format. If you encounter any issues, please request a new password reset.
                </p>
              </div>
            )}
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
