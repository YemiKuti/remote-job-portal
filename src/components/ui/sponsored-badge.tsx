
import React from "react";
import { Badge } from "@/components/ui/badge";
import { Star } from "lucide-react";

interface SponsoredBadgeProps {
  variant?: "default" | "outline" | "secondary";
  size?: "sm" | "md" | "lg";
  className?: string;
}

export const SponsoredBadge = ({ 
  variant = "default", 
  size = "sm",
  className = "" 
}: SponsoredBadgeProps) => {
  const sizeClasses = {
    sm: "text-xs px-2 py-1",
    md: "text-sm px-3 py-1",
    lg: "text-base px-4 py-2"
  };

  return (
    <Badge 
      variant={variant}
      className={`
        ${sizeClasses[size]} 
        bg-gradient-to-r from-yellow-400 to-orange-500 
        text-white 
        font-semibold 
        shadow-sm
        flex items-center gap-1
        ${className}
      `}
    >
      <Star className="h-3 w-3 fill-current" />
      Sponsored
    </Badge>
  );
};
