import { supabase } from '@/integrations/supabase/client';

export interface SecurityEvent {
  event_type: 'admin_login' | 'failed_login' | 'role_change' | 'data_access' | 'suspicious_activity';
  user_id?: string;
  ip_address?: string;
  user_agent?: string;
  details?: Record<string, any>;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

export const logSecurityEvent = async (event: SecurityEvent) => {
  try {
    const timestamp = new Date().toISOString();
    const logEntry = {
      ...event,
      timestamp,
      session_id: await supabase.auth.getSession().then(({ data }) => data.session?.access_token?.substring(0, 8))
    };

    // Log to console for immediate visibility
    console.log(`[SECURITY ${event.severity.toUpperCase()}]`, logEntry);

    // In a production environment, you would send this to a security monitoring service
    // For now, we'll store it in localStorage for demo purposes
    const existingLogs = JSON.parse(localStorage.getItem('security_logs') || '[]');
    existingLogs.push(logEntry);
    
    // Keep only the last 100 logs to prevent localStorage bloat
    if (existingLogs.length > 100) {
      existingLogs.splice(0, existingLogs.length - 100);
    }
    
    localStorage.setItem('security_logs', JSON.stringify(existingLogs));

    // Log admin activities to console for immediate monitoring
    if (event.event_type === 'admin_login' || event.severity === 'high' || event.severity === 'critical') {
      console.warn('🚨 SECURITY ALERT:', logEntry);
    }

  } catch (error) {
    console.error('Failed to log security event:', error);
  }
};

export const getSecurityLogs = (): SecurityEvent[] => {
  try {
    return JSON.parse(localStorage.getItem('security_logs') || '[]');
  } catch {
    return [];
  }
};

export const clearSecurityLogs = () => {
  localStorage.removeItem('security_logs');
};
