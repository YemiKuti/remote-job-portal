
import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2, AlertCircle, CheckCircle, Shield } from "lucide-react";
import { passwordSchema, sanitizeInput } from "@/utils/security";
import { SecureInput } from "@/components/security/SecureInput";
import { logSecurityEvent } from "@/utils/securityLogger";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

interface ResetAttemptData {
  success: boolean;
  error_message?: string;
  user_agent: string;
  ip_address: string;
}

export default function ResetPassword() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [isValidSession, setIsValidSession] = useState(false);
  const [isCheckingSession, setIsCheckingSession] = useState(true);
  const [sessionData, setSessionData] = useState<{
    user_id?: string;
    email?: string;
    recovery_token?: string;
  }>({});
  const [validationErrors, setValidationErrors] = useState<{[key: string]: string}>({});

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
              await logPasswordResetAttempt(false, `Session setup failed: ${error.message}`);
              toast.error('Invalid or expired reset link. Please request a new one.');
              navigate('/auth');
              return;
            }

            console.log('🔐 Reset Password: Session established successfully');
            
            // Store session data for logging
            setSessionData({
              user_id: data.user?.id,
              email: data.user?.email,
              recovery_token: accessToken.substring(0, 8) + '...'
            });
            
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
              setSessionData({
                user_id: session.user?.id,
                email: session.user?.email,
                recovery_token: accessToken.substring(0, 8) + '...'
              });
              setIsValidSession(true);
              toast.success('Please set your new password below.');
              window.history.replaceState({}, document.title, window.location.pathname);
            } else {
              console.log('🔐 Reset Password: No valid session, redirecting to auth');
              await logPasswordResetAttempt(false, 'Invalid session state');
              toast.error('Invalid or expired reset link. Please request a new one.');
              navigate('/auth');
              return;
            }
          }
        } else {
          console.log('🔐 Reset Password: No recovery tokens found, redirecting');
          await logPasswordResetAttempt(false, 'No recovery tokens found');
          toast.error('Invalid reset link. Please request a new password reset.');
          navigate('/auth');
          return;
        }
      } catch (error) {
        console.error('🔐 Reset Password: Error during recovery setup:', error);
        await logPasswordResetAttempt(false, `Recovery setup error: ${error}`);
        toast.error('An error occurred. Please try requesting a new reset link.');
        navigate('/auth');
      } finally {
        setIsCheckingSession(false);
      }
    };

    handlePasswordRecovery();
  }, [location, navigate]);

  const logPasswordResetAttempt = async (success: boolean, errorMessage?: string) => {
    try {
      // Log security event
      await logSecurityEvent({
        event_type: success ? 'admin_action' : 'suspicious_activity',
        user_id: sessionData.user_id,
        details: {
          action: 'password_reset_attempt',
          success,
          error_message: errorMessage,
          email: sessionData.email,
          recovery_token_preview: sessionData.recovery_token,
          timestamp: new Date().toISOString(),
          user_agent: navigator.userAgent,
          referrer: document.referrer || 'direct'
        },
        severity: success ? 'medium' : 'high'
      });

      // Store in database for audit trail
      const resetAttemptData: ResetAttemptData = {
        success,
        error_message: errorMessage,
        user_agent: navigator.userAgent,
        ip_address: 'client-side' // In production, this would come from server
      };

      // Note: In production, you'd want to create a password_reset_attempts table
      // For now, we'll use the security logging system
      console.log('🔐 Password reset attempt logged:', resetAttemptData);
      
    } catch (error) {
      console.error('Failed to log password reset attempt:', error);
    }
  };

  const validateInputs = (): boolean => {
    const errors: {[key: string]: string} = {};
    
    if (!newPassword || !confirmNewPassword) {
      errors.general = 'Please fill in all fields';
      setValidationErrors(errors);
      return false;
    }

    try {
      passwordSchema.parse(newPassword);
    } catch (error: any) {
      errors.password = error.errors[0]?.message || "Password does not meet requirements";
    }

    if (newPassword !== confirmNewPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }

    // Additional security checks
    if (newPassword.length > 128) {
      errors.password = 'Password is too long (max 128 characters)';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateInputs()) {
      return;
    }

    setIsLoading(true);

    try {
      console.log('🔐 Reset Password: Attempting to update password');
      
      // Sanitize input
      const sanitizedPassword = sanitizeInput(newPassword);
      
      // Update the user's password
      const { error } = await supabase.auth.updateUser({
        password: sanitizedPassword
      });

      if (error) {
        console.error('🔐 Reset Password: Password update error:', error);
        await logPasswordResetAttempt(false, error.message);
        
        if (error.message?.includes('session_not_found') || error.message?.includes('invalid_token')) {
          toast.error('Your reset link has expired. Please request a new password reset.');
          navigate('/auth');
          return;
        } else if (error.message?.includes('same_password')) {
          toast.error('Please choose a different password from your current one.');
          return;
        } else {
          toast.error('Failed to update password. Please try again.');
          return;
        }
      }

      console.log('🔐 Reset Password: Password updated successfully');
      await logPasswordResetAttempt(true);
      
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
      await logPasswordResetAttempt(false, error.message);
      
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
            <div className="mx-auto mb-4 w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
              <Shield className="h-6 w-6 text-primary" />
            </div>
            <CardTitle className="text-2xl font-bold">Set New Password</CardTitle>
            <CardDescription>
              Create a strong password for enhanced security
            </CardDescription>
          </CardHeader>
          <CardContent>
            {sessionData.email && (
              <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-blue-600" />
                  <span className="text-sm text-blue-800">
                    Resetting password for: {sessionData.email}
                  </span>
                </div>
              </div>
            )}

            {validationErrors.general && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-center space-x-2">
                  <AlertCircle className="h-4 w-4 text-red-600" />
                  <span className="text-sm text-red-800">{validationErrors.general}</span>
                </div>
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
                  className={validationErrors.password ? "border-red-500" : ""}
                  required
                />
                {validationErrors.password && (
                  <p className="text-sm text-red-500">{validationErrors.password}</p>
                )}
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
                  className={validationErrors.confirmPassword ? "border-red-500" : ""}
                  required
                />
                {validationErrors.confirmPassword && (
                  <p className="text-sm text-red-500">{validationErrors.confirmPassword}</p>
                )}
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

            <div className="mt-6 p-3 bg-gray-50 rounded-lg">
              <div className="flex items-start space-x-2">
                <Shield className="h-4 w-4 text-gray-600 mt-0.5" />
                <div className="text-xs text-gray-600">
                  <p className="font-medium mb-1">Security Notice:</p>
                  <p>This password reset session is secure and will expire automatically. Your new password will be encrypted and stored securely.</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
      <Footer />
    </div>
  );
}
