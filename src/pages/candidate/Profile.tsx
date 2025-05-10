import React, { useState, useRef } from 'react';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/components/AuthProvider';
import { supabase } from '@/integrations/supabase/client';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import { uploadProfilePhoto, updateCandidateProfile } from '@/utils/api/candidateApi';

const CandidateProfile = () => {
  const { user, refreshSession } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [isUploading, setIsUploading] = useState(false);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [showPhotoDialog, setShowPhotoDialog] = useState(false);
  const [formData, setFormData] = useState({
    fullName: user?.user_metadata?.full_name || '',
    phone: '',
    location: '',
    title: '',
    experience: '',
    skills: '',
    bio: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Handle file selection
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Create a preview URL
      const reader = new FileReader();
      reader.onload = (e) => {
        setPhotoPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
      
      // Open the preview dialog
      setShowPhotoDialog(true);
    }
  };
  
  // Trigger file input click
  const handleChoosePhoto = () => {
    fileInputRef.current?.click();
  };
  
  // Upload the photo
  const handleUploadPhoto = async () => {
    if (!fileInputRef.current?.files?.[0] || !user) return;
    
    setIsUploading(true);
    try {
      const file = fileInputRef.current.files[0];
      const avatarUrl = await uploadProfilePhoto(user.id, file);
      
      if (avatarUrl) {
        // Refresh the session to get updated user metadata
        await refreshSession();
        setShowPhotoDialog(false);
        // Reset the file input
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      }
    } catch (error) {
      console.error('Error uploading photo:', error);
      toast.error('Failed to upload photo. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };
  
  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
  };
  
  // Save profile changes
  const handleSaveProfile = async () => {
    if (!user) return;
    
    setIsSubmitting(true);
    try {
      const profileData = {
        full_name: formData.fullName,
        phone: formData.phone,
        location: formData.location,
        title: formData.title,
        experience: formData.experience ? Number(formData.experience) : undefined,
        skills: formData.skills,
        bio: formData.bio
      };
      
      const success = await updateCandidateProfile(user.id, profileData);
      
      if (success) {
        // If the name was updated, refresh the session to update user metadata
        if (formData.fullName !== user.user_metadata?.full_name) {
          await supabase.auth.updateUser({
            data: { full_name: formData.fullName }
          });
          await refreshSession();
        }
      }
    } catch (error) {
      console.error('Error saving profile:', error);
      toast.error('Failed to save profile. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };
  
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
        
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
              <CardDescription>Update your personal details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-4">
                <Avatar className="h-20 w-20">
                  <AvatarImage src={user?.user_metadata?.avatar_url || ""} />
                  <AvatarFallback>{user?.user_metadata?.full_name?.[0] || "U"}</AvatarFallback>
                </Avatar>
                <div>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={handleChoosePhoto}
                  >
                    Change Photo
                  </Button>
                  <input
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    accept="image/*"
                    onChange={handleFileChange}
                  />
                </div>
              </div>
              
              <div className="grid gap-3">
                <div className="grid gap-1.5">
                  <Label htmlFor="fullName">Full Name</Label>
                  <Input 
                    id="fullName" 
                    value={formData.fullName}
                    onChange={handleInputChange}
                    placeholder="Full Name" 
                  />
                </div>
                
                <div className="grid gap-1.5">
                  <Label htmlFor="email">Email</Label>
                  <Input 
                    id="email" 
                    type="email"
                    value={user?.email || ""}
                    disabled
                  />
                </div>
                
                <div className="grid gap-1.5">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input 
                    id="phone" 
                    type="tel"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="Your phone number"
                  />
                </div>
                
                <div className="grid gap-1.5">
                  <Label htmlFor="location">Location</Label>
                  <Input 
                    id="location" 
                    value={formData.location}
                    onChange={handleInputChange}
                    placeholder="City, Country" 
                  />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Professional Information</CardTitle>
              <CardDescription>Update your professional details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-1.5">
                <Label htmlFor="title">Professional Title</Label>
                <Input 
                  id="title" 
                  value={formData.title}
                  onChange={handleInputChange}
                  placeholder="e.g. Frontend Developer" 
                />
              </div>
              
              <div className="grid gap-1.5">
                <Label htmlFor="experience">Years of Experience</Label>
                <Input 
                  id="experience" 
                  type="number"
                  min="0"
                  value={formData.experience}
                  onChange={handleInputChange}
                  placeholder="Years of experience" 
                />
              </div>
              
              <div className="grid gap-1.5">
                <Label htmlFor="skills">Skills</Label>
                <Input 
                  id="skills" 
                  value={formData.skills}
                  onChange={handleInputChange}
                  placeholder="e.g. React, Node.js, TypeScript" 
                />
                <p className="text-xs text-muted-foreground">Separate skills with commas</p>
              </div>
              
              <div className="grid gap-1.5">
                <Label htmlFor="bio">Professional Summary</Label>
                <Textarea 
                  id="bio" 
                  value={formData.bio}
                  onChange={handleInputChange}
                  placeholder="Write a brief summary about yourself"
                  className="min-h-[120px]"
                />
              </div>
            </CardContent>
          </Card>
        </div>
        
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
      
      {/* Photo Preview Dialog */}
      <Dialog open={showPhotoDialog} onOpenChange={setShowPhotoDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Profile Photo</DialogTitle>
            <DialogDescription>
              Preview your new profile photo before uploading
            </DialogDescription>
          </DialogHeader>
          
          {photoPreview && (
            <div className="flex justify-center py-4">
              <div className="relative h-32 w-32 rounded-full overflow-hidden">
                <img 
                  src={photoPreview} 
                  alt="Profile Preview" 
                  className="h-full w-full object-cover"
                />
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => {
                setShowPhotoDialog(false);
                setPhotoPreview(null);
                if (fileInputRef.current) {
                  fileInputRef.current.value = '';
                }
              }}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleUploadPhoto}
              disabled={isUploading}
            >
              {isUploading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Uploading...
                </>
              ) : "Upload Photo"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default CandidateProfile;
