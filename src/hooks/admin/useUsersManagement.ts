
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { 
  fetchAdminUsers, 
  createAdminUser, 
  updateAdminUserRole, 
  deleteAdminUser, 
  AdminUser, 
  CreateUserData 
} from "@/utils/api/adminApi";

export const useUsersManagement = () => {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    const loadUsers = async () => {
      try {
        setLoading(true);
        console.log('Loading admin users...');
        
        const data = await fetchAdminUsers();
        console.log('Admin users loaded:', data);
        
        setUsers(data || []);
      } catch (error) {
        console.error('Error fetching admin users:', error);
        toast({
          title: 'Error',
          description: 'Failed to load users. Please try again.',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };
    
    loadUsers();
  }, [toast]);

  const handleCreateUser = async (userData: CreateUserData) => {
    try {
      console.log('Creating user:', userData);
      
      const newUserId = await createAdminUser(userData);
      
      if (newUserId) {
        // Reload users to get the latest data
        const updatedUsers = await fetchAdminUsers();
        setUsers(updatedUsers);
        
        toast({
          title: 'Success',
          description: 'User created successfully',
        });
        
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Error creating user:', error);
      toast({
        title: 'Error',
        description: 'Failed to create user. Please try again.',
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
    } catch (error) {
      console.error('Error updating user role:', error);
      toast({
        title: 'Error',
        description: 'Failed to update user role. Please try again.',
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
    } catch (error) {
      console.error('Error deleting user:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete user. Please try again.',
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
    searchTerm,
    setSearchTerm,
    handleCreateUser,
    handleUpdateUserRole,
    handleDeleteUser
  };
};
