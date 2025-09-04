import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface ExchangeRates {
  [key: string]: number;
}

export interface CurrencyData {
  code: string;
  symbol: string;
  name: string;
  flag: string;
}

export const supportedCurrencies: CurrencyData[] = [
  { code: 'USD', symbol: '$', name: 'US Dollar', flag: '🇺🇸' },
  { code: 'GBP', symbol: '£', name: 'British Pound', flag: '🇬🇧' },
  { code: 'EUR', symbol: '€', name: 'Euro', flag: '🇪🇺' },
  { code: 'NGN', symbol: '₦', name: 'Nigerian Naira', flag: '🇳🇬' },
  { code: 'KES', symbol: 'KSh', name: 'Kenyan Shilling', flag: '🇰🇪' },
  { code: 'ZAR', symbol: 'R', name: 'South African Rand', flag: '🇿🇦' },
  { code: 'GHS', symbol: '₵', name: 'Ghanaian Cedi', flag: '🇬🇭' },
  { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar', flag: '🇨🇦' },
];

interface CurrencyContextType {
  selectedCurrency: string;
  exchangeRates: ExchangeRates;
  isLoading: boolean;
  error: string | null;
  detectedCurrency: string | null;
  setSelectedCurrency: (currency: string) => void;
  convertAmount: (amount: number, fromCurrency: string, toCurrency?: string) => number;
  formatCurrency: (amount: number, currency?: string) => string;
  refreshRates: () => Promise<void>;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

// Country to currency mapping for auto-detection
const countryCurrencyMap: { [key: string]: string } = {
  // Primary regions as specified
  'US': 'USD', 
  'GB': 'GBP', 'UK': 'GBP',
  'NG': 'NGN',
  // EU countries → EUR
  'DE': 'EUR', 'FR': 'EUR', 'IT': 'EUR', 'ES': 'EUR', 'NL': 'EUR', 'BE': 'EUR', 
  'AT': 'EUR', 'PT': 'EUR', 'IE': 'EUR', 'FI': 'EUR', 'LU': 'EUR', 'EE': 'EUR',
  'LV': 'EUR', 'LT': 'EUR', 'SI': 'EUR', 'SK': 'EUR', 'CY': 'EUR', 'MT': 'EUR',
  'HR': 'EUR', 'GR': 'EUR',
  // Other African countries
  'KE': 'KES', 'ZA': 'ZAR', 'GH': 'GHS', 'CA': 'CAD'
};

export function CurrencyProvider({ children }: { children: ReactNode }) {
  const [selectedCurrency, setSelectedCurrencyState] = useState<string>('GBP');
  const [exchangeRates, setExchangeRates] = useState<ExchangeRates>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [detectedCurrency, setDetectedCurrency] = useState<string | null>(null);

  // Auto-detect user's currency based on location
  const detectUserCurrency = async () => {
    try {
      // Try to detect via IP geolocation immediately
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3000);
      
      const response = await fetch('https://ipapi.co/json/', { 
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      if (response.ok) {
        const data = await response.json();
        const countryCode = data.country_code;
        const detectedCur = countryCurrencyMap[countryCode] || 'GBP';
        
        setDetectedCurrency(detectedCur);
        setSelectedCurrencyState(detectedCur);
        
        console.log(`Currency auto-detected: ${countryCode} → ${detectedCur}`);
      } else {
        throw new Error('Failed to fetch location');
      }
    } catch (error) {
      console.log('Currency detection failed, using GBP default');
      setDetectedCurrency('GBP');
      setSelectedCurrencyState('GBP');
    }
  };

  // Fetch exchange rates from API
  const fetchExchangeRates = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Check cache first (refresh every 6 hours)
      const cachedData = localStorage.getItem('exchange_rates_cache');
      const cacheTimestamp = localStorage.getItem('exchange_rates_timestamp');
      
      if (cachedData && cacheTimestamp) {
        const sixHoursAgo = Date.now() - (6 * 60 * 60 * 1000);
        if (parseInt(cacheTimestamp) > sixHoursAgo) {
          setExchangeRates(JSON.parse(cachedData));
          setIsLoading(false);
          return;
        }
      }

      // Fetch fresh rates from free API (exchangerate-api.com)
      const response = await fetch('https://api.exchangerate-api.com/v4/latest/USD');
      
      if (!response.ok) {
        throw new Error('Failed to fetch exchange rates');
      }

      const data = await response.json();
      const rates = data.rates;

      // Cache the results
      localStorage.setItem('exchange_rates_cache', JSON.stringify(rates));
      localStorage.setItem('exchange_rates_timestamp', Date.now().toString());

      setExchangeRates(rates);
    } catch (error) {
      console.error('Error fetching exchange rates:', error);
      setError('Failed to load exchange rates. Showing original currency.');
      
      // Fallback to 1:1 rates if API fails
      const fallbackRates: ExchangeRates = {};
      supportedCurrencies.forEach(currency => {
        fallbackRates[currency.code] = 1;
      });
      setExchangeRates(fallbackRates);
    } finally {
      setIsLoading(false);
    }
  };

  const setSelectedCurrency = (currency: string) => {
    setSelectedCurrencyState(currency);
    // Remove localStorage manipulation - we want automatic detection only
  };

  const convertAmount = (amount: number, fromCurrency: string, toCurrency?: string): number => {
    if (!exchangeRates || Object.keys(exchangeRates).length === 0) {
      return amount; // Fallback if no rates available
    }

    const targetCurrency = toCurrency || selectedCurrency;
    
    if (fromCurrency === targetCurrency) {
      return amount;
    }

    // Convert via USD (base currency in our API)
    const usdAmount = fromCurrency === 'USD' ? amount : amount / (exchangeRates[fromCurrency] || 1);
    const convertedAmount = targetCurrency === 'USD' ? usdAmount : usdAmount * (exchangeRates[targetCurrency] || 1);

    return Math.round(convertedAmount);
  };

  const formatCurrency = (amount: number, currency?: string): string => {
    const targetCurrency = currency || selectedCurrency;
    const currencyData = supportedCurrencies.find(c => c.code === targetCurrency);
    const symbol = currencyData?.symbol || targetCurrency;
    
    return `${symbol}${amount.toLocaleString()}`;
  };

  const refreshRates = async () => {
    localStorage.removeItem('exchange_rates_cache');
    localStorage.removeItem('exchange_rates_timestamp');
    await fetchExchangeRates();
  };

  useEffect(() => {
    detectUserCurrency();
    fetchExchangeRates();
  }, []);

  const value: CurrencyContextType = {
    selectedCurrency,
    exchangeRates,
    isLoading,
    error,
    detectedCurrency,
    setSelectedCurrency,
    convertAmount,
    formatCurrency,
    refreshRates,
  };

  return (
    <CurrencyContext.Provider value={value}>
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  const context = useContext(CurrencyContext);
  if (context === undefined) {
    throw new Error('useCurrency must be used within a CurrencyProvider');
  }
  return context;
}