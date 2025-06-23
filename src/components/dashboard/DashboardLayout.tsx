
import React, { useState } from 'react';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ModeToggle } from "@/components/ModeToggle"
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/components/AuthProvider';
import { useSubscription } from '@/hooks/useSupabase';
import {
  Briefcase,
  Building,
  Settings,
  Crown,
  Home,
  LayoutDashboard,
  LogOut,
  MessageSquare,
  User,
  Users,
  Menu,
  Sparkles,
  Globe,
  Server,
} from 'lucide-react';
import { Button } from '../ui/button';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '../ui/badge';

interface NavItem {
  name: string;
  href: string;
  icon: React.ComponentType<any>;
  isPremium?: boolean;
}

interface DashboardLayoutProps {
  children: React.ReactNode;
  userType: 'jobSeeker' | 'employer' | 'admin';
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children, userType }) => {
  const { user, signOut } = useAuth();
  const { subscribed } = useSubscription();
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const jobSeekerNavigation: NavItem[] = [
    { name: 'Website Home', href: '/', icon: Globe },
    { name: 'Dashboard', href: '/job-seeker', icon: LayoutDashboard },
    { name: 'Jobs', href: '/job-seeker/jobs', icon: Briefcase },
    { name: 'Saved Jobs', href: '/job-seeker/saved', icon: Home },
    { name: 'Applications', href: '/job-seeker/applications', icon: Users },
    { name: 'Tailored CVs', href: '/candidate/tailored-resumes', icon: Sparkles, isPremium: true },
    { name: 'Messages', href: '/job-seeker/messages', icon: MessageSquare },
    { name: 'Settings', href: '/job-seeker/settings', icon: Settings },
  ];

  const employerNavigation: NavItem[] = [
    { name: 'Website Home', href: '/', icon: Globe },
    { name: 'Dashboard', href: '/employer', icon: LayoutDashboard },
    { name: 'Jobs', href: '/employer/jobs', icon: Briefcase },
    { name: 'Candidates', href: '/employer/candidates', icon: Users },
    { name: 'Messages', href: '/employer/messages', icon: MessageSquare },
    { name: 'Company', href: '/employer/company', icon: Building },
    { name: 'Subscription', href: '/employer/subscription', icon: Crown },
    { name: 'Settings', href: '/employer/settings', icon: Settings },
  ];

  const adminNavigation: NavItem[] = [
    { name: 'Website Home', href: '/', icon: Globe },
    { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
    { name: 'Users', href: '/admin/users', icon: Users },
    { name: 'Jobs', href: '/admin/jobs', icon: Briefcase },
    { name: 'Companies', href: '/admin/companies', icon: Building },
    { name: 'Job Scraper', href: '/job-scraper', icon: Server },
    { name: 'Settings', href: '/admin/settings', icon: Settings },
  ];

  const navigation =
    userType === 'jobSeeker' ? jobSeekerNavigation :
      userType === 'employer' ? employerNavigation :
        adminNavigation;

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/');
      toast({
        title: 'Signed out successfully',
        description: 'Redirecting to the homepage...',
      });
    } catch (error) {
      console.error('Sign out failed:', error);
      toast({
        title: 'Error signing out',
        description: 'Please try again.',
        variant: 'destructive',
      });
    }
  };

  const renderNavItem = (item: NavItem, isMobile: boolean = false) => {
    const isActive = location.pathname === item.href;
    const isPremiumLocked = item.isPremium && !subscribed;
    
    return (
      <Link
        key={item.name}
        to={item.href}
        className={`flex items-center space-x-2 px-4 py-2 rounded-md hover:bg-gray-100 ${
          isActive ? 'bg-gray-100 font-medium' : ''
        } ${isPremiumLocked ? 'opacity-75' : ''}`}
        onClick={() => isMobile && setIsMenuOpen(false)}
      >
        <item.icon className="h-5 w-5" />
        <span className="flex-1">{item.name}</span>
        {isPremiumLocked && (
          <Crown className="h-3 w-3 text-amber-500" />
        )}
      </Link>
    );
  };

  return (
    <div className="flex h-screen bg-gray-50 text-gray-700">
      {/* Mobile Navigation */}
      <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon" className="md:hidden">
            <Menu className="h-6 w-6" />
            <span className="sr-only">Open menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-full sm:w-60">
          <SheetHeader className="text-left">
            <SheetTitle>Dashboard Menu</SheetTitle>
            <SheetDescription>
              Navigate through your dashboard options.
            </SheetDescription>
          </SheetHeader>
          <div className="py-4">
            {navigation.map((item) => renderNavItem(item, true))}
            <Button variant="ghost" className="justify-start w-full" onClick={handleSignOut}>
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </SheetContent>
      </Sheet>

      {/* Desktop Navigation */}
      <aside className="hidden md:flex flex-col w-64 border-r border-gray-200 bg-white">
        <div className="flex items-center justify-center h-16 border-b border-gray-200">
          <Link to="/" className="font-bold text-lg">
            African Tech Jobs
          </Link>
        </div>
        <nav className="flex-grow p-4">
          <ul className="space-y-2">
            {navigation.map((item) => (
              <li key={item.name}>
                {renderNavItem(item)}
              </li>
            ))}
          </ul>
        </nav>
        <div className="p-4 border-t border-gray-200">
          <Button variant="ghost" className="justify-start w-full" onClick={handleSignOut}>
            <LogOut className="h-4 w-4 mr-2" />
            Sign Out
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-4">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-semibold">Dashboard</h1>
          <div className="flex items-center space-x-4">
            <ModeToggle />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0 rounded-full">
                  <Avatar>
                    <AvatarImage src={user?.user_metadata?.avatar_url} alt={user?.email || "Avatar"} />
                    <AvatarFallback>{user?.email?.charAt(0).toUpperCase() || "U"}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem asChild>
                  <Link to="/profile">
                    <User className="h-4 w-4 mr-2" />
                    <span>Profile</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/settings">
                    <Settings className="h-4 w-4 mr-2" />
                    <span>Settings</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut}>
                  <LogOut className="h-4 w-4 mr-2" />
                  <span>Log Out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
        {children}
      </main>
    </div>
  );
};
