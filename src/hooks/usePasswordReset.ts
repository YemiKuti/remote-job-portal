
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { logPasswordResetAttempt } from '@/utils/passwordResetLogger';
import { sanitizeInput, passwordSchema } from '@/utils/security';
import { toast } from 'sonner';

interface PasswordResetSession {
  user_id?: string;
  email?: string;
  recovery_token?: string;
}

export const usePasswordReset = () => {
  const [isLoading, setIsLoading] = useState(false);
  
  const logAttempt = async (
    success: boolean, 
    sessionData: PasswordResetSession,
    errorMessage?: string
  ) => {
    try {
      await logPasswordResetAttempt({
        user_id: sessionData.user_id,
        email: sessionData.email,
        success,
        error_message: errorMessage,
        user_agent: navigator.userAgent,
        ip_address: 'client-side', // In production, this would come from server
        recovery_token_preview: sessionData.recovery_token?.substring(0, 8) + '...',
        attempted_at: new Date().toISOString()
      });
    } catch (error) {
      console.error('Failed to log password reset attempt:', error);
    }
  };

  const validatePassword = (password: string, confirmPassword: string) => {
    const errors: {[key: string]: string} = {};
    
    if (!password || !confirmPassword) {
      errors.general = 'Please fill in all fields';
      return { isValid: false, errors };
    }

    try {
      passwordSchema.parse(password);
    } catch (error: any) {
      errors.password = error.errors[0]?.message || "Password does not meet requirements";
    }

    if (password !== confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }

    // Additional security checks
    if (password.length > 128) {
      errors.password = 'Password is too long (max 128 characters)';
    }

    return { isValid: Object.keys(errors).length === 0, errors };
  };

  const resetPassword = async (
    newPassword: string, 
    confirmPassword: string,
    sessionData: PasswordResetSession
  ) => {
    const validation = validatePassword(newPassword, confirmPassword);
    if (!validation.isValid) {
      return { success: false, errors: validation.errors };
    }

    setIsLoading(true);

    try {
      console.log('🔐 Attempting to update password');
      
      // Sanitize input
      const sanitizedPassword = sanitizeInput(newPassword);
      
      // Update the user's password
      const { error } = await supabase.auth.updateUser({
        password: sanitizedPassword
      });

      if (error) {
        console.error('🔐 Password update error:', error);
        await logAttempt(false, sessionData, error.message);
        
        let errorMessage = 'Failed to update password. Please try again.';
        
        if (error.message?.includes('session_not_found') || error.message?.includes('invalid_token')) {
          errorMessage = 'Your reset link has expired. Please request a new password reset.';
        } else if (error.message?.includes('same_password')) {
          errorMessage = 'Please choose a different password from your current one.';
        }
        
        return { success: false, error: errorMessage };
      }

      console.log('🔐 Password updated successfully');
      await logAttempt(true, sessionData);
      
      toast.success('Password updated successfully!');
      
      // Sign out the user to ensure clean state
      await supabase.auth.signOut();
      
      return { success: true };

    } catch (error: any) {
      console.error('🔐 Password update failed:', error);
      await logAttempt(false, sessionData, error.message);
      
      let errorMessage = 'Failed to update password. Please try again or request a new reset link.';
      
      if (error.message?.includes('session_not_found') || error.message?.includes('invalid_token')) {
        errorMessage = 'Your reset link has expired. Please request a new password reset.';
      }
      
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  };

  return {
    resetPassword,
    validatePassword,
    logPasswordResetAttempt: logAttempt,
    isLoading
  };
};
