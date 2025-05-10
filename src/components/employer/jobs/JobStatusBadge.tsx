
import React from "react";
import { Badge } from "@/components/ui/badge";

interface JobStatusBadgeProps {
  status: string;
}

export const JobStatusBadge = ({ status }: JobStatusBadgeProps) => {
  const getStatusStyles = () => {
    switch (status.toLowerCase()) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-amber-100 text-amber-800';
      case 'draft':
        return 'bg-gray-100 text-gray-800';
      case 'expired':
        return 'bg-red-100 text-red-800';
      case 'filled':
        return 'bg-blue-100 text-blue-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'approved':
        return 'bg-purple-100 text-purple-800';
      case 'archived':
        return 'bg-gray-100 text-gray-600';
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
