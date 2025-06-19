import React, { useState } from 'react';
import { 
  Bell, 
  Home, 
  Settings, 
  LogOut, 
  User, 
  Briefcase, 
  Users, 
  ChevronLeft,
  ChevronRight,
  Menu,
  Search,
  Sparkles,
  Globe
} from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  Sidebar, 
  SidebarContent,
  SidebarFooter,
  SidebarGroup, 
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/components/AuthProvider";
import { UserAvatar } from "@/components/ui/user-avatar";
import { NotificationCenter } from "@/components/candidate/NotificationCenter";
import { EmployerNotificationCenter } from "@/components/employer/EmployerNotificationCenter";

interface DashboardLayoutProps {
  children: React.ReactNode;
  userType: 'candidate' | 'employer' | 'admin';
}

export const DashboardLayout = ({ children, userType }: DashboardLayoutProps) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { signOut, user } = useAuth();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [notificationOpen, setNotificationOpen] = useState(false);
  
  const handleLogout = async () => {
    await signOut();
    toast({
      title: "Logged out",
      description: "You have been successfully logged out.",
    });
    navigate('/');
  };

  const candidateMenuItems = [
    { title: "Website Home", icon: Globe, url: "/" },
    { title: "Dashboard", icon: Home, url: "/candidate" },
    { title: "Profile", icon: User, url: "/candidate/profile" },
    { title: "My Applications", icon: Briefcase, url: "/candidate/applications" },
    { title: "Saved Jobs", icon: Briefcase, url: "/candidate/saved-jobs" },
    { title: "Tailored CVs", icon: Sparkles, url: "/candidate/tailored-resumes" },
    { title: "Messages", icon: Bell, url: "/candidate/messages" },
    { title: "Settings", icon: Settings, url: "/candidate/settings" },
  ];

  const employerMenuItems = [
    { title: "Website Home", icon: Globe, url: "/" },
    { title: "Dashboard", icon: Home, url: "/employer" },
    { title: "Job Listings", icon: Briefcase, url: "/employer/jobs" },
    { title: "Candidates", icon: Users, url: "/employer/candidates" },
    { title: "Company Profile", icon: Briefcase, url: "/employer/company" },
    { title: "Messages", icon: Bell, url: "/employer/messages" },
    { title: "Settings", icon: Settings, url: "/employer/settings" },
  ];

  const adminMenuItems = [
    { title: "Website Home", icon: Globe, url: "/" },
    { title: "Dashboard", icon: Home, url: "/admin" },
    { title: "Users", icon: Users, url: "/admin/users" },
    { title: "Jobs", icon: Briefcase, url: "/admin/jobs" },
    { title: "Companies", icon: Briefcase, url: "/admin/companies" },
    { title: "Job Scraper", icon: Search, url: "/job-scraper" },
    { title: "Settings", icon: Settings, url: "/admin/settings" },
  ];

  const getMenuItems = () => {
    switch (userType) {
      case 'candidate': return candidateMenuItems;
      case 'employer': return employerMenuItems;
      case 'admin': return adminMenuItems;
      default: return [];
    }
  };

  const menuItems = getMenuItems();
  const userTypeLabel = userType.charAt(0).toUpperCase() + userType.slice(1);
  
  const userTypeColors = {
    candidate: 'bg-green-100 text-green-800',
    employer: 'bg-blue-100 text-blue-800',
    admin: 'bg-purple-100 text-purple-800'
  };

  const renderNotificationCenter = () => {
    if (!user?.id) return null;

    switch (userType) {
      case 'candidate':
        return <NotificationCenter userId={user.id} />;
      case 'employer':
        return <EmployerNotificationCenter userId={user.id} />;
      case 'admin':
        return (
          <div className="p-4 text-center text-muted-foreground">
            <Bell className="h-8 w-8 mx-auto mb-2" />
            <p>Admin notifications coming soon</p>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <SidebarProvider>
      <div className="flex h-screen w-full bg-gray-50">
        <Sidebar className={`transition-all duration-300 ${isCollapsed ? 'w-[70px]' : 'w-[240px]'}`}>
          <SidebarHeader className="flex justify-between items-center">
            <div className={`flex items-center gap-2 px-2 ${isCollapsed ? 'justify-center' : ''}`}>
              <UserAvatar 
                fallbackText={userTypeLabel[0]}
                className="h-8 w-8"
              />
              {!isCollapsed && (
                <div className="flex flex-col">
                  <span className="font-medium">{userTypeLabel} Portal</span>
                  <span className="text-xs text-gray-500">Welcome back!</span>
                </div>
              )}
            </div>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="h-8 w-8"
            >
              {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
            </Button>
          </SidebarHeader>
          <SidebarContent>
            <SidebarGroup>
              {!isCollapsed && <SidebarGroupLabel>Navigation</SidebarGroupLabel>}
              <SidebarGroupContent>
                <SidebarMenu>
                  {menuItems.map((item) => (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton 
                        asChild
                        isActive={location.pathname === item.url}
                        tooltip={isCollapsed ? item.title : undefined}
                      >
                        <Link to={item.url} className="flex items-center">
                          <item.icon />
                          {!isCollapsed && <span>{item.title}</span>}
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
          <SidebarFooter>
            <div className="px-4 py-2">
              {isCollapsed ? (
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={handleLogout}
                  className="w-full flex justify-center"
                >
                  <LogOut className="h-4 w-4" />
                </Button>
              ) : (
                <Button 
                  variant="ghost" 
                  className="w-full justify-start gap-2"
                  onClick={handleLogout}
                >
                  <LogOut className="h-4 w-4" />
                  <span>Log out</span>
                </Button>
              )}
            </div>
          </SidebarFooter>
        </Sidebar>
        <div className="flex flex-1 flex-col overflow-hidden">
          <header className="flex h-16 items-center justify-between border-b px-6 bg-white">
            <div className="flex items-center gap-3">
              <Button 
                variant="ghost" 
                size="icon"
                className="lg:hidden"
                onClick={() => setIsCollapsed(!isCollapsed)}
              >
                <Menu className="h-5 w-5" />
              </Button>
              <h1 className="text-2xl font-bold">{userTypeLabel} Portal</h1>
              <span className={`px-2 py-0.5 text-xs rounded-full ${userTypeColors[userType]}`}>
                {userTypeLabel}
              </span>
            </div>
            
            <div className="flex items-center gap-4">
              <Popover open={notificationOpen} onOpenChange={setNotificationOpen}>
                <PopoverTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="icon"
                    className="relative"
                  >
                    <Bell className="h-5 w-5" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent 
                  className="w-96 p-0 max-h-[600px] overflow-hidden"
                  align="end"
                  side="bottom"
                >
                  {renderNotificationCenter()}
                </PopoverContent>
              </Popover>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <UserAvatar 
                    fallbackText={userTypeLabel[0]}
                    className="cursor-pointer h-8 w-8"
                  />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>My Account</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link to="/" className="cursor-pointer">
                      <Globe className="mr-2 h-4 w-4" />
                      Website Home
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to={`/${userType}/profile`} className="cursor-pointer">Profile</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to={`/${userType}/settings`} className="cursor-pointer">Settings</Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="cursor-pointer">
                    Log out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </header>
          <main className="flex-1 overflow-auto p-6">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};
