
import { useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import PricingCard from "@/components/PricingCard";
import { toast } from "sonner";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { CheckCircle2 } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

// Common features shared across all plans
const COMMON_FEATURES = [
  "Access to all job listings",
  "Advanced search filters",
  "Job alerts via email",
  "Save favorite jobs",
  "Apply to premium jobs"
];

// Employer plan features
const EMPLOYER_FEATURES = {
  basic: [
    "5 job postings",
    "1 featured job",
    "30-day listings",
    "Basic company profile",
    "Email support"
  ],
  pro: [
    "15 job postings",
    "3 featured jobs",
    "60-day listings",
    "Enhanced company profile",
    "Priority email support",
    "Candidate management",
    "Application analytics"
  ],
  enterprise: [
    "Unlimited job postings",
    "10 featured jobs",
    "90-day listings",
    "Premium company profile",
    "Dedicated account manager",
    "Advanced analytics dashboard",
    "API access",
    "Custom integration options"
  ]
};

const Pricing = () => {
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [userType, setUserType] = useState<'jobSeeker' | 'employer'>('jobSeeker');
  const [annual, setAnnual] = useState<boolean>(false);
  
  const handleSubscribe = (price: number, currency: string, plan: string) => {
    setSelectedPlan(plan);
    toast.success(`You've selected the ${plan} plan. Redirecting to checkout...`);
    
    // Here we would redirect to our own checkout page instead of using Memberful
    setTimeout(() => {
      window.location.href = `/checkout?plan=${plan}&price=${price}&currency=${currency}&billing=${annual ? 'annual' : 'monthly'}`;
    }, 1500);
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
          <div className="flex flex-col items-center mb-12">
            <Tabs defaultValue="jobSeeker" className="w-full max-w-md mb-6">
              <TabsList className="grid grid-cols-2 w-full">
                <TabsTrigger 
                  value="jobSeeker" 
                  onClick={() => setUserType('jobSeeker')}
                >
                  Job Seekers
                </TabsTrigger>
                <TabsTrigger 
                  value="employer" 
                  onClick={() => setUserType('employer')}
                >
                  Employers
                </TabsTrigger>
              </TabsList>
            </Tabs>
            
            <div className="flex items-center gap-3 mb-8">
              <Label htmlFor="billing-toggle">Monthly</Label>
              <Switch 
                id="billing-toggle" 
                checked={annual}
                onCheckedChange={(checked) => setAnnual(checked)}
              />
              <Label htmlFor="billing-toggle" className="flex items-center gap-2">
                Annual <span className="bg-green-100 text-green-800 text-xs font-medium px-2 py-0.5 rounded">Save 20%</span>
              </Label>
            </div>
          </div>

          {userType === 'jobSeeker' ? (
            <div className="grid md:grid-cols-3 gap-8 justify-center">
              <PricingCard
                title="Monthly Plan"
                price={annual ? 8 : 10}
                currency="GBP"
                description="Perfect for job seekers"
                features={COMMON_FEATURES}
                onSubscribe={(price, currency) => handleSubscribe(price, currency, "Monthly")}
              />
              
              <PricingCard
                title="Quarterly Plan"
                price={annual ? 20 : 25}
                currency="GBP"
                description="Save with our 3-month plan"
                features={COMMON_FEATURES}
                onSubscribe={(price, currency) => handleSubscribe(price, currency, "Quarterly")}
              />
              
              <PricingCard
                title="Annual Plan"
                price={annual ? 72 : 90}
                currency="GBP"
                description="Best value for long-term job seekers"
                features={COMMON_FEATURES}
                onSubscribe={(price, currency) => handleSubscribe(price, currency, "Annual")}
              />
            </div>
          ) : (
            <div className="grid md:grid-cols-3 gap-8 justify-center">
              {/* Employer Plans */}
              <div className="border rounded-lg overflow-hidden shadow-sm bg-white">
                <div className="p-6 border-b">
                  <h3 className="text-2xl font-bold">Basic</h3>
                  <div className="mt-4">
                    <div className="text-3xl font-bold">£{annual ? 40 : 50}<span className="text-sm text-gray-500 font-normal">/month</span></div>
                    {annual && (
                      <div className="text-sm text-green-600 mt-1">Billed annually (£{40*12})</div>
                    )}
                  </div>
                  <p className="text-gray-500 mt-2">For startups and small businesses</p>
                </div>
                
                <div className="p-6">
                  <ul className="space-y-4">
                    {EMPLOYER_FEATURES.basic.map((feature, index) => (
                      <li key={index} className="flex items-center gap-3">
                        <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                  
                  <button 
                    className="w-full mt-8 bg-job-green text-white py-3 rounded-md font-medium hover:bg-job-darkGreen transition"
                    onClick={() => handleSubscribe(annual ? 40 : 50, "GBP", "Basic")}
                  >
                    Get Started
                  </button>
                </div>
              </div>
              
              <div className="border-2 border-job-green rounded-lg overflow-hidden shadow-lg bg-white relative">
                <div className="absolute -top-3 right-6 bg-job-green text-white text-xs font-bold px-3 py-1 rounded">POPULAR</div>
                <div className="p-6 border-b">
                  <h3 className="text-2xl font-bold">Pro</h3>
                  <div className="mt-4">
                    <div className="text-3xl font-bold">£{annual ? 80 : 100}<span className="text-sm text-gray-500 font-normal">/month</span></div>
                    {annual && (
                      <div className="text-sm text-green-600 mt-1">Billed annually (£{80*12})</div>
                    )}
                  </div>
                  <p className="text-gray-500 mt-2">For growing companies</p>
                </div>
                
                <div className="p-6">
                  <ul className="space-y-4">
                    {EMPLOYER_FEATURES.pro.map((feature, index) => (
                      <li key={index} className="flex items-center gap-3">
                        <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                  
                  <button 
                    className="w-full mt-8 bg-job-green text-white py-3 rounded-md font-medium hover:bg-job-darkGreen transition"
                    onClick={() => handleSubscribe(annual ? 80 : 100, "GBP", "Pro")}
                  >
                    Get Started
                  </button>
                </div>
              </div>
              
              <div className="border rounded-lg overflow-hidden shadow-sm bg-white">
                <div className="p-6 border-b">
                  <h3 className="text-2xl font-bold">Enterprise</h3>
                  <div className="mt-4">
                    <div className="text-3xl font-bold">£{annual ? 160 : 200}<span className="text-sm text-gray-500 font-normal">/month</span></div>
                    {annual && (
                      <div className="text-sm text-green-600 mt-1">Billed annually (£{160*12})</div>
                    )}
                  </div>
                  <p className="text-gray-500 mt-2">For large organizations</p>
                </div>
                
                <div className="p-6">
                  <ul className="space-y-4">
                    {EMPLOYER_FEATURES.enterprise.map((feature, index) => (
                      <li key={index} className="flex items-center gap-3">
                        <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                  
                  <button 
                    className="w-full mt-8 bg-job-green text-white py-3 rounded-md font-medium hover:bg-job-darkGreen transition"
                    onClick={() => handleSubscribe(annual ? 160 : 200, "GBP", "Enterprise")}
                  >
                    Get Started
                  </button>
                </div>
              </div>
            </div>
          )}
          
          <div className="mt-16 max-w-3xl mx-auto bg-gray-50 rounded-lg p-6 border border-gray-200">
            <h3 className="text-xl font-semibold mb-4">Frequently Asked Questions</h3>
            <div className="space-y-4">
              <div>
                <h4 className="font-medium text-job-green">Can I cancel my subscription?</h4>
                <p className="text-gray-600">Yes, you can cancel your subscription at any time. Your access will remain until the end of your billing period.</p>
              </div>
              <div>
                <h4 className="font-medium text-job-green">How do I manage my account?</h4>
                <p className="text-gray-600">To manage your account, simply click on "Account" located in the top right corner of the website. This will open the account menu where you can manage all aspects of your membership.</p>
              </div>
              <div>
                <h4 className="font-medium text-job-green">What can I do from the account menu?</h4>
                <p className="text-gray-600">From your account menu, you can:
                View and manage your subscriptions.
                Access and download payment receipts.
                Update your personal information such as name, email address, and password.</p>
              </div>
              <div>
                <h4 className="font-medium text-job-green">How do I update my account information?</h4>
                <p className="text-gray-600">To update your account information (name, email, password, etc.), navigate to the "Account" section within the menu.</p>
              </div>
              <div>
                <h4 className="font-medium text-job-green">Where can I find my subscription details?</h4>
                <p className="text-gray-600">Your subscription details, including current plan information and billing cycle, can be found under the "Subscriptions" section in your account menu.</p>
              </div>
              <div>
                <h4 className="font-medium text-job-green">Can I manage multiple subscriptions from one account?</h4>
                <p className="text-gray-600">Yes, if you have multiple subscriptions, you can manage them all conveniently from your account menu under the "Subscriptions" section.</p>
              </div>
              <div>
                <h4 className="font-medium text-job-green">How can I contact customer support regarding my account?</h4>
                <p className="text-gray-600">For any account-related inquiries or assistance, please reach out to us at hello@africantechjobs.co.uk</p>
              </div>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
      
      {/* GDPR-compliant cookie notice */}
      <div className="fixed bottom-0 left-0 right-0 bg-white p-4 shadow-lg border-t border-gray-200 z-50">
        <div className="container mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="text-sm text-gray-600 md:w-3/4">
            <p>
              We use cookies to enhance your experience on our website. By continuing to browse, you agree to our{' '}
              <a href="#" className="text-job-blue hover:underline">Cookie Policy</a>. You can manage your preferences at any time.
            </p>
          </div>
          <div className="flex gap-2">
            <button className="px-4 py-2 text-sm border border-gray-300 rounded hover:bg-gray-100 transition">
              Manage Preferences
            </button>
            <button className="px-4 py-2 text-sm bg-job-green text-white rounded hover:bg-job-darkGreen transition">
              Accept All
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Pricing;
