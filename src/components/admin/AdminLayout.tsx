
import React from 'react';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';

interface AdminLayoutProps {
  children: React.ReactNode;
}

export const AdminLayout = ({ children }: AdminLayoutProps) => {
  return (
    <DashboardLayout userType="admin">
      {children}
    </DashboardLayout>
  );
};
