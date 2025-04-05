
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { currencies } from "@/data/jobs";

interface PricingCardProps {
  title: string;
  price: number;
  currency: string;
  description: string;
  features: string[];
  onSubscribe: (price: number, currency: string) => void;
}

const exchangeRates: { [key: string]: number } = {
  USD: 1,
  EUR: 0.85,
  GBP: 0.75,
  JPY: 110.34,
  CAD: 1.25,
  AUD: 1.35,
  INR: 74.5,
  NGN: 410.5,
};

const PricingCard = ({ 
  title, 
  price, 
  currency: defaultCurrency, 
  description, 
  features,
  onSubscribe 
}: PricingCardProps) => {
  const [currency, setCurrency] = useState(defaultCurrency);
  const [localPrice, setLocalPrice] = useState(price);
  
  useEffect(() => {
    // Convert price based on selected currency
    const basePrice = price / exchangeRates[defaultCurrency];
    const convertedPrice = basePrice * exchangeRates[currency];
    setLocalPrice(Math.round(convertedPrice));
  }, [currency, price, defaultCurrency]);

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
        <div className="flex justify-between items-center mb-6">
          <div>
            <div className="text-3xl font-bold flex items-center">
              {currencies[currency]?.symbol || currency}
              {localPrice}
            </div>
            <div className="text-sm text-gray-500">{getBillingPeriod()}</div>
          </div>
          <Select value={currency} onValueChange={setCurrency}>
            <SelectTrigger className="w-[100px]">
              <SelectValue placeholder="Currency" />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(currencies).map(([code, { name }]) => (
                <SelectItem key={code} value={code}>
                  {code} - {name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
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
          onClick={() => onSubscribe(localPrice, currency)}
        >
          Subscribe Now
        </Button>
      </CardFooter>
    </Card>
  );
};

export default PricingCard;
