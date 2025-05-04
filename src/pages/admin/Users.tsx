
import React from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { PlusCircle, UserPlus, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const UsersAdmin = () => {
  // Mock data for the users page
  const users = [
    { id: "1", name: "John Smith", email: "john@example.com", role: "candidate", status: "active", joined: "2025-04-12" },
    { id: "2", name: "Sarah Johnson", email: "sarah@example.com", role: "employer", status: "active", joined: "2025-04-10" },
    { id: "3", name: "Michael Brown", email: "michael@example.com", role: "candidate", status: "inactive", joined: "2025-03-28" },
    { id: "4", name: "Tech Solutions Ltd", email: "admin@techsolutions.com", role: "employer", status: "active", joined: "2025-03-15" },
    { id: "5", name: "Emily Davis", email: "emily@example.com", role: "admin", status: "active", joined: "2025-03-01" },
  ];

  return (
    <DashboardLayout userType="admin">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">User Management</h1>
            <p className="text-muted-foreground">Manage all users in the system</p>
          </div>
          <Button className="flex items-center gap-2">
            <UserPlus className="h-4 w-4" />
            <span>Add User</span>
          </Button>
        </div>

        <div className="flex items-center gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search users..." 
              className="pl-8 w-full"
            />
          </div>
          <Button variant="outline">Filters</Button>
        </div>

        <Tabs defaultValue="all">
          <TabsList>
            <TabsTrigger value="all">All Users</TabsTrigger>
            <TabsTrigger value="candidates">Candidates</TabsTrigger>
            <TabsTrigger value="employers">Employers</TabsTrigger>
            <TabsTrigger value="admins">Admins</TabsTrigger>
          </TabsList>
          <TabsContent value="all" className="mt-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle>All Users</CardTitle>
                <CardDescription>Showing all users registered in the system</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Joined</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell className="font-medium">{user.name}</TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            user.role === 'candidate' 
                              ? 'bg-green-100 text-green-800'
                              : user.role === 'employer' 
                                ? 'bg-blue-100 text-blue-800' 
                                : 'bg-purple-100 text-purple-800'
                          }`}>
                            {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                          </span>
                        </TableCell>
                        <TableCell>
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            user.status === 'active' 
                              ? 'bg-green-100 text-green-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {user.status.charAt(0).toUpperCase() + user.status.slice(1)}
                          </span>
                        </TableCell>
                        <TableCell>{new Date(user.joined).toLocaleDateString()}</TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="sm">View</Button>
                          <Button variant="ghost" size="sm">Edit</Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="candidates" className="mt-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle>Candidate Users</CardTitle>
                <CardDescription>Showing all users with candidate role</CardDescription>
              </CardHeader>
              <CardContent>
                <p>Candidate users content will appear here.</p>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="employers" className="mt-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle>Employer Users</CardTitle>
                <CardDescription>Showing all users with employer role</CardDescription>
              </CardHeader>
              <CardContent>
                <p>Employer users content will appear here.</p>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="admins" className="mt-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle>Admin Users</CardTitle>
                <CardDescription>Showing all users with admin role</CardDescription>
              </CardHeader>
              <CardContent>
                <p>Admin users content will appear here.</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default UsersAdmin;
