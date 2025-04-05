
import { useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import PricingCard from "@/components/PricingCard";
import { toast } from "sonner";
import memberfulService from "@/services/memberful";

// Map of plan names to Memberful plan IDs - replace with your actual plan IDs
const MEMBERFUL_PLAN_IDS: Record<string, string> = {
  "Monthly": "monthly-plan-id", // Replace with your Memberful plan ID
  "Quarterly": "quarterly-plan-id", // Replace with your Memberful plan ID
  "Annual": "annual-plan-id" // Replace with your Memberful plan ID
};

// Common features shared across all plans
const COMMON_FEATURES = [
  "Access to all job listings",
  "Advanced search filters",
  "Job alerts via email",
  "Save favorite jobs",
  "Apply to premium jobs"
];

const Pricing = () => {
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  
  const handleSubscribe = (price: number, currency: string, plan: string) => {
    setSelectedPlan(plan);
    
    // Get the Memberful plan ID
    const planId = MEMBERFUL_PLAN_IDS[plan];
    
    if (planId) {
      toast.info(`Opening Memberful checkout for the ${plan} plan.`);
      memberfulService.checkout(planId);
    } else {
      toast.error(`Memberful plan ID not configured for ${plan} plan.`);
      console.error(`No Memberful plan ID configured for: ${plan}`);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-grow">
        <div className="bg-gradient-to-br from-job-green to-job-lightGreen py-16">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Choose Your Plan
            </h1>
            <p className="text-xl text-white/90 max-w-2xl mx-auto">
              Get access to more jobs and advanced features with our subscription plans
            </p>
          </div>
        </div>
        
        <div className="container mx-auto px-4 py-16">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 justify-center">
            <PricingCard
              title="Monthly Plan"
              price={10}
              currency="GBP"
              description="Perfect for job seekers"
              features={COMMON_FEATURES}
              onSubscribe={(price, currency) => handleSubscribe(price, currency, "Monthly")}
            />
            
            <PricingCard
              title="Quarterly Plan"
              price={25}
              currency="GBP"
              description="Save with our 3-month plan"
              features={COMMON_FEATURES}
              onSubscribe={(price, currency) => handleSubscribe(price, currency, "Quarterly")}
            />
            
            <PricingCard
              title="Annual Plan"
              price={90}
              currency="GBP"
              description="Best value for long-term job seekers"
              features={COMMON_FEATURES}
              onSubscribe={(price, currency) => handleSubscribe(price, currency, "Annual")}
            />
          </div>
          
          <div className="mt-16 max-w-3xl mx-auto bg-gray-50 rounded-lg p-6 border border-gray-200">
            <h3 className="text-xl font-semibold mb-4">Frequently Asked Questions</h3>
            <div className="space-y-4">
              <div>
                <h4 className="font-medium text-job-green">Can I cancel my subscription?</h4>
                <p className="text-gray-600">Yes, you can cancel your subscription at any time. Your access will remain until the end of your billing period.</p>
              </div>
              <div>
                <h4 className="font-medium text-job-green">How does the currency conversion work?</h4>
                <p className="text-gray-600">All payments are processed in British Pounds (GBP) through our Memberful integration.</p>
              </div>
              <div>
                <h4 className="font-medium text-job-green">What payment methods do you accept?</h4>
                <p className="text-gray-600">We accept all major credit cards and PayPal through our Memberful integration.</p>
              </div>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Pricing;
