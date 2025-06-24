
import { supabase } from '@/integrations/supabase/client';
import { logSecurityEvent } from './securityLogger';

interface PasswordResetAttempt {
  user_id?: string;
  email?: string;
  success: boolean;
  error_message?: string;
  ip_address?: string;
  user_agent: string;
  recovery_token_preview?: string;
  timestamp: string;
}

export const logPasswordResetAttempt = async (attempt: PasswordResetAttempt) => {
  try {
    // Log to security system
    await logSecurityEvent({
      event_type: attempt.success ? 'admin_action' : 'suspicious_activity',
      user_id: attempt.user_id,
      details: {
        action: 'password_reset_attempt',
        ...attempt
      },
      severity: attempt.success ? 'medium' : 'high'
    });

    // In production, you might want to store password reset attempts in a dedicated table
    // This would require creating a password_reset_attempts table
    /*
    const { error } = await supabase
      .from('password_reset_attempts')
      .insert({
        user_id: attempt.user_id,
        email: attempt.email,
        success: attempt.success,
        error_message: attempt.error_message,
        ip_address: attempt.ip_address,
        user_agent: attempt.user_agent,
        recovery_token_preview: attempt.recovery_token_preview,
        attempted_at: attempt.timestamp
      });

    if (error) {
      console.error('Failed to store password reset attempt:', error);
    }
    */

    console.log('🔐 Password reset attempt logged successfully');
    
  } catch (error) {
    console.error('Failed to log password reset attempt:', error);
  }
};

export const getPasswordResetAttempts = async (userId?: string) => {
  try {
    // This would fetch from the password_reset_attempts table in production
    // For now, return security logs related to password resets
    const logs = JSON.parse(localStorage.getItem('security_logs') || '[]');
    
    return logs.filter((log: any) => 
      log.details?.action === 'password_reset_attempt' &&
      (!userId || log.user_id === userId)
    );
  } catch (error) {
    console.error('Failed to get password reset attempts:', error);
    return [];
  }
};

export const detectSuspiciousResetActivity = async (email: string) => {
  try {
    const attempts = await getPasswordResetAttempts();
    const recentAttempts = attempts.filter((attempt: any) => {
      const attemptTime = new Date(attempt.timestamp).getTime();
      const oneHourAgo = Date.now() - (60 * 60 * 1000);
      return attemptTime > oneHourAgo && attempt.details?.email === email;
    });

    // Flag as suspicious if more than 5 attempts in the last hour
    if (recentAttempts.length > 5) {
      await logSecurityEvent({
        event_type: 'suspicious_activity',
        details: {
          action: 'suspicious_password_reset_activity',
          email,
          attempt_count: recentAttempts.length,
          timeframe: '1_hour'
        },
        severity: 'critical'
      });

      return true;
    }

    return false;
  } catch (error) {
    console.error('Failed to detect suspicious reset activity:', error);
    return false;
  }
};
