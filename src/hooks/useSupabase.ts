
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
      const { data, error } = await supabase.functions.invoke('check-subscription');
      
      if (error) throw error;
      
      setSubscription({
        subscribed: data.subscribed,
        subscription_tier: data.subscription_tier,
        subscription_end: data.subscription_end,
        loading: false,
        error: null
      });
      
      return data;
    } catch (error) {
      console.error("Error checking subscription:", error);
      setSubscription(prev => ({
        ...prev,
        loading: false,
        error: "Failed to check subscription status"
      }));
      return null;
    }
  };
  
  // Check subscription status when component mounts
  useEffect(() => {
    // Only run if user is authenticated
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) {
        checkSubscription();
      } else {
        setSubscription(prev => ({ ...prev, loading: false }));
      }
    });
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
