
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useCurrency, supportedCurrencies } from "@/contexts/CurrencyContext";

interface PricingCardProps {
  title: string;
  price: number;
  currency: string;
  description: string;
  features: string[];
  onSubscribe: (price: number, currency: string) => void;
}

const PricingCard = ({ 
  title, 
  price, 
  currency: defaultCurrency, 
  description, 
  features,
  onSubscribe 
}: PricingCardProps) => {
  const { selectedCurrency, convertAmount } = useCurrency();
  const [localPrice, setLocalPrice] = useState(price);
  
  // Create currency symbol mapping
  const getCurrencySymbol = (currencyCode: string) => {
    const currency = supportedCurrencies.find(c => c.code === currencyCode);
    return currency?.symbol || currencyCode;
  };
  
  useEffect(() => {
    // Convert price using the currency context
    const convertedPrice = convertAmount(price, defaultCurrency, selectedCurrency);
    setLocalPrice(convertedPrice);
  }, [selectedCurrency, price, defaultCurrency, convertAmount]);

  // Determine the billing period text based on the plan title
  const getBillingPeriod = () => {
    if (title.includes("Quarterly")) {
      return "per quarter";
    } else if (title.includes("Annual")) {
      return "per year";
    } else {
      return "per month";
    }
  };

  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <CardTitle className="text-xl">{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="text-center mb-6">
          <div className="text-3xl font-bold flex items-center justify-center">
            {getCurrencySymbol(selectedCurrency)}
            {localPrice}
          </div>
          <div className="text-sm text-gray-500">{getBillingPeriod()}</div>
        </div>
        <ul className="space-y-3">
          {features.map((feature, index) => (
            <li key={index} className="flex items-start">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-green-500" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span className="text-gray-600">{feature}</span>
            </li>
          ))}
        </ul>
      </CardContent>
      <CardFooter>
        <Button 
          className="w-full bg-job-green hover:bg-job-darkGreen" 
          onClick={() => onSubscribe(localPrice, selectedCurrency)}
        >
          Subscribe Now
        </Button>
      </CardFooter>
    </Card>
  );
};

export default PricingCard;
