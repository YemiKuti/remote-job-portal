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
    let customerCurrency = 'gbp'; // Default to GBP
    const customers = await stripe.customers.list({ email: user.email, limit: 1 });
    
    if (customers.data.length > 0) {
      customerId = customers.data[0].id;
      logStep("Found existing customer", { customerId });
      
      // Check existing subscriptions to determine currency
      const subscriptions = await stripe.subscriptions.list({
        customer: customerId,
        limit: 1
      });
      
      if (subscriptions.data.length > 0) {
        const existingSub = subscriptions.data[0];
        customerCurrency = existingSub.items.data[0].price.currency;
        logStep("Found existing subscription currency", { customerCurrency });
      }
    } else {
      const newCustomer = await stripe.customers.create({
        email: user.email,
        metadata: { userId: user.id }
      });
      customerId = newCustomer.id;
      logStep("Created new customer", { customerId });
    }

    // Create product details with consistent currency
    const productName = getProductName(userType, plan);
    const productDescription = getProductDescription(userType, plan);
    const productInterval = getProductInterval(plan, userType);
    const productPrice = calculatePrice(userType, plan, annual);

    logStep("Creating checkout session with", { 
      productName, 
      productDescription, 
      productInterval, 
      productPrice,
      annual,
      currency: customerCurrency
    });

    // Create Stripe checkout session with consistent currency
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ["card"],
      line_items: [{
        price_data: {
          currency: customerCurrency,
          product_data: {
            name: productName,
            description: productDescription,
          },
          unit_amount: Math.round(convertCurrency(productPrice, 'gbp', customerCurrency) * 100), // Convert to customer's currency
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

// Helper function to convert currency (simplified conversion for demo)
function convertCurrency(amount: number, fromCurrency: string, toCurrency: string): number {
  // Simple conversion rates - in production, use a real currency API
  const rates: { [key: string]: number } = {
    'gbp': 1,
    'usd': 1.27,
    'eur': 1.17
  };
  
  if (fromCurrency === toCurrency) return amount;
  
  // Convert to GBP first, then to target currency
  const gbpAmount = amount / rates[fromCurrency.toLowerCase()];
  return gbpAmount * rates[toCurrency.toLowerCase()];
}

// Helper function to get product name
function getProductName(userType: string, plan: string): string {
  if (userType === 'jobSeeker') {
    if (plan === 'Monthly') return 'Job Seeker Monthly Plan';
    if (plan === 'Quarterly') return 'Job Seeker Quarterly Plan';
    if (plan === 'Annual') return 'Job Seeker Annual Plan';
  } else if (userType === 'employer') {
    if (plan === 'Single') return 'Single Job Posting';
    if (plan === 'Package5') return '5 Jobs Package';
    if (plan === 'Package10') return '10 Jobs Package';
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
    if (plan === 'Single') return 'Post 1 job listing for 30 days';
    if (plan === 'Package5') return 'Post 5 job listings with enhanced features';
    if (plan === 'Package10') return 'Post 10 job listings with premium features';
  }
  return `${userType} subscription plan - ${plan}`;
}

// Helper function to get product interval
function getProductInterval(plan: string, userType: string): string | null {
  if (userType === 'jobSeeker') {
    if (plan === 'Monthly') return 'month';
    if (plan === 'Quarterly') return 'month';
    if (plan === 'Annual') return 'year';
  }
  // Employer packages are one-time payments
  return null;
}

// Helper function to calculate price based on plan and billing frequency
function calculatePrice(userType: string, plan: string, annual: boolean): number {
  if (userType === 'jobSeeker') {
    if (plan === 'Monthly') return annual ? 8 : 10;
    if (plan === 'Quarterly') return annual ? 20 : 25;
    if (plan === 'Annual') return annual ? 72 : 90;
  } else if (userType === 'employer') {
    if (plan === 'Single') return 20;
    if (plan === 'Package5') return 70;
    if (plan === 'Package10') return 150;
  }
  return 0;
}
