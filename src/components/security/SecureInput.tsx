
import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { sanitizeInput } from '@/utils/security';
import { cn } from '@/lib/utils';

interface SecureInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  onSecureChange?: (value: string) => void;
  maxLength?: number;
  sanitize?: boolean;
}

export const SecureInput = React.forwardRef<HTMLInputElement, SecureInputProps>(
  ({ onSecureChange, onChange, maxLength = 1000, sanitize = true, className, ...props }, ref) => {
    const [hasError, setHasError] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      let value = e.target.value;
      
      // Apply length limit
      if (value.length > maxLength) {
        value = value.slice(0, maxLength);
        setHasError(true);
      } else {
        setHasError(false);
      }
      
      // Sanitize input if enabled
      if (sanitize) {
        value = sanitizeInput(value);
      }
      
      // Update the input value
      e.target.value = value;
      
      // Call callbacks
      if (onChange) {
        onChange(e);
      }
      if (onSecureChange) {
        onSecureChange(value);
      }
    };

    return (
      <Input
        ref={ref}
        onChange={handleChange}
        className={cn(
          hasError && "border-yellow-500 focus:border-yellow-500",
          className
        )}
        {...props}
      />
    );
  }
);

SecureInput.displayName = "SecureInput";
