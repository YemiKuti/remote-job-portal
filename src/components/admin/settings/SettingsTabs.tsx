
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AccountSettings } from './AccountSettings';
import { ApplicationSettings } from './ApplicationSettings';
import { PrivacySettings } from './PrivacySettings';
import { ApiSettings } from './ApiSettings';

export function SettingsTabs() {
  return (
    <Tabs defaultValue="account">
      <TabsList className="mb-6">
        <TabsTrigger value="account">Account</TabsTrigger>
        <TabsTrigger value="application">Application</TabsTrigger>
        <TabsTrigger value="privacy">Privacy</TabsTrigger>
        <TabsTrigger value="api">API</TabsTrigger>
      </TabsList>
      
      <TabsContent value="account">
        <AccountSettings />
      </TabsContent>
      
      <TabsContent value="application">
        <ApplicationSettings />
      </TabsContent>
      
      <TabsContent value="privacy">
        <PrivacySettings />
      </TabsContent>
      
      <TabsContent value="api">
        <ApiSettings />
      </TabsContent>
    </Tabs>
  );
}
