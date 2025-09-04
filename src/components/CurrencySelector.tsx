import React from 'react';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Globe, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCurrency, supportedCurrencies } from '@/contexts/CurrencyContext';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface CurrencySelectorProps {
  variant?: 'default' | 'compact';
  showRefresh?: boolean;
}

export function CurrencySelector({ variant = 'default', showRefresh = false }: CurrencySelectorProps) {
  const { 
    selectedCurrency, 
    setSelectedCurrency, 
    detectedCurrency, 
    isLoading, 
    error,
    refreshRates 
  } = useCurrency();

  const selectedCurrencyData = supportedCurrencies.find(c => c.code === selectedCurrency);

  if (variant === 'compact') {
    return (
      <div className="flex items-center gap-2">
        <Select value={selectedCurrency} onValueChange={setSelectedCurrency}>
          <SelectTrigger className="w-20 h-8 text-xs border-0 bg-transparent p-1">
            <SelectValue>
              <span className="flex items-center gap-1">
                <span className="text-xs">{selectedCurrencyData?.flag}</span>
                <span>{selectedCurrency}</span>
              </span>
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            {supportedCurrencies.map((currency) => (
              <SelectItem key={currency.code} value={currency.code}>
                <div className="flex items-center gap-2">
                  <span>{currency.flag}</span>
                  <span className="font-medium">{currency.code}</span>
                  <span className="text-muted-foreground text-xs">{currency.symbol}</span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
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
        
        <Select value={selectedCurrency} onValueChange={setSelectedCurrency}>
          <SelectTrigger className="w-48">
            <SelectValue>
              <div className="flex items-center gap-2">
                <span>{selectedCurrencyData?.flag}</span>
                <span className="font-medium">{selectedCurrency}</span>
                <span className="text-muted-foreground">({selectedCurrencyData?.symbol})</span>
                <span className="text-xs text-muted-foreground">{selectedCurrencyData?.name}</span>
              </div>
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            {supportedCurrencies.map((currency) => (
              <SelectItem key={currency.code} value={currency.code}>
                <div className="flex items-center gap-3 w-full">
                  <span className="text-lg">{currency.flag}</span>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{currency.code}</span>
                      <span className="text-muted-foreground">({currency.symbol})</span>
                    </div>
                    <div className="text-xs text-muted-foreground">{currency.name}</div>
                  </div>
                  {currency.code === detectedCurrency && (
                    <Badge variant="secondary" className="text-xs">Auto</Badge>
                  )}
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {showRefresh && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                onClick={refreshRates}
                disabled={isLoading}
                className="h-10 w-10"
              >
                <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Refresh exchange rates</p>
            </TooltipContent>
          </Tooltip>
        )}

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

        {detectedCurrency && detectedCurrency !== selectedCurrency && (
          <Tooltip>
            <TooltipTrigger>
              <Badge variant="outline" className="text-xs cursor-help">
                Detected: {detectedCurrency}
              </Badge>
            </TooltipTrigger>
            <TooltipContent>
              <p>Auto-detected currency based on your location</p>
            </TooltipContent>
          </Tooltip>
        )}
      </div>
    </TooltipProvider>
  );
}