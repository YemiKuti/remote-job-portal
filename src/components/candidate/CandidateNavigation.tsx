
import React from "react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { 
  User, 
  FileText, 
  Bookmark, 
  MessageSquare, 
  Settings,
  Sparkles
} from "lucide-react";

const CandidateNavigation = () => {
  const location = useLocation();

  const navItems = [
    {
      label: "Profile",
      href: "/candidate/profile",
      icon: User
    },
    {
      label: "Applications",
      href: "/candidate/applications",
      icon: FileText
    },
    {
      label: "Saved Jobs",
      href: "/candidate/saved-jobs",
      icon: Bookmark
    },
    {
      label: "Tailored CVs",
      href: "/candidate/tailored-resumes",
      icon: Sparkles
    },
    {
      label: "Messages",
      href: "/candidate/messages",
      icon: MessageSquare
    },
    {
      label: "Settings",
      href: "/candidate/settings",
      icon: Settings
    }
  ];

  return (
    <nav className="space-y-1">
      {navItems.map((item) => {
        const isActive = location.pathname === item.href;
        const Icon = item.icon;
        
        return (
          <Link
            key={item.href}
            to={item.href}
            className={cn(
              "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors",
              isActive
                ? "bg-blue-100 text-blue-700"
                : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
            )}
          >
            <Icon className="h-4 w-4" />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
};

export default CandidateNavigation;
