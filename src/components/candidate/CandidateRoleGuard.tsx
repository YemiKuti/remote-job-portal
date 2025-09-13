import React from 'react';
import { useAuth } from '@/components/AuthProvider';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { User, AlertTriangle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

interface CandidateRoleGuardProps {
  children: React.ReactNode;
  feature?: string;
  fallback?: React.ReactNode;
}

export const CandidateRoleGuard: React.FC<CandidateRoleGuardProps> = ({ 
  children, 
  feature = 'this feature',
  fallback 
}) => {
  const { user, isLoading: authLoading } = useAuth();
  const [isCandidate, setIsCandidate] = React.useState<boolean | null>(null);
  const [loading, setLoading] = React.useState(true);
  const navigate = useNavigate();

  React.useEffect(() => {
    const checkCandidateRole = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        const { data: userRoles } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', user.id);
        
        const isAdmin = userRoles?.some(r => r.role === 'admin');
        const isEmployer = userRoles?.some(r => r.role === 'employer');
        
        // User is candidate if they're not admin or employer
        setIsCandidate(!isAdmin && !isEmployer);
      } catch (error) {
        console.error('Error checking candidate role:', error);
        setIsCandidate(false);
      } finally {
        setLoading(false);
      }
    };

    checkCandidateRole();
  }, [user]);

  // Show loading state
  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground">Verifying access...</p>
        </div>
      </div>
    );
  }

  // User not authenticated
  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <Alert className="max-w-md">
          <User className="h-4 w-4" />
          <AlertDescription>
            Please sign in to access {feature}.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  // User not candidate
  if (!isCandidate) {
    if (fallback) {
      return <>{fallback}</>;
    }

    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <Alert className="max-w-md" variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription className="space-y-4">
            <div>
              {feature} is only available for candidate accounts. 
              Admin and employer accounts cannot access this feature.
            </div>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => navigate('/')}
              >
                Go Home
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => navigate('/admin/dashboard')}
              >
                Admin Dashboard
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  // User is candidate - render children
  return <>{children}</>;
};