
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AccountSettings } from './AccountSettings';
import { ApplicationSettings } from './ApplicationSettings';
import { ApiSettings } from './ApiSettings';
import { PrivacySettings } from './PrivacySettings';
import SecurityDashboard from '../SecurityDashboard';

export const SettingsTabs = () => {
  return (
    <Tabs defaultValue="account" className="space-y-6">
      <TabsList className="grid w-full grid-cols-5">
        <TabsTrigger value="account">Account</TabsTrigger>
        <TabsTrigger value="application">Application</TabsTrigger>
        <TabsTrigger value="api">API</TabsTrigger>
        <TabsTrigger value="privacy">Privacy</TabsTrigger>
        <TabsTrigger value="security">Security</TabsTrigger>
      </TabsList>
      
      <TabsContent value="account">
        <AccountSettings />
      </TabsContent>
      
      <TabsContent value="application">
        <ApplicationSettings />
      </TabsContent>
      
      <TabsContent value="api">
        <ApiSettings />
      </TabsContent>
      
      <TabsContent value="privacy">
        <PrivacySettings />
      </TabsContent>
      
      <TabsContent value="security">
        <SecurityDashboard />
      </TabsContent>
    </Tabs>
  );
};
