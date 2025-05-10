
import React from 'react';
import { useEmployerSettings } from '@/hooks/useEmployerSettings';
import { EmployerSettingsLayout } from '@/components/employer/settings/EmployerSettingsLayout';

const EmployerSettings = () => {
  const {
    formData,
    passwordData,
    isSubmitting,
    isLoading,
    handleInputChange,
    handlePasswordChange,
    handleSaveChanges,
    handleSaveNotificationPreferences
  } = useEmployerSettings();
  
  return (
    <EmployerSettingsLayout
      isLoading={isLoading}
      formData={formData}
      passwordData={passwordData}
      handleInputChange={handleInputChange}
      handlePasswordChange={handlePasswordChange}
      handleSaveChanges={handleSaveChanges}
      handleSaveNotificationPreferences={handleSaveNotificationPreferences}
      isSubmitting={isSubmitting}
    />
  );
};

export default EmployerSettings;
