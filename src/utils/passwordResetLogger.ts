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
  attempted_at?: string;
}

export const logPasswordResetAttempt = async (attempt: PasswordResetAttempt) => {
  try {
    // Log to security system first
    await logSecurityEvent({
      event_type: attempt.success ? 'admin_action' : 'suspicious_activity',
      user_id: attempt.user_id,
      details: {
        action: 'password_reset_attempt',
        ...attempt
      },
      severity: attempt.success ? 'medium' : 'high'
    });

    // Store in password_reset_attempts table
    const { error } = await supabase
      .from('password_reset_attempts')
      .insert({
        user_id: attempt.user_id,
        email: attempt.email,
        success: attempt.success,
        error_message: attempt.error_message,
        ip_address: attempt.ip_address || 'client-side',
        user_agent: attempt.user_agent,
        recovery_token_preview: attempt.recovery_token_preview,
        attempted_at: attempt.attempted_at || new Date().toISOString()
      });

    if (error) {
      console.error('Failed to store password reset attempt:', error);
      // Fall back to localStorage if database insert fails
      fallbackToLocalStorage(attempt);
    } else {
      console.log('🔐 Password reset attempt logged successfully to database');
    }
    
  } catch (error) {
    console.error('Failed to log password reset attempt:', error);
    // Fall back to localStorage on any error
    fallbackToLocalStorage(attempt);
  }
};

const fallbackToLocalStorage = (attempt: PasswordResetAttempt) => {
  try {
    const logEntry = {
      ...attempt,
      timestamp: attempt.attempted_at || new Date().toISOString()
    };

    const existingLogs = JSON.parse(localStorage.getItem('password_reset_attempts') || '[]');
    existingLogs.push(logEntry);
    
    // Keep only the last 50 logs to prevent localStorage bloat
    if (existingLogs.length > 50) {
      existingLogs.splice(0, existingLogs.length - 50);
    }
    
    localStorage.setItem('password_reset_attempts', JSON.stringify(existingLogs));
    console.log('🔐 Password reset attempt logged to localStorage as fallback');
  } catch (error) {
    console.error('Failed to store password reset attempt in localStorage:', error);
  }
};

export const getPasswordResetAttempts = async (userId?: string) => {
  try {
    let query = supabase
      .from('password_reset_attempts')
      .select('*')
      .order('attempted_at', { ascending: false })
      .limit(100);

    if (userId) {
      query = query.eq('user_id', userId);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Failed to fetch password reset attempts from database:', error);
      // Fall back to localStorage
      return getPasswordResetAttemptsFromLocalStorage(userId);
    }

    return data || [];
  } catch (error) {
    console.error('Failed to get password reset attempts:', error);
    // Fall back to localStorage
    return getPasswordResetAttemptsFromLocalStorage(userId);
  }
};

const getPasswordResetAttemptsFromLocalStorage = (userId?: string) => {
  try {
    const logs = JSON.parse(localStorage.getItem('password_reset_attempts') || '[]');
    
    if (userId) {
      return logs.filter((log: any) => log.user_id === userId);
    }
    
    return logs;
  } catch (error) {
    console.error('Failed to get password reset attempts from localStorage:', error);
    return [];
  }
};

export const detectSuspiciousResetActivity = async (email: string) => {
  try {
    const oneHourAgo = new Date(Date.now() - (60 * 60 * 1000)).toISOString();
    
    const { data: recentAttempts, error } = await supabase
      .from('password_reset_attempts')
      .select('*')
      .eq('email', email)
      .gte('attempted_at', oneHourAgo);

    if (error) {
      console.error('Failed to check suspicious reset activity:', error);
      return false;
    }

    // Flag as suspicious if more than 5 attempts in the last hour
    if (recentAttempts && recentAttempts.length > 5) {
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
