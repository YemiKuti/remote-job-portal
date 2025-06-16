
import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Eye, EyeOff } from 'lucide-react';
import { sanitizeInput } from '@/utils/security';
import { cn } from '@/lib/utils';

interface SecureInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  onSecureChange?: (value: string) => void;
  maxLength?: number;
  sanitize?: boolean;
}

export const SecureInput = React.forwardRef<HTMLInputElement, SecureInputProps>(
  ({ onSecureChange, onChange, maxLength = 1000, sanitize = true, className, type, ...props }, ref) => {
    const [hasError, setHasError] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    
    const isPasswordField = type === 'password';
    const inputType = isPasswordField && showPassword ? 'text' : type;

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

    const togglePasswordVisibility = () => {
      setShowPassword(!showPassword);
    };

    return (
      <div className="relative">
        <Input
          ref={ref}
          type={inputType}
          onChange={handleChange}
          className={cn(
            hasError && "border-yellow-500 focus:border-yellow-500",
            isPasswordField && "pr-10",
            className
          )}
          {...props}
        />
        {isPasswordField && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
            onClick={togglePasswordVisibility}
            tabIndex={-1}
          >
            {showPassword ? (
              <EyeOff className="h-4 w-4 text-gray-500" />
            ) : (
              <Eye className="h-4 w-4 text-gray-500" />
            )}
            <span className="sr-only">
              {showPassword ? "Hide password" : "Show password"}
            </span>
          </Button>
        )}
      </div>
    );
  }
);

SecureInput.displayName = "SecureInput";
