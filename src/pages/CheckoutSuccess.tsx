
import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useSupabaseClient, useSubscription } from '@/hooks/useSupabase';
import { Loader2 } from 'lucide-react';

const CheckoutSuccess = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { checkSubscription, subscribed, subscription_tier, loading } = useSubscription();
  const [processingComplete, setProcessingComplete] = useState(false);
  const [hasCheckedSubscription, setHasCheckedSubscription] = useState(false);
  
  // Extract session_id from query parameters
  const searchParams = new URLSearchParams(location.search);
  const sessionId = searchParams.get('session_id');

  useEffect(() => {
    // Only run the verification once
    if (hasCheckedSubscription) return;

    const verifyCheckout = async () => {
      try {
        // Wait a moment to allow Stripe webhook to process
        await new Promise(resolve => setTimeout(resolve, 3000));
        
        // Check subscription status only once
        await checkSubscription();
        setHasCheckedSubscription(true);
        setProcessingComplete(true);
      } catch (error) {
        console.error('Error verifying checkout:', error);
        setProcessingComplete(true);
        setHasCheckedSubscription(true);
      }
    };
    
    if (sessionId && !hasCheckedSubscription) {
      verifyCheckout();
    } else if (!sessionId) {
      // No session ID means user was redirected here without going through checkout
      setProcessingComplete(true);
      setHasCheckedSubscription(true);
    }
  }, [sessionId, checkSubscription, hasCheckedSubscription]);

  const handleRefreshSubscription = async () => {
    try {
      await checkSubscription();
    } catch (error) {
      console.error('Error refreshing subscription:', error);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow bg-gray-50 py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-md mx-auto bg-white rounded-lg shadow p-6">
            {!processingComplete || (loading && !hasCheckedSubscription) ? (
              <div className="text-center py-8">
                <Loader2 className="h-12 w-12 mx-auto text-job-green animate-spin" />
                <h2 className="text-2xl font-semibold mt-4 mb-2">Processing your subscription</h2>
                <p className="text-gray-500">Please wait while we confirm your payment...</p>
              </div>
            ) : subscribed ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="h-10 w-10 text-green-600" />
                </div>
                <h2 className="text-2xl font-semibold mb-2">Subscription Successful!</h2>
                <p className="text-gray-600 mb-6">
                  Thank you for subscribing to the <span className="font-semibold">{subscription_tier}</span> plan.
                  Your account has been upgraded and you now have access to all premium features.
                </p>
                <div className="space-y-3">
                  <Button className="w-full" onClick={() => navigate("/")}>
                    Go to Dashboard
                  </Button>
                  <Button variant="outline" className="w-full" onClick={() => navigate("/account")}>
                    View Subscription Details
                  </Button>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <h2 className="text-2xl font-semibold mb-2">Subscription Status</h2>
                <p className="text-gray-600 mb-6">
                  We couldn't confirm your subscription status at this moment. If you've completed the payment,
                  it might take a few minutes to reflect in our system.
                </p>
                <div className="space-y-3">
                  <Button className="w-full" onClick={handleRefreshSubscription} disabled={loading}>
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Checking...
                      </>
                    ) : (
                      'Check Again'
                    )}
                  </Button>
                  <Button variant="outline" className="w-full" onClick={() => navigate("/")}>
                    Return to Homepage
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default CheckoutSuccess;
