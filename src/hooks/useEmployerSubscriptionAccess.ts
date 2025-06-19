
import { useState, useEffect } from "react";
import { useAuth } from "@/components/AuthProvider";
import { supabase } from "@/integrations/supabase/client";
import { useSubscription } from "@/hooks/useSupabase";

export type EmployerSubscriptionTier = "Basic" | "Pro" | "Enterprise" | null;

type SubscriptionAccessResult = {
  loading: boolean;
  error: string | null;
  hasActiveSubscription: boolean;
  subscriptionTier: EmployerSubscriptionTier;
  postLimit: number | null;
  activePostsCount: number;
  canPost: boolean;
  refresh: () => void;
};

const TIER_LIMITS: Record<Exclude<EmployerSubscriptionTier, null>, number | null> = {
  Basic: 5,
  Pro: 15,
  Enterprise: null,
};

export const useEmployerSubscriptionAccess = (): SubscriptionAccessResult => {
  const { user } = useAuth();
  const { subscribed, subscription_tier, loading: subLoading, error: subError, checkSubscription } = useSubscription();
  const [activePostsCount, setActivePostsCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Determine the current tier and post limit
  const tier = (subscription_tier as EmployerSubscriptionTier) || null;
  const postLimit = tier ? TIER_LIMITS[tier] : null; // Free tier now has unlimited posts

  const fetchActivePostCount = async () => {
    if (!user) return;
    setLoading(true);
    setError(null);
    try {
      const { count, error } = await supabase
        .from("jobs")
        .select("*", { count: "exact", head: true })
        .eq("employer_id", user.id)
        .in("status", ["active", "pending", "approved"]);
      if (error) throw error;
      setActivePostsCount(count || 0);
    } catch (e: any) {
      setError("Unable to load job posting data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!user || subLoading) return;
    fetchActivePostCount();
    // eslint-disable-next-line
  }, [user, subscribed, subscription_tier, subLoading]);

  const refresh = () => {
    checkSubscription();
    fetchActivePostCount();
  };

  // Allow posting if user is authenticated - no limits for free tier now
  const canPost = !!user && (postLimit === null || activePostsCount < postLimit);

  return {
    loading: subLoading || loading,
    error: subError || error,
    hasActiveSubscription: !!subscribed,
    subscriptionTier: tier,
    postLimit,
    activePostsCount,
    canPost,
    refresh,
  };
};
