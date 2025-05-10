
import React from 'react';
import { Card, CardHeader, CardContent, CardDescription, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export function BillingSettings() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Billing Information</CardTitle>
        <CardDescription>Manage your subscription and payment methods</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="rounded-md border p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Current Plan: Business</p>
              <p className="text-sm text-muted-foreground">$99/month, billed monthly</p>
            </div>
            <Button variant="outline">Upgrade Plan</Button>
          </div>
        </div>
        
        <div className="rounded-md border p-4">
          <p className="font-medium mb-2">Payment Methods</p>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="h-8 w-12 bg-gray-200 rounded"></div>
              <div>
                <p className="text-sm">Visa ending in 4242</p>
                <p className="text-xs text-muted-foreground">Expires 12/26</p>
              </div>
            </div>
            <Button variant="outline" size="sm">Edit</Button>
          </div>
        </div>
        
        <div className="rounded-md border p-4">
          <p className="font-medium mb-2">Billing History</p>
          <div className="space-y-2">
            <div className="flex justify-between">
              <p className="text-sm">May 1, 2025</p>
              <p className="text-sm font-medium">$99.00</p>
            </div>
            <div className="flex justify-between">
              <p className="text-sm">Apr 1, 2025</p>
              <p className="text-sm font-medium">$99.00</p>
            </div>
            <div className="flex justify-between">
              <p className="text-sm">Mar 1, 2025</p>
              <p className="text-sm font-medium">$99.00</p>
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button variant="outline">Download Invoices</Button>
      </CardFooter>
    </Card>
  );
}
