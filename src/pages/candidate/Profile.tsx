
import React from 'react';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { useProfileManager } from '@/hooks/useProfileManager';
import { PersonalInfoCard } from '@/components/candidate/profile/PersonalInfoCard';
import { ProfessionalInfoCard } from '@/components/candidate/profile/ProfessionalInfoCard';
import { PhotoUploadDialog } from '@/components/candidate/profile/PhotoUploadDialog';
import { ResumeManagementCard } from '@/components/candidate/profile/ResumeManagementCard';

const CandidateProfile = () => {
  const {
    user,
    formData,
    isLoading,
    isSubmitting,
    isUploading,
    fileInputRef,
    photoPreview,
    showPhotoDialog,
    setShowPhotoDialog,
    handleChoosePhoto,
    handleFileChange,
    handleInputChange,
    handleUploadPhoto,
    handleCancelPhotoUpload,
    handleSaveProfile
  } = useProfileManager();
  
  if (isLoading) {
    return (
      <DashboardLayout userType="candidate">
        <div className="flex items-center justify-center h-full">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }
  
  return (
    <DashboardLayout userType="candidate">
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Profile</h2>
          <p className="text-muted-foreground">
            Manage your profile information and preferences
          </p>
        </div>
        <Separator />
        
        <div className="grid gap-6">
          {/* Personal and Professional Info Row */}
          <div className="grid gap-6 md:grid-cols-2">
            <PersonalInfoCard
              user={user}
              formData={{
                fullName: formData.fullName,
                phone: formData.phone,
                location: formData.location
              }}
              handleInputChange={handleInputChange}
              handleChoosePhoto={handleChoosePhoto}
              fileInputRef={fileInputRef}
            />
            
            <ProfessionalInfoCard
              formData={{
                title: formData.title,
                experience: formData.experience,
                skills: formData.skills,
                bio: formData.bio
              }}
              handleInputChange={handleInputChange}
            />
          </div>

          {/* Resume Management - Full Width */}
          {user && (
            <ResumeManagementCard userId={user.id} />
          )}

          {/* Save Button */}
          <div className="flex justify-end">
            <Button 
              onClick={handleSaveProfile} 
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : "Save Changes"}
            </Button>
          </div>
        </div>
      </div>
      
      {/* Photo Upload Dialog */}
      <PhotoUploadDialog
        open={showPhotoDialog}
        onOpenChange={setShowPhotoDialog}
        photoPreview={photoPreview}
        isUploading={isUploading}
        onUpload={handleUploadPhoto}
        onCancel={handleCancelPhotoUpload}
      />
      
      {/* Hidden file input for photo upload */}
      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        accept="image/*"
        onChange={handleFileChange}
      />
    </DashboardLayout>
  );
};

export default CandidateProfile;
