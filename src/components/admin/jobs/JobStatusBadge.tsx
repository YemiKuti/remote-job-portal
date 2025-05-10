
import React from "react";
import { Badge } from "@/components/ui/badge";

interface JobStatusBadgeProps {
  status: string;
}

export const JobStatusBadge = ({ status }: JobStatusBadgeProps) => {
  const getStatusStyles = () => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-amber-100 text-amber-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Badge className={`px-2 py-1 rounded-full text-xs ${getStatusStyles()}`}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </Badge>
  );
};
