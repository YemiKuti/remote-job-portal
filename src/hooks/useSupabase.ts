
import { createClient } from '@supabase/supabase-js';
import { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';

// Export the pre-configured supabase client from our integrations folder
export const useSupabaseClient = () => {
  return supabase;
};

type SubscriptionState = {
  subscribed: boolean;
  subscription_tier: string | null;
  subscription_end: string | null;
  loading: boolean;
  error: string | null;
};

// Utility function for exponential backoff
const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const checkSubscriptionWithRetry = async (maxRetries = 3) => {
  let lastError: any = null;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`🔄 Subscription check attempt ${attempt}/${maxRetries}`);
      
      const { data, error } = await supabase.functions.invoke('check-subscription');
      
      if (error) {
        // If it's a rate limit error, wait longer before retrying
        if (error.message?.includes('rate limit') || error.message?.includes('429')) {
          const backoffTime = Math.min(1000 * Math.pow(2, attempt), 10000); // Max 10 seconds
          console.log(`⏳ Rate limited, waiting ${backoffTime}ms before retry`);
          await wait(backoffTime);
          lastError = error;
          continue;
        }
        throw error;
      }
      
      console.log(`✅ Subscription check successful on attempt ${attempt}`);
      return data;
    } catch (error) {
      console.error(`❌ Subscription check attempt ${attempt} failed:`, error);
      lastError = error;
      
      if (attempt < maxRetries) {
        const backoffTime = Math.min(1000 * Math.pow(2, attempt - 1), 5000); // Max 5 seconds for general errors
        await wait(backoffTime);
      }
    }
  }
  
  throw lastError;
};

export const useSubscription = () => {
  const [subscription, setSubscription] = useState<SubscriptionState>({
    subscribed: false,
    subscription_tier: null,
    subscription_end: null,
    loading: true,
    error: null
  });

  const checkSubscription = async () => {
    setSubscription(prev => ({
      ...prev,
      loading: true,
      error: null
    }));
    
    try {
      const data = await checkSubscriptionWithRetry();
      
      setSubscription({
        subscribed: data?.subscribed || false,
        subscription_tier: data?.subscription_tier || null,
        subscription_end: data?.subscription_end || null,
        loading: false,
        error: null
      });
      
      return data;
    } catch (error) {
      console.error("Final error checking subscription:", error);
      let errorMessage = "Failed to check subscription status";
      
      if (error?.message?.includes('rate limit')) {
        errorMessage = "Too many requests. Please wait a moment and try again.";
      } else if (error?.message) {
        errorMessage = error.message;
      }
      
      setSubscription(prev => ({
        ...prev,
        loading: false,
        error: errorMessage
      }));
      return null;
    }
  };
  
  // Check subscription status when component mounts
  useEffect(() => {
    let mounted = true;
    
    // Only run if user is authenticated
    supabase.auth.getSession().then(({ data }) => {
      if (data.session && mounted) {
        // Add a small delay to avoid immediate rate limiting
        setTimeout(() => {
          if (mounted) {
            checkSubscription();
          }
        }, 500);
      } else if (mounted) {
        setSubscription(prev => ({ ...prev, loading: false }));
      }
    });
    
    return () => {
      mounted = false;
    };
  }, []);
  
  return {
    ...subscription,
    checkSubscription
  };
};

export const useManageSubscription = () => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
  const openCustomerPortal = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const { data, error } = await supabase.functions.invoke('customer-portal');
      
      if (error) throw error;
      
      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error("No portal URL returned");
      }
    } catch (error) {
      console.error("Error opening customer portal:", error);
      setError("Failed to open customer portal");
      setIsLoading(false);
    }
  };
  
  return { openCustomerPortal, isLoading, error };
};
