
import React from 'react';
import { Button } from '@/components/ui/button';
import { Sun } from 'lucide-react';

export const ModeToggle = () => {
  return (
    <Button variant="ghost" size="icon" disabled>
      <Sun className="h-[1.2rem] w-[1.2rem]" />
      <span className="sr-only">Light mode</span>
    </Button>
  );
};
