
import React from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { AccountSettings } from '@/components/admin/settings/AccountSettings';

const AdminProfile = () => {
  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Admin Profile</h1>
          <p className="text-muted-foreground">Manage your admin profile settings</p>
        </div>
        
        <AccountSettings />
      </div>
    </AdminLayout>
  );
};

export default AdminProfile;
