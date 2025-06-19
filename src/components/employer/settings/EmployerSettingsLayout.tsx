
import React from 'react';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { GeneralSettingsForm } from './GeneralSettingsForm';
import { NotificationSettings } from './NotificationSettings';
import { BillingSettings } from './BillingSettings';
import { Loader2 } from 'lucide-react';

interface EmployerSettingsLayoutProps {
  isLoading: boolean;
  formData: {
    fullName: string;
    email: string;
    phone: string;
    jobTitle: string;
  };
  passwordData: {
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
  };
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handlePasswordChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleSaveChanges: () => Promise<void>;
  handleSaveNotificationPreferences: () => void;
  isSubmitting: boolean;
}

export const EmployerSettingsLayout = ({
  isLoading,
  formData,
  passwordData,
  handleInputChange,
  handlePasswordChange,
  handleSaveChanges,
  handleSaveNotificationPreferences,
  isSubmitting
}: EmployerSettingsLayoutProps) => {
  if (isLoading) {
    return (
      <DashboardLayout userType="employer">
        <div className="flex items-center justify-center h-full">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }
  
  return (
    <DashboardLayout userType="employer">
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Settings</h2>
          <p className="text-muted-foreground">
            Manage your account settings and preferences
          </p>
        </div>
        <Separator />
        
        <Tabs defaultValue="general">
          <TabsList className="mb-4">
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
            <TabsTrigger value="billing">Billing</TabsTrigger>
          </TabsList>
          
          <TabsContent value="general">
            <GeneralSettingsForm 
              formData={formData}
              passwordData={passwordData}
              handleInputChange={handleInputChange}
              handlePasswordChange={handlePasswordChange}
              handleSaveChanges={handleSaveChanges}
              isSubmitting={isSubmitting}
            />
          </TabsContent>
          
          <TabsContent value="notifications">
            <NotificationSettings 
              handleSaveNotificationPreferences={handleSaveNotificationPreferences}
            />
          </TabsContent>
          
          <TabsContent value="billing">
            <BillingSettings />
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};
