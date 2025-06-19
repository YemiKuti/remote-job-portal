
import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { Rocket, Crown } from "lucide-react";

export const SubscriptionRequired = ({
  employerPlan,
  onRefresh,
  showFreeOption = false,
}: {
  employerPlan?: string | null;
  onRefresh?: () => void;
  showFreeOption?: boolean;
}) => (
  <Card className="max-w-lg mx-auto mt-10">
    <CardHeader>
      <CardTitle className="flex items-center gap-2">
        <Crown className="h-5 w-5 text-job-blue" />
        {showFreeOption ? 'Upgrade Your Plan' : 'Employer Subscription Required'}
      </CardTitle>
    </CardHeader>
    <CardContent>
      <p className="mb-4 text-gray-700">
        {showFreeOption 
          ? "You're currently on the free plan. Upgrade to unlock more job postings and premium features."
          : "You need an active employer subscription to post jobs. Unlock more postings and features with a paid plan."
        }
      </p>
      {employerPlan && (
        <div className="mb-4">
          <span className="mr-2 text-sm">Current:</span>
          <Badge variant="secondary">{employerPlan}</Badge>
        </div>
      )}
      <Link to="/pricing">
        <Button className="bg-job-blue hover:bg-job-darkBlue w-full mb-2">
          <Crown className="mr-2 h-4 w-4" />
          View Subscription Plans
        </Button>
      </Link>
      {onRefresh && (
        <Button variant="outline" className="w-full" onClick={onRefresh}>
          Refresh Subscription Status
        </Button>
      )}
      <ul className="mt-5 list-disc pl-5 text-gray-500 text-sm">
        <li>Post multiple jobs and reach thousands of candidates</li>
        <li>Get featured placement for maximum visibility</li>
        <li>Advanced employer dashboard &amp; analytics</li>
        <li>Cancel or upgrade anytime</li>
      </ul>
    </CardContent>
  </Card>
);

export default SubscriptionRequired;
