
import { Button } from "@/components/ui/button";
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/components/AuthProvider";
import { useAdminStatus } from "@/hooks/useAdminStatus";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LogIn, User, Building, ShieldCheck, UserPlus, Briefcase } from "lucide-react";

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isAuthDialogOpen, setIsAuthDialogOpen] = useState(false);
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { isAdmin, loading: adminLoading } = useAdminStatus();

  const getInitials = (name?: string) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const handleRoleSelection = (role: "candidate" | "employer") => {
    setIsAuthDialogOpen(false);
    navigate(`/auth?role=${role}`);
  };

  const handleSocialSignIn = (provider: string) => {
    setIsAuthDialogOpen(false);
    navigate(`/auth?provider=${provider}`);
  };

  const userRole = user?.user_metadata?.role;

  return (
    <header className="bg-white shadow-sm sticky top-0 z-10">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <Link to="/" className="flex items-center">
          <img
            src="/lovable-uploads/c3d4b18f-b8eb-4077-bed6-b984759a5c02.png"
            alt="Logo"
            className="h-10 w-auto"
          />
        </Link>
        <div className="hidden md:flex space-x-6">
          <Link to="/" className="text-gray-600 hover:text-gray-900">
            Home
          </Link>
          <Link to="/jobs" className="text-gray-600 hover:text-gray-900 flex items-center gap-1">
            <Briefcase className="h-4 w-4" />
            Browse Jobs
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
                  <AvatarFallback>{getInitials(user.user_metadata?.full_name)}</AvatarFallback>
                </Avatar>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => navigate('/profile')}>
                  Profile
                </DropdownMenuItem>
                {user.user_metadata?.role === 'candidate' && (
                  <>
                    <DropdownMenuItem onClick={() => navigate('/candidate')}>
                      Candidate Dashboard
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate('/jobs')}>
                      <Briefcase className="mr-2 h-4 w-4" />
                      Browse Jobs
                    </DropdownMenuItem>
                  </>
                )}
                {user.user_metadata?.role === 'employer' && (
                  <DropdownMenuItem onClick={() => navigate('/employer')}>
                    Employer Dashboard
                  </DropdownMenuItem>
                )}
                {!adminLoading && isAdmin && userRole !== 'employer' && (
                  <DropdownMenuItem onClick={() => navigate('/admin')}>
                    Admin Dashboard
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => signOut()}>
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="flex items-center space-x-2">
              <Dialog open={isAuthDialogOpen} onOpenChange={setIsAuthDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" className="flex items-center gap-2">
                    <LogIn className="h-4 w-4" />
                    Sign In
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle>Sign In or Create Account</DialogTitle>
                    <DialogDescription>
                      Choose how you'd like to continue
                    </DialogDescription>
                  </DialogHeader>
                  <div className="py-4">
                    <Tabs defaultValue="signin" className="w-full">
                      <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="signin">Sign In</TabsTrigger>
                        <TabsTrigger value="signup">Sign Up</TabsTrigger>
                      </TabsList>

                      <TabsContent value="signin" className="mt-4 space-y-4">
                        <div className="grid grid-cols-1 gap-4">
                          <Button 
                            onClick={() => handleRoleSelection("candidate")}
                            className="bg-job-green hover:bg-job-darkGreen flex items-center gap-2 h-12"
                          >
                            <User className="h-5 w-5" />
                            Continue as a Candidate
                          </Button>
                          <Button 
                            onClick={() => handleRoleSelection("employer")}
                            className="bg-job-green hover:bg-job-darkGreen flex items-center gap-2 h-12"
                          >
                            <Building className="h-5 w-5" />
                            Continue as an Employer
                          </Button>
                          <Button 
                            onClick={() => navigate("/admin-signin")}
                            className="bg-gray-800 hover:bg-gray-900 flex items-center gap-2 h-12"
                          >
                            <ShieldCheck className="h-5 w-5" />
                            Administrator Access
                          </Button>
                        </div>
                        <div className="relative">
                          <div className="absolute inset-0 flex items-center">
                            <span className="w-full border-t" />
                          </div>
                          <div className="relative flex justify-center text-xs uppercase">
                            <span className="bg-background px-2 text-muted-foreground">
                              Or continue with
                            </span>
                          </div>
                        </div>
                        <div className="grid grid-cols-1 gap-4">
                          <Button variant="outline" onClick={() => handleSocialSignIn("google")}>
                            <svg xmlns="http://www.w3.org/2000/svg" height="1em" viewBox="0 0 488 512" className="mr-2 h-4 w-4 fill-current">
                              <path d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z"/>
                            </svg>
                            Google
                          </Button>
                        </div>
                      </TabsContent>

                      <TabsContent value="signup" className="mt-4 space-y-4">
                        <div className="grid grid-cols-1 gap-4">
                          <Button 
                            onClick={() => handleRoleSelection("candidate")}
                            className="bg-job-green hover:bg-job-darkGreen flex items-center gap-2 h-12"
                          >
                            <User className="h-5 w-5" />
                            Sign up as a Candidate
                          </Button>
                          <Button 
                            onClick={() => handleRoleSelection("employer")}
                            className="bg-job-green hover:bg-job-darkGreen flex items-center gap-2 h-12"
                          >
                            <Building className="h-5 w-5" />
                            Sign up as an Employer
                          </Button>
                        </div>
                        <div className="relative">
                          <div className="absolute inset-0 flex items-center">
                            <span className="w-full border-t" />
                          </div>
                          <div className="relative flex justify-center text-xs uppercase">
                            <span className="bg-background px-2 text-muted-foreground">
                              Or sign up with
                            </span>
                          </div>
                        </div>
                        <div className="grid grid-cols-1 gap-4">
                          <Button variant="outline" onClick={() => handleSocialSignIn("google")}>
                            <svg xmlns="http://www.w3.org/2000/svg" height="1em" viewBox="0 0 488 512" className="mr-2 h-4 w-4 fill-current">
                              <path d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z"/>
                            </svg>
                            Google
                          </Button>
                        </div>
                      </TabsContent>
                    </Tabs>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
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
              to="/jobs"
              className="px-4 py-2 rounded-md hover:bg-gray-100 flex items-center gap-2"
              onClick={() => setIsMenuOpen(false)}
            >
              <Briefcase className="h-4 w-4" />
              Browse Jobs
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
            {!user && (
              <Button 
                onClick={() => {
                  setIsMenuOpen(false);
                  setIsAuthDialogOpen(true);
                }}
                variant="outline"
                className="flex items-center gap-2 justify-start"
              >
                <LogIn className="h-4 w-4" />
                Sign In
              </Button>
            )}
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
