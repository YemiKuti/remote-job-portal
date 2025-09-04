import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CurrencyDisplay } from '@/components/CurrencyDisplay';
import { CurrencyDemo } from '@/components/demo/CurrencyDemo';

export default function CurrencyTestPage() {
  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Real-Time Currency Converter Test</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-4">Auto-Detected Currency</h3>
              <CurrencyDisplay variant="default" showDetected={true} />
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-4">Job Salary Conversion Demo</h3>
              <CurrencyDemo />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}