
import React from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

interface PhotoUploadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  photoPreview: string | null;
  isUploading: boolean;
  onUpload: () => void;
  onCancel: () => void;
}

export function PhotoUploadDialog({
  open,
  onOpenChange,
  photoPreview,
  isUploading,
  onUpload,
  onCancel
}: PhotoUploadDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
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
            onClick={onCancel}
          >
            Cancel
          </Button>
          <Button 
            onClick={onUpload}
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
  );
}
