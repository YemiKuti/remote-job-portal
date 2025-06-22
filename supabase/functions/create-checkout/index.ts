
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

    // Verify authentication - use service role for auth verification
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    );

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      logStep("No authorization header provided");
      return new Response(JSON.stringify({ error: "No authorization header" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 401,
      });
    }

    const token = authHeader.replace("Bearer ", "");
    logStep("Authenticating user with token");
    
    const { data, error } = await supabaseClient.auth.getUser(token);
    
    if (error || !data.user) {
      logStep("Authentication error", { error: error?.message });
      return new Response(JSON.stringify({ error: "Invalid or expired token. Please sign in again." }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 401,
      });
    }

    const user = data.user;
    logStep("User authenticated", { userId: user.id, email: user.email });

    // Verify we have a valid email
    if (!user.email) {
      logStep("No email found for user");
      return new Response(JSON.stringify({ error: "User email not found" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      });
    }

    // Initialize Stripe
    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) {
      logStep("Stripe secret key not configured");
      return new Response(JSON.stringify({ error: "Payment system not configured" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      });
    }

    const stripe = new Stripe(stripeKey, {
      apiVersion: "2023-10-16",
    });

    // Look up customer or create new one
    let customerId;
    try {
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
    } catch (stripeError) {
      logStep("Stripe customer error", { error: stripeError });
      return new Response(JSON.stringify({ error: "Failed to process customer information" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      });
    }

    // Create product if it doesn't exist
    const productName = getProductName(userType, plan);
    const productDescription = getProductDescription(userType, plan);
    const productInterval = getProductInterval(plan, userType);
    const productPrice = calculatePrice(userType, plan, annual);

    if (productPrice === 0) {
      logStep("Invalid product configuration", { userType, plan, annual });
      return new Response(JSON.stringify({ error: "Invalid plan configuration" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      });
    }

    logStep("Creating checkout session with", { 
      productName, 
      productDescription, 
      productInterval, 
      productPrice,
      annual
    });

    // Create Stripe checkout session
    const origin = req.headers.get("origin") || req.headers.get("referer")?.split('/').slice(0, 3).join('/') || "http://localhost:3000";
    
    try {
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
        success_url: `${origin}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${origin}/pricing`,
        metadata: {
          userId: user.id,
          plan: plan,
          userType: userType,
          annual: annual ? "true" : "false"
        }
      });

      logStep("Checkout session created", { sessionId: session.id, url: session.url });

      return new Response(JSON.stringify({ url: session.url }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    } catch (stripeError) {
      logStep("Stripe checkout error", { error: stripeError });
      return new Response(JSON.stringify({ error: "Failed to create checkout session" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      });
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("Unexpected error", { message: errorMessage, stack: error instanceof Error ? error.stack : undefined });
    return new Response(JSON.stringify({ error: "An unexpected error occurred" }), {
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
