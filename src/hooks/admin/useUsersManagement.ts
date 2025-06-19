import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { 
  fetchAdminUsers, 
  createAdminUser, 
  updateAdminUser,
  updateAdminUserRole, 
  deleteAdminUser, 
  AdminUser, 
  CreateUserData,
  UpdateUserData 
} from "@/utils/api/adminApi";

export const useUsersManagement = () => {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const { toast } = useToast();

  const loadUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('Loading admin users...');
      
      const data = await fetchAdminUsers();
      console.log('Admin users loaded:', data);
      
      setUsers(data || []);
    } catch (error: any) {
      console.error('Error fetching admin users:', error);
      const errorMessage = error.message || 'Failed to load users. Please try again.';
      setError(errorMessage);
      
      toast({
        title: 'Error Loading Users',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, [toast]);

  const retryLoadUsers = async () => {
    await loadUsers();
    if (!error) {
      toast({
        title: 'Success',
        description: 'Users loaded successfully',
      });
    }
  };

  const handleCreateUser = async (userData: CreateUserData) => {
    try {
      console.log('Creating user:', userData);
      
      const newUserId = await createAdminUser(userData);
      
      if (newUserId) {
        // Reload users to get the latest data
        await loadUsers();
        
        toast({
          title: 'Success',
          description: 'User created successfully',
        });
        
        return true;
      }
      
      return false;
    } catch (error: any) {
      console.error('Error creating user:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to create user. Please try again.',
        variant: 'destructive',
      });
      return false;
    }
  };

  const handleUpdateUser = async (userId: string, userData: UpdateUserData) => {
    try {
      console.log('Updating user in hook:', userId, userData);
      
      // Validate that we have valid data
      if (!userId) {
        throw new Error('User ID is required');
      }
      
      if (!userData || Object.keys(userData).length === 0) {
        throw new Error('User data is required');
      }
      
      const success = await updateAdminUser(userId, userData);
      console.log('Update result from API:', success);
      
      if (success) {
        // Reload users to get the latest data
        await loadUsers();
        
        toast({
          title: 'Success',
          description: 'User updated successfully',
        });
        
        return true;
      } else {
        throw new Error('Update operation returned false');
      }
    } catch (error: any) {
      console.error('Error updating user in hook:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to update user. Please try again.',
        variant: 'destructive',
      });
      return false;
    }
  };

  const handleUpdateUserRole = async (userId: string, newRole: string) => {
    try {
      console.log('Updating user role:', userId, newRole);
      
      const success = await updateAdminUserRole(userId, newRole);
      
      if (success) {
        // Update local state
        setUsers(users.map(user => 
          user.id === userId 
            ? { ...user, role: newRole }
            : user
        ));
        
        toast({
          title: 'Success',
          description: 'User role updated successfully',
        });
        
        return true;
      }
      
      return false;
    } catch (error: any) {
      console.error('Error updating user role:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to update user role. Please try again.',
        variant: 'destructive',
      });
      return false;
    }
  };

  const handleDeleteUser = async (userId: string) => {
    try {
      console.log('Deleting user:', userId);
      
      const success = await deleteAdminUser(userId);
      
      if (success) {
        // Remove from local state
        setUsers(users.filter(user => user.id !== userId));
        
        toast({
          title: 'Success',
          description: 'User deleted successfully',
        });
        
        return true;
      }
      
      return false;
    } catch (error: any) {
      console.error('Error deleting user:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to delete user. Please try again.',
        variant: 'destructive',
      });
      return false;
    }
  };

  const filteredUsers = searchTerm.trim() === '' 
    ? users 
    : users.filter(user => 
        user.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.username?.toLowerCase().includes(searchTerm.toLowerCase())
      );

  return {
    users: filteredUsers,
    loading,
    error,
    searchTerm,
    setSearchTerm,
    handleCreateUser,
    handleUpdateUser,
    handleUpdateUserRole,
    handleDeleteUser,
    retryLoadUsers
  };
};
