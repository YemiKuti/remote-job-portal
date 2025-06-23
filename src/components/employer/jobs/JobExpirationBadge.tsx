
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Clock, AlertTriangle } from 'lucide-react';

interface JobExpirationBadgeProps {
  expiresAt: string | null;
  status: string;
}

export const JobExpirationBadge = ({ expiresAt, status }: JobExpirationBadgeProps) => {
  if (!expiresAt || status !== 'active') {
    return null;
  }

  const expirationDate = new Date(expiresAt);
  const now = new Date();
  const daysUntilExpiration = Math.ceil((expirationDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

  if (daysUntilExpiration < 0) {
    return (
      <Badge variant="destructive" className="flex items-center gap-1">
        <AlertTriangle className="h-3 w-3" />
        Expired
      </Badge>
    );
  }

  if (daysUntilExpiration <= 7) {
    return (
      <Badge variant="destructive" className="flex items-center gap-1">
        <Clock className="h-3 w-3" />
        Expires in {daysUntilExpiration} days
      </Badge>
    );
  }

  if (daysUntilExpiration <= 30) {
    return (
      <Badge variant="secondary" className="flex items-center gap-1 bg-yellow-100 text-yellow-800">
        <Clock className="h-3 w-3" />
        Expires in {daysUntilExpiration} days
      </Badge>
    );
  }

  return (
    <Badge variant="outline" className="flex items-center gap-1">
      <Clock className="h-3 w-3" />
      Expires in {daysUntilExpiration} days
    </Badge>
  );
};
