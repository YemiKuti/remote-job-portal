import { useState, useEffect } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import PricingCard from "@/components/PricingCard";
import { toast } from "sonner";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { CheckCircle2 } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useNavigate } from "react-router-dom";
import { useSupabaseClient } from "@/hooks/useSupabase";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2 } from "lucide-react";

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
  single: [
    "1 job posting",
    "30-day listing",
    "Basic company profile",
    "Email support"
  ],
  package5: [
    "5 job postings",
    "60-day listings",
    "Enhanced company profile",
    "Priority email support",
    "Basic analytics"
  ],
  package10: [
    "10 job postings",
    "90-day listings",
    "Premium company profile",
    "Priority support",
    "Advanced analytics",
    "Featured job placement"
  ]
};

const Pricing = () => {
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [userType, setUserType] = useState<'jobSeeker' | 'employer'>('jobSeeker');
  const [annual, setAnnual] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const supabase = useSupabaseClient();
  const navigate = useNavigate();
  
  // Check if user is authenticated
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  
  useEffect(() => {
    const checkAuth = async () => {
      const { data } = await supabase.auth.getSession();
      setIsAuthenticated(!!data.session);
    };
    
    checkAuth();
  }, [supabase.auth]);
  
  const handleSubscribe = async (price: number, currency: string, plan: string) => {
    setSelectedPlan(plan);
    
    // If user is not authenticated, redirect to sign in
    if (!isAuthenticated) {
      toast.info("Please sign in to subscribe to a plan", {
        description: "You'll be redirected to the login page",
        duration: 4000,
      });
      
      // Store plan details in local storage to retrieve after login
      localStorage.setItem("selectedPlan", JSON.stringify({ plan, userType, annual }));
      
      setTimeout(() => {
        navigate("/signin");
      }, 1500);
      return;
    }
    
    // User is authenticated, proceed with checkout
    setIsLoading(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: { plan, annual, userType }
      });
      
      if (error) throw error;
      
      if (data?.url) {
        window.location.href = data.url;
      } else {
        throw new Error("No checkout URL returned");
      }
    } catch (error) {
      console.error("Error creating checkout session:", error);
      toast.error("Failed to create checkout session", {
        description: "Please try again later",
      });
    } finally {
      setIsLoading(false);
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
          {isLoading && (
            <Alert className="mb-8 bg-blue-50 border-blue-200">
              <AlertDescription className="flex items-center">
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Creating your checkout session...
              </AlertDescription>
            </Alert>
          )}
          
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
            
            {userType === 'jobSeeker' && (
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
            )}
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
              {/* Single Job Package */}
              <div className="border rounded-lg overflow-hidden shadow-sm bg-white">
                <div className="p-6 border-b">
                  <h3 className="text-2xl font-bold">Single Job</h3>
                  <div className="mt-4">
                    <div className="text-3xl font-bold">£20<span className="text-sm text-gray-500 font-normal">/job</span></div>
                  </div>
                  <p className="text-gray-500 mt-2">Perfect for occasional hiring</p>
                </div>
                
                <div className="p-6">
                  <ul className="space-y-4">
                    {EMPLOYER_FEATURES.single.map((feature, index) => (
                      <li key={index} className="flex items-center gap-3">
                        <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                  
                  <button 
                    className="w-full mt-8 bg-job-green text-white py-3 rounded-md font-medium hover:bg-job-darkGreen transition disabled:opacity-50 disabled:cursor-not-allowed"
                    onClick={() => handleSubscribe(20, "GBP", "Single")}
                    disabled={isLoading}
                  >
                    {isLoading ? "Processing..." : "Get Started"}
                  </button>
                </div>
              </div>
              
              {/* 5 Jobs Package */}
              <div className="border-2 border-job-green rounded-lg overflow-hidden shadow-lg bg-white relative">
                <div className="absolute -top-3 right-6 bg-job-green text-white text-xs font-bold px-3 py-1 rounded">POPULAR</div>
                <div className="p-6 border-b">
                  <h3 className="text-2xl font-bold">5 Jobs Package</h3>
                  <div className="mt-4">
                    <div className="text-3xl font-bold">£70<span className="text-sm text-gray-500 font-normal">/package</span></div>
                    <div className="text-sm text-green-600 mt-1">£14 per job (Save £30)</div>
                  </div>
                  <p className="text-gray-500 mt-2">Best for growing companies</p>
                </div>
                
                <div className="p-6">
                  <ul className="space-y-4">
                    {EMPLOYER_FEATURES.package5.map((feature, index) => (
                      <li key={index} className="flex items-center gap-3">
                        <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                  
                  <button 
                    className="w-full mt-8 bg-job-green text-white py-3 rounded-md font-medium hover:bg-job-darkGreen transition disabled:opacity-50 disabled:cursor-not-allowed"
                    onClick={() => handleSubscribe(70, "GBP", "Package5")}
                    disabled={isLoading}
                  >
                    {isLoading ? "Processing..." : "Get Started"}
                  </button>
                </div>
              </div>
              
              {/* 10 Jobs Package */}
              <div className="border rounded-lg overflow-hidden shadow-sm bg-white">
                <div className="p-6 border-b">
                  <h3 className="text-2xl font-bold">10 Jobs Package</h3>
                  <div className="mt-4">
                    <div className="text-3xl font-bold">£150<span className="text-sm text-gray-500 font-normal">/package</span></div>
                    <div className="text-sm text-green-600 mt-1">£15 per job (Save £50)</div>
                  </div>
                  <p className="text-gray-500 mt-2">For active recruiters</p>
                </div>
                
                <div className="p-6">
                  <ul className="space-y-4">
                    {EMPLOYER_FEATURES.package10.map((feature, index) => (
                      <li key={index} className="flex items-center gap-3">
                        <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                  
                  <button 
                    className="w-full mt-8 bg-job-green text-white py-3 rounded-md font-medium hover:bg-job-darkGreen transition disabled:opacity-50 disabled:cursor-not-allowed"
                    onClick={() => handleSubscribe(150, "GBP", "Package10")}
                    disabled={isLoading}
                  >
                    {isLoading ? "Processing..." : "Get Started"}
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
                <h4 className="font-medium text-job-green">How can I manage my subscription?</h4>
                <p className="text-gray-600">You can manage your subscription through our Stripe Customer Portal, which allows you to upgrade, downgrade, or cancel your plan at any time.</p>
              </div>
              <div>
                <h4 className="font-medium text-job-green">What payment methods do you accept?</h4>
                <p className="text-gray-600">We accept all major credit and debit cards including Visa, Mastercard, and American Express through our secure payment processor, Stripe.</p>
              </div>
              <div>
                <h4 className="font-medium text-job-green">Where can I find my subscription details?</h4>
                <p className="text-gray-600">Your subscription details, including current plan information and billing cycle, can be found under the "Subscriptions" section in your account menu.</p>
              </div>
              <div>
                <h4 className="font-medium text-job-green">Will I be billed automatically when my subscription renews?</h4>
                <p className="text-gray-600">Yes, your subscription will automatically renew at the end of your billing period unless you cancel before the renewal date.</p>
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
