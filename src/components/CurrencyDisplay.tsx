import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Globe } from 'lucide-react';
import { useCurrency, supportedCurrencies } from '@/contexts/CurrencyContext';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface CurrencyDisplayProps {
  variant?: 'default' | 'compact' | 'minimal';
  showDetected?: boolean;
}

export function CurrencyDisplay({ variant = 'default', showDetected = true }: CurrencyDisplayProps) {
  const { 
    selectedCurrency, 
    detectedCurrency, 
    isLoading, 
    error
  } = useCurrency();

  const selectedCurrencyData = supportedCurrencies.find(c => c.code === selectedCurrency);

  if (variant === 'minimal') {
    return (
      <span className="flex items-center gap-1 text-xs text-muted-foreground">
        <span>{selectedCurrencyData?.flag}</span>
        <span>{selectedCurrency}</span>
      </span>
    );
  }

  if (variant === 'compact') {
    return (
      <div className="flex items-center gap-2">
        <span className="flex items-center gap-1 text-sm">
          <span>{selectedCurrencyData?.flag}</span>
          <span className="font-medium">{selectedCurrency}</span>
        </span>
        {isLoading && (
          <Badge variant="secondary" className="text-xs">
            Detecting...
          </Badge>
        )}
      </div>
    );
  }

  return (
    <TooltipProvider>
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <Globe className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm font-medium">Currency:</span>
        </div>
        
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-2">
            <span>{selectedCurrencyData?.flag}</span>
            <span className="font-medium">{selectedCurrency}</span>
            <span className="text-muted-foreground">({selectedCurrencyData?.symbol})</span>
            <span className="text-xs text-muted-foreground">{selectedCurrencyData?.name}</span>
          </span>
          
          {showDetected && detectedCurrency && (
            <Badge variant="outline" className="text-xs">
              Auto-detected
            </Badge>
          )}
        </div>

        {error && (
          <Tooltip>
            <TooltipTrigger>
              <Badge variant="destructive" className="text-xs">
                Offline rates
              </Badge>
            </TooltipTrigger>
            <TooltipContent>
              <p className="max-w-48">{error}</p>
            </TooltipContent>
          </Tooltip>
        )}

        {isLoading && (
          <Badge variant="secondary" className="text-xs">
            Loading...
          </Badge>
        )}
      </div>
    </TooltipProvider>
  );
}