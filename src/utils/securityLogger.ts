import { supabase } from '@/integrations/supabase/client';

export interface SecurityEvent {
  event_type: 'admin_login' | 'failed_login' | 'role_change' | 'data_access' | 'suspicious_activity' | 'admin_action';
  user_id?: string;
  ip_address?: string;
  user_agent?: string;
  details?: Record<string, any>;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

export const logSecurityEvent = async (event: SecurityEvent) => {
  try {
    const timestamp = new Date().toISOString();
    const session = await supabase.auth.getSession();
    const sessionId = session.data.session?.access_token?.substring(0, 8);

    // Get client IP and user agent
    const userAgent = navigator.userAgent;
    
    // Log to console for immediate visibility
    console.log(`[SECURITY ${event.severity.toUpperCase()}]`, {
      ...event,
      timestamp,
      session_id: sessionId,
      user_agent: userAgent
    });

    // Since security_logs table doesn't exist, use localStorage for now
    fallbackToLocalStorage(event, timestamp, sessionId, userAgent);

    // Log critical events to console for immediate monitoring
    if (event.event_type === 'admin_login' || event.severity === 'high' || event.severity === 'critical') {
      console.warn('🚨 SECURITY ALERT:', {
        ...event,
        timestamp,
        session_id: sessionId
      });
    }

  } catch (error) {
    console.error('Failed to log security event:', error);
  }
};

const fallbackToLocalStorage = (event: SecurityEvent, timestamp: string, sessionId: string | undefined, userAgent: string) => {
  const logEntry = {
    ...event,
    timestamp,
    session_id: sessionId,
    user_agent: userAgent
  };

  const existingLogs = JSON.parse(localStorage.getItem('security_logs') || '[]');
  existingLogs.push(logEntry);
  
  // Keep only the last 100 logs to prevent localStorage bloat
  if (existingLogs.length > 100) {
    existingLogs.splice(0, existingLogs.length - 100);
  }
  
  localStorage.setItem('security_logs', JSON.stringify(existingLogs));
};

export const getSecurityLogs = async (): Promise<SecurityEvent[]> => {
  // For now, use localStorage since security_logs table doesn't exist
  try {
    return JSON.parse(localStorage.getItem('security_logs') || '[]');
  } catch {
    return [];
  }
};

export const clearSecurityLogs = async () => {
  // Clear localStorage logs
  localStorage.removeItem('security_logs');
};
