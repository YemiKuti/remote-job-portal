
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Helper logging function for debugging
const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[CREATE-CHECKOUT] ${step}${detailsStr}`);
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Function started");

    // Get request data
    const { plan, annual, userType } = await req.json();
    logStep("Received request data", { plan, annual, userType });

    // Verify authentication
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? ""
    );

    const authHeader = req.headers.get("Authorization")!;
    const token = authHeader.replace("Bearer ", "");
    logStep("Authenticating user");
    const { data, error } = await supabaseClient.auth.getUser(token);
    
    if (error || !data.user) {
      logStep("Authentication error", { error });
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 401,
      });
    }

    const user = data.user;
    logStep("User authenticated", { userId: user.id, email: user.email });

    // Initialize Stripe
    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2023-10-16",
    });

    // Look up customer or create new one
    let customerId;
    const customers = await stripe.customers.list({ email: user.email, limit: 1 });
    
    if (customers.data.length > 0) {
      customerId = customers.data[0].id;
      logStep("Found existing customer", { customerId });
    } else {
      const newCustomer = await stripe.customers.create({
        email: user.email,
        metadata: { userId: user.id }
      });
      customerId = newCustomer.id;
      logStep("Created new customer", { customerId });
    }

    // Create product if it doesn't exist
    const productName = getProductName(userType, plan);
    const productDescription = getProductDescription(userType, plan);
    const productInterval = getProductInterval(plan);
    const productPrice = calculatePrice(userType, plan, annual);

    logStep("Creating checkout session with", { 
      productName, 
      productDescription, 
      productInterval, 
      productPrice,
      annual
    });

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ["card"],
      line_items: [{
        price_data: {
          currency: "gbp",
          product_data: {
            name: productName,
            description: productDescription,
          },
          unit_amount: productPrice * 100, // Convert to cents
          recurring: productInterval ? {
            interval: productInterval
          } : undefined,
        },
        quantity: 1,
      }],
      mode: productInterval ? "subscription" : "payment",
      success_url: `${req.headers.get("origin")}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${req.headers.get("origin")}/pricing`,
      metadata: {
        userId: user.id,
        plan: plan,
        userType: userType,
        annual: annual ? "true" : "false"
      }
    });

    logStep("Checkout session created", { sessionId: session.id });

    return new Response(JSON.stringify({ url: session.url }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});

// Helper function to get product name
function getProductName(userType: string, plan: string): string {
  if (userType === 'jobSeeker') {
    if (plan === 'Monthly') return 'Job Seeker Monthly Plan';
    if (plan === 'Quarterly') return 'Job Seeker Quarterly Plan';
    if (plan === 'Annual') return 'Job Seeker Annual Plan';
  } else if (userType === 'employer') {
    if (plan === 'Basic') return 'Employer Basic Plan';
    if (plan === 'Pro') return 'Employer Pro Plan';
    if (plan === 'Enterprise') return 'Employer Enterprise Plan';
  }
  return `${userType} ${plan} Plan`;
}

// Helper function to get product description
function getProductDescription(userType: string, plan: string): string {
  if (userType === 'jobSeeker') {
    if (plan === 'Monthly') return 'Access to premium job listings for 1 month';
    if (plan === 'Quarterly') return 'Access to premium job listings for 3 months';
    if (plan === 'Annual') return 'Access to premium job listings for 1 year';
  } else if (userType === 'employer') {
    if (plan === 'Basic') return 'Post up to 5 job listings';
    if (plan === 'Pro') return 'Post up to 15 job listings with enhanced visibility';
    if (plan === 'Enterprise') return 'Unlimited job postings with premium features';
  }
  return `${userType} subscription plan - ${plan}`;
}

// Helper function to get product interval
function getProductInterval(plan: string): string | null {
  if (plan === 'Monthly') return 'month';
  if (plan === 'Quarterly') return 'month'; // Still monthly billing for quarterly plan
  if (plan === 'Annual') return 'year';
  // For employer plans, we're assuming monthly billing
  return 'month';
}

// Helper function to calculate price based on plan and billing frequency
function calculatePrice(userType: string, plan: string, annual: boolean): number {
  if (userType === 'jobSeeker') {
    if (plan === 'Monthly') return annual ? 8 : 10;
    if (plan === 'Quarterly') return annual ? 20 : 25;
    if (plan === 'Annual') return annual ? 72 : 90;
  } else if (userType === 'employer') {
    if (plan === 'Basic') return annual ? 40 : 50;
    if (plan === 'Pro') return annual ? 80 : 100;
    if (plan === 'Enterprise') return annual ? 160 : 200;
  }
  return 0;
}
