import { Button } from "@/components/ui/button";
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "./AuthProvider";
import { supabase } from "@/integrations/supabase/client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  const getInitials = (name?: string) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  return (
    <header className="bg-white shadow-sm sticky top-0 z-10">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <Link to="/" className="flex items-center space-x-2">
          <img
            src="/lovable-uploads/c3d4b18f-b8eb-4077-bed6-b984759a5c02.png"
            alt="Logo"
            className="h-8 w-8"
          />
          <span className="text-xl font-bold">Africantechjobs</span>
        </Link>
        <div className="hidden md:flex space-x-6">
          <Link to="/" className="text-gray-600 hover:text-gray-900">
            Home
          </Link>
          <Link to="/pricing" className="text-gray-600 hover:text-gray-900">
            Pricing
          </Link>
          <Link to="/blog" className="text-gray-600 hover:text-gray-900">
            Blog
          </Link>
        </div>
        <div className="flex items-center space-x-4">
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Avatar className="cursor-pointer">
                  <AvatarImage src={user.user_metadata.avatar_url} />
                  <AvatarFallback>{getInitials(user.user_metadata.full_name)}</AvatarFallback>
                </Avatar>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => navigate('/profile')}>
                  Profile
                </DropdownMenuItem>
                {user.user_metadata.role === 'admin' && (
                  <DropdownMenuItem onClick={() => navigate('/admin')}>
                    Admin Dashboard
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem onClick={handleSignOut}>
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button variant="outline" onClick={() => navigate('/auth')}>
              Sign In
            </Button>
          )}
          <Button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden"
            variant="ghost"
            size="icon"
          >
            <MenuIcon className="h-6 w-6" />
            <span className="sr-only">Toggle menu</span>
          </Button>
        </div>
      </div>
      {isMenuOpen && (
        <div className="md:hidden px-4 pb-4">
          <nav className="flex flex-col space-y-2">
            <Link
              to="/"
              className="px-4 py-2 rounded-md hover:bg-gray-100"
              onClick={() => setIsMenuOpen(false)}
            >
              Home
            </Link>
            <Link
              to="/pricing"
              className="px-4 py-2 rounded-md hover:bg-gray-100"
              onClick={() => setIsMenuOpen(false)}
            >
              Pricing
            </Link>
            <Link
              to="/blog"
              className="px-4 py-2 rounded-md hover:bg-gray-100"
              onClick={() => setIsMenuOpen(false)}
            >
              Blog
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}

function MenuIcon(props) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="4" x2="20" y1="12" y2="12" />
      <line x1="4" x2="20" y1="6" y2="6" />
      <line x1="4" x2="20" y1="18" y2="18" />
    </svg>
  );
}
