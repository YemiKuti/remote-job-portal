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

    // Try to log to database using the secure function
    try {
      const { error } = await supabase.rpc('log_security_event', {
        event_type: event.event_type,
        user_id: event.user_id || session.data.session?.user?.id,
        ip_address: null, // Will be populated by database if available
        user_agent: userAgent,
        details: event.details || {},
        severity: event.severity
      });

      if (error) {
        console.error('Failed to log to database, falling back to localStorage:', error);
        fallbackToLocalStorage(event, timestamp, sessionId, userAgent);
      }
    } catch (dbError) {
      console.error('Database logging failed, using localStorage fallback:', dbError);
      fallbackToLocalStorage(event, timestamp, sessionId, userAgent);
    }

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
  try {
    // Try to get logs from database first
    const { data, error } = await supabase
      .from('security_logs')
      .select('*')
      .order('timestamp', { ascending: false })
      .limit(100);

    if (!error && data) {
      return data.map(log => ({
        event_type: log.event_type as SecurityEvent['event_type'],
        user_id: log.user_id,
        ip_address: log.ip_address,
        user_agent: log.user_agent,
        details: log.details,
        severity: log.severity as SecurityEvent['severity']
      }));
    }
  } catch (error) {
    console.error('Failed to fetch security logs from database:', error);
  }

  // Fallback to localStorage
  try {
    return JSON.parse(localStorage.getItem('security_logs') || '[]');
  } catch {
    return [];
  }
};

export const clearSecurityLogs = async () => {
  // Clear from database (admin only)
  try {
    const { error } = await supabase
      .from('security_logs')
      .delete()
      .gte('timestamp', '1970-01-01'); // Delete all

    if (error) {
      console.error('Failed to clear database logs:', error);
    }
  } catch (error) {
    console.error('Error clearing database logs:', error);
  }

  // Clear localStorage fallback
  localStorage.removeItem('security_logs');
};
