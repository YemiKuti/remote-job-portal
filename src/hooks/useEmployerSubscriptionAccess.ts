
import { useState, useEffect } from "react";
import { useAuth } from "@/components/AuthProvider";
import { supabase } from "@/integrations/supabase/client";
import { useSubscription } from "@/hooks/useSupabase";

export type EmployerSubscriptionTier = "Single" | "Package5" | "Package10" | null;

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

// Updated to reflect the new package system - these are now credits, not recurring limits
const PACKAGE_CREDITS: Record<Exclude<EmployerSubscriptionTier, null>, number> = {
  Single: 1,
  Package5: 5,
  Package10: 10,
};

export const useEmployerSubscriptionAccess = (): SubscriptionAccessResult => {
  const { user } = useAuth();
  const { subscribed, subscription_tier, loading: subLoading, error: subError, checkSubscription } = useSubscription();
  const [activePostsCount, setActivePostsCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Determine the current tier and available credits
  const tier = (subscription_tier as EmployerSubscriptionTier) || null;
  const availableCredits = tier ? PACKAGE_CREDITS[tier] : null; // null means unlimited for free users

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

  // For package-based system: 
  // - Free users (no tier) get unlimited posts
  // - Paid users can post if they have available credits from their package
  const canPost = !!user && (!tier || (availableCredits !== null && activePostsCount < availableCredits));

  return {
    loading: subLoading || loading,
    error: subError || error,
    hasActiveSubscription: !!subscribed,
    subscriptionTier: tier,
    postLimit: availableCredits,
    activePostsCount,
    canPost,
    refresh,
  };
};
