import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatSalaryWithConversion } from '@/data/jobs';
import { useCurrency } from '@/contexts/CurrencyContext';

// Sample jobs for currency conversion demo
const demoJobs = [
  {
    id: "demo-1",
    title: "Senior Frontend Developer",
    company: "TechCorp London",
    location: "London, UK",
    salary: { min: 45000, max: 65000, currency: "GBP" },
    employmentType: "Full-time",
    remote: true
  },
  {
    id: "demo-2", 
    title: "Backend Engineer",
    company: "StartupNG",
    location: "Lagos, Nigeria",
    salary: { min: 8000000, max: 15000000, currency: "NGN" },
    employmentType: "Full-time",
    remote: false
  },
  {
    id: "demo-3",
    title: "Data Scientist",
    company: "AI Innovations",
    location: "San Francisco, USA",
    salary: { min: 85000, max: 120000, currency: "USD" },
    employmentType: "Full-time",
    remote: true
  },
  {
    id: "demo-4",
    title: "DevOps Engineer",
    company: "CloudTech Nairobi",
    location: "Nairobi, Kenya", 
    salary: { min: 2500000, max: 4000000, currency: "KES" },
    employmentType: "Full-time",
    remote: false
  }
];

export function CurrencyDemo() {
  const { selectedCurrency, convertAmount, detectedCurrency, isLoading, error } = useCurrency();

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Currency Conversion Demo</CardTitle>
          <div className="flex flex-wrap gap-2 text-sm text-muted-foreground">
            <Badge variant="outline">
              Selected: {selectedCurrency}
            </Badge>
            {detectedCurrency && (
              <Badge variant="secondary">
                Auto-detected: {detectedCurrency}
              </Badge>
            )}
            {isLoading && (
              <Badge variant="secondary">
                Loading rates...
              </Badge>
            )}
            {error && (
              <Badge variant="destructive">
                Offline mode
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            {demoJobs.map((job) => (
              <Card key={job.id} className="p-4">
                <div className="space-y-2">
                  <h4 className="font-semibold">{job.title}</h4>
                  <p className="text-sm text-muted-foreground">{job.company}</p>
                  <p className="text-sm text-muted-foreground">{job.location}</p>
                  
                  <div className="space-y-1">
                    <div className="text-sm font-medium">
                      {formatSalaryWithConversion(
                        job.salary.min,
                        job.salary.max,
                        job.salary.currency,
                        selectedCurrency,
                        convertAmount,
                        job.salary.currency !== selectedCurrency
                      )}
                    </div>
                    
                    {job.salary.currency !== selectedCurrency && (
                      <div className="text-xs text-muted-foreground">
                        Original: {formatSalaryWithConversion(
                          job.salary.min,
                          job.salary.max,
                          job.salary.currency,
                          job.salary.currency,
                          convertAmount,
                          false
                        )}
                      </div>
                    )}
                  </div>
                  
                  <div className="flex gap-2">
                    <Badge variant="outline" className="text-xs">
                      {job.employmentType}
                    </Badge>
                    {job.remote && (
                      <Badge variant="secondary" className="text-xs">
                        Remote
                      </Badge>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}