
import React from 'react';
import { Bell, Home, Settings, LogOut, User, Briefcase, Users } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface DashboardLayoutProps {
  children: React.ReactNode;
  userType: 'candidate' | 'employer' | 'admin';
}

export const DashboardLayout = ({ children, userType }: DashboardLayoutProps) => {
  const location = useLocation();

  const candidateMenuItems = [
    { title: "Dashboard", icon: Home, url: "/candidate" },
    { title: "Profile", icon: User, url: "/candidate/profile" },
    { title: "My Applications", icon: Briefcase, url: "/candidate/applications" },
    { title: "Saved Jobs", icon: Briefcase, url: "/candidate/saved-jobs" },
    { title: "Messages", icon: Bell, url: "/candidate/messages" },
    { title: "Settings", icon: Settings, url: "/candidate/settings" },
  ];

  const employerMenuItems = [
    { title: "Dashboard", icon: Home, url: "/employer" },
    { title: "Job Listings", icon: Briefcase, url: "/employer/jobs" },
    { title: "Candidates", icon: Users, url: "/employer/candidates" },
    { title: "Company Profile", icon: Briefcase, url: "/employer/company" },
    { title: "Messages", icon: Bell, url: "/employer/messages" },
    { title: "Settings", icon: Settings, url: "/employer/settings" },
  ];

  const adminMenuItems = [
    { title: "Dashboard", icon: Home, url: "/admin" },
    { title: "Users", icon: Users, url: "/admin/users" },
    { title: "Jobs", icon: Briefcase, url: "/admin/jobs" },
    { title: "Companies", icon: Briefcase, url: "/admin/companies" },
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

  return (
    <SidebarProvider>
      <div className="flex h-screen w-full bg-gray-50">
        <Sidebar>
          <SidebarHeader>
            <div className="flex items-center gap-2 px-2">
              <Avatar>
                <AvatarImage src="/placeholder.svg" />
                <AvatarFallback>U</AvatarFallback>
              </Avatar>
              <div className="flex flex-col">
                <span className="font-medium">{userTypeLabel} Portal</span>
                <span className="text-xs text-gray-500">Welcome back!</span>
              </div>
            </div>
          </SidebarHeader>
          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupLabel>Navigation</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {menuItems.map((item) => (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton 
                        asChild
                        isActive={location.pathname === item.url}
                        tooltip={item.title}
                      >
                        <Link to={item.url}>
                          <item.icon />
                          <span>{item.title}</span>
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
              <Button 
                variant="ghost" 
                className="w-full justify-start gap-2"
              >
                <LogOut className="h-4 w-4" />
                <span>Log out</span>
              </Button>
            </div>
          </SidebarFooter>
        </Sidebar>
        <div className="flex flex-1 flex-col overflow-hidden">
          <header className="flex h-16 items-center justify-between border-b px-6">
            <h1 className="text-2xl font-bold">{userTypeLabel} Portal</h1>
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon">
                <Bell className="h-5 w-5" />
              </Button>
              <Avatar>
                <AvatarImage src="/placeholder.svg" />
                <AvatarFallback>U</AvatarFallback>
              </Avatar>
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
