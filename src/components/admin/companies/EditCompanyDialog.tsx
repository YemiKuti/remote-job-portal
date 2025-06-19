
import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Company, CompanyFormData } from "@/utils/api/adminApi";
import { Loader2 } from "lucide-react";

interface EditCompanyDialogProps {
  company: Company | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdateCompany: (companyId: string, companyData: CompanyFormData & { status?: string }) => Promise<boolean>;
}

const EditCompanyDialog = ({ company, open, onOpenChange, onUpdateCompany }: EditCompanyDialogProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<CompanyFormData & { status?: string }>({
    name: '',
    description: '',
    industry: '',
    website: '',
    logo_url: '',
    location: '',
    company_size: '',
    founded_year: undefined,
    email: '',
    phone: '',
    linkedin_url: '',
    twitter_url: '',
    status: 'active'
  });

  // Reset form data when company changes or dialog opens/closes
  useEffect(() => {
    if (company && open) {
      console.log('Setting form data for company:', company);
      setFormData({
        name: company.name || '',
        description: company.description || '',
        industry: company.industry || '',
        website: company.website || '',
        logo_url: company.logo_url || '',
        location: company.location || '',
        company_size: company.company_size || '',
        founded_year: company.founded_year || undefined,
        email: company.email || '',
        phone: company.phone || '',
        linkedin_url: company.linkedin_url || '',
        twitter_url: company.twitter_url || '',
        status: company.status || 'active'
      });
    } else if (!open) {
      // Reset form when dialog closes
      setFormData({
        name: '',
        description: '',
        industry: '',
        website: '',
        logo_url: '',
        location: '',
        company_size: '',
        founded_year: undefined,
        email: '',
        phone: '',
        linkedin_url: '',
        twitter_url: '',
        status: 'active'
      });
    }
  }, [company, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!company) {
      console.error('No company selected for editing');
      return;
    }
    
    console.log('Submitting form data:', formData);
    setIsLoading(true);
    
    try {
      const success = await onUpdateCompany(company.id, formData);
      console.log('Update result:', success);
      
      if (success) {
        onOpenChange(false);
      }
    } catch (error) {
      console.error('Error updating company:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string | number | undefined) => {
    console.log(`Updating field ${field} with value:`, value);
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  if (!company) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Company</DialogTitle>
          <DialogDescription>
            Update company information. Click save when you're done.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Company Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="Enter company name"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="industry">Industry</Label>
              <Input
                id="industry"
                value={formData.industry}
                onChange={(e) => handleInputChange('industry', e.target.value)}
                placeholder="e.g., Technology, Healthcare"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Company description"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="website">Website</Label>
              <Input
                id="website"
                type="url"
                value={formData.website}
                onChange={(e) => handleInputChange('website', e.target.value)}
                placeholder="https://company.com"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                value={formData.location}
                onChange={(e) => handleInputChange('location', e.target.value)}
                placeholder="City, Country"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="company_size">Company Size</Label>
              <Select value={formData.company_size} onValueChange={(value) => handleInputChange('company_size', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select company size" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1-10">1-10 employees</SelectItem>
                  <SelectItem value="11-50">11-50 employees</SelectItem>
                  <SelectItem value="51-200">51-200 employees</SelectItem>
                  <SelectItem value="201-500">201-500 employees</SelectItem>
                  <SelectItem value="501-1000">501-1000 employees</SelectItem>
                  <SelectItem value="1000+">1000+ employees</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="founded_year">Founded Year</Label>
              <Input
                id="founded_year"
                type="number"
                value={formData.founded_year || ''}
                onChange={(e) => handleInputChange('founded_year', e.target.value ? parseInt(e.target.value) : undefined)}
                placeholder="2020"
                min="1800"
                max={new Date().getFullYear()}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                placeholder="contact@company.com"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                placeholder="+1 (555) 123-4567"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="linkedin_url">LinkedIn URL</Label>
              <Input
                id="linkedin_url"
                type="url"
                value={formData.linkedin_url}
                onChange={(e) => handleInputChange('linkedin_url', e.target.value)}
                placeholder="https://linkedin.com/company/..."
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="twitter_url">Twitter URL</Label>
              <Input
                id="twitter_url"
                type="url"
                value={formData.twitter_url}
                onChange={(e) => handleInputChange('twitter_url', e.target.value)}
                placeholder="https://twitter.com/company"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="logo_url">Logo URL</Label>
            <Input
              id="logo_url"
              type="url"
              value={formData.logo_url}
              onChange={(e) => handleInputChange('logo_url', e.target.value)}
              placeholder="https://example.com/logo.png"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Select value={formData.status} onValueChange={(value) => handleInputChange('status', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Changes
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export { EditCompanyDialog };
