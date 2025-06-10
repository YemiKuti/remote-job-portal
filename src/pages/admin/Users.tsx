
import React from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Search, Loader2, Edit, Trash2, AlertCircle, RefreshCw } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useUsersManagement } from "@/hooks/admin/useUsersManagement";
import AddUserDialog from "@/components/admin/users/AddUserDialog";
import { Alert, AlertDescription } from "@/components/ui/alert";

const UsersAdmin = () => {
  const {
    users,
    loading,
    error,
    searchTerm,
    setSearchTerm,
    handleCreateUser,
    handleUpdateUserRole,
    handleDeleteUser,
    retryLoadUsers
  } = useUsersManagement();

  const [activeTab, setActiveTab] = React.useState('all');

  const filteredUsers = users.filter(user => {
    // Apply role filter
    if (activeTab !== 'all' && user.role !== activeTab) {
      return false;
    }
    
    return true;
  });

  const UserTable = ({ users }: { users: typeof filteredUsers }) => (
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
            <TableCell className="font-medium">
              {user.full_name || user.username || 'User'}
            </TableCell>
            <TableCell>{user.email}</TableCell>
            <TableCell>
              <span className={`px-2 py-1 rounded-full text-xs ${
                user.role === 'candidate' 
                  ? 'bg-green-100 text-green-800'
                  : user.role === 'employer' 
                    ? 'bg-blue-100 text-blue-800' 
                    : user.role === 'admin'
                      ? 'bg-purple-100 text-purple-800'
                      : 'bg-gray-100 text-gray-800'
              }`}>
                {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
              </span>
            </TableCell>
            <TableCell>
              <span className={`px-2 py-1 rounded-full text-xs ${
                user.status === 'active' 
                  ? 'bg-green-100 text-green-800'
                  : 'bg-yellow-100 text-yellow-800'
              }`}>
                {user.status.charAt(0).toUpperCase() + user.status.slice(1)}
              </span>
            </TableCell>
            <TableCell>{new Date(user.created_at).toLocaleDateString()}</TableCell>
            <TableCell className="text-right">
              <Button variant="ghost" size="sm">
                <Edit className="h-4 w-4" />
              </Button>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => handleDeleteUser(user.id)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );

  return (
    <DashboardLayout userType="admin">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">User Management</h1>
            <p className="text-muted-foreground">Manage all users in the system</p>
          </div>
          <AddUserDialog onCreateUser={handleCreateUser} />
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="flex items-center justify-between">
              <span>{error}</span>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={retryLoadUsers}
                disabled={loading}
                className="ml-4"
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                Retry
              </Button>
            </AlertDescription>
          </Alert>
        )}

        <div className="flex items-center gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search users..." 
              className="pl-8 w-full"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Button variant="outline">Filters</Button>
        </div>

        <Tabs defaultValue="all" onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="all">All Users</TabsTrigger>
            <TabsTrigger value="candidate">Candidates</TabsTrigger>
            <TabsTrigger value="employer">Employers</TabsTrigger>
            <TabsTrigger value="admin">Admins</TabsTrigger>
          </TabsList>
          
          <TabsContent value="all" className="mt-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle>All Users</CardTitle>
                <CardDescription>Showing all users registered in the system</CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                  </div>
                ) : error ? (
                  <div className="text-center py-8">
                    <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground mb-4">Failed to load users</p>
                    <Button onClick={retryLoadUsers} variant="outline">
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Try Again
                    </Button>
                  </div>
                ) : filteredUsers.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">No users found matching the criteria.</p>
                  </div>
                ) : (
                  <UserTable users={filteredUsers} />
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="candidate" className="mt-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle>Candidate Users</CardTitle>
                <CardDescription>Showing all users with candidate role</CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                  </div>
                ) : filteredUsers.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">No candidate users found.</p>
                  </div>
                ) : (
                  <UserTable users={filteredUsers} />
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="employer" className="mt-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle>Employer Users</CardTitle>
                <CardDescription>Showing all users with employer role</CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                  </div>
                ) : filteredUsers.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">No employer users found.</p>
                  </div>
                ) : (
                  <UserTable users={filteredUsers} />
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="admin" className="mt-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle>Admin Users</CardTitle>
                <CardDescription>Showing all users with admin role</CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                  </div>
                ) : filteredUsers.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">No admin users found.</p>
                  </div>
                ) : (
                  <UserTable users={filteredUsers} />
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default UsersAdmin;
