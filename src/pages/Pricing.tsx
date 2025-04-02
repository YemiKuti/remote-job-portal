
import { useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import PricingCard from "@/components/PricingCard";
import { toast } from "sonner";

const Pricing = () => {
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  
  const handleSubscribe = (price: number, currency: string, plan: string) => {
    setSelectedPlan(plan);
    toast.success(`You've selected the ${plan} plan. Payment of ${price} ${currency} will be processed.`);
    // In a real application, we would redirect to a payment page or open a payment modal
    setTimeout(() => {
      toast.info("This is where we would integrate with a payment gateway like Stripe to process the payment.");
    }, 1000);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-grow">
        <div className="bg-gradient-to-br from-job-blue to-job-lightBlue py-16">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Choose Your Plan
            </h1>
            <p className="text-xl text-white/90 max-w-2xl mx-auto">
              Get access to more jobs and advanced features with our premium plans
            </p>
          </div>
        </div>
        
        <div className="container mx-auto px-4 py-16">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 justify-center">
            <PricingCard
              title="Monthly Plan"
              price={19.99}
              currency="USD"
              description="Perfect for job seekers"
              features={[
                "Access to all job listings",
                "Advanced search filters",
                "Job alerts via email",
                "Save favorite jobs",
                "30-day access"
              ]}
              onSubscribe={(price, currency) => handleSubscribe(price, currency, "Monthly")}
            />
            
            <PricingCard
              title="3-Month Plan"
              price={49.99}
              currency="USD"
              description="Our most popular plan"
              features={[
                "Everything in Monthly plan",
                "Priority job alerts",
                "CV/Resume review",
                "Apply to premium jobs",
                "90-day access"
              ]}
              onSubscribe={(price, currency) => handleSubscribe(price, currency, "3-Month")}
            />
            
            <PricingCard
              title="Annual Plan"
              price={149.99}
              currency="USD"
              description="Best value for long-term job seekers"
              features={[
                "Everything in 3-Month plan",
                "1-on-1 career coaching session",
                "Personalized job recommendations",
                "Featured applicant status",
                "365-day access"
              ]}
              onSubscribe={(price, currency) => handleSubscribe(price, currency, "Annual")}
            />
          </div>
          
          <div className="mt-16 max-w-3xl mx-auto bg-gray-50 rounded-lg p-6 border border-gray-200">
            <h3 className="text-xl font-semibold mb-4">Frequently Asked Questions</h3>
            <div className="space-y-4">
              <div>
                <h4 className="font-medium text-job-blue">Can I cancel my subscription?</h4>
                <p className="text-gray-600">Yes, you can cancel your subscription at any time. Your access will remain until the end of your billing period.</p>
              </div>
              <div>
                <h4 className="font-medium text-job-blue">How does the currency conversion work?</h4>
                <p className="text-gray-600">Our system automatically detects your location and displays prices in your local currency. You can also manually select your preferred currency.</p>
              </div>
              <div>
                <h4 className="font-medium text-job-blue">What payment methods do you accept?</h4>
                <p className="text-gray-600">We accept all major credit cards, PayPal, and bank transfers for select countries.</p>
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
