import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Edit3 } from 'lucide-react';
import { EditJobDialog } from './EditJobDialog';

interface EditJobButtonProps {
  job: {
    id: string;
    title: string;
    company: string;
    status: string;
  };
  onJobUpdated: () => void;
}

export const EditJobButton = ({ job, onJobUpdated }: EditJobButtonProps) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleSuccess = () => {
    onJobUpdated();
    setIsDialogOpen(false);
  };

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsDialogOpen(true)}
        className="flex items-center gap-2"
      >
        <Edit3 className="h-4 w-4" />
        Edit
      </Button>

      <EditJobDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        job={job}
        onSuccess={handleSuccess}
      />
    </>
  );
};