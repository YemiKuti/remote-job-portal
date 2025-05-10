
import React from 'react';
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

interface ProfessionalInfoCardProps {
  formData: {
    title: string;
    experience: string;
    skills: string;
    bio: string;
  };
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
}

export function ProfessionalInfoCard({ 
  formData, 
  handleInputChange 
}: ProfessionalInfoCardProps) {
  return (
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
  );
}
