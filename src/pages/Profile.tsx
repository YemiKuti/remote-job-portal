
import React, { useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { useAuth } from "@/components/AuthProvider";
import { useSupabaseClient, useSubscription, useManageSubscription } from "@/hooks/useSupabase";
import { Label } from "@/components/ui/label";
import { CalendarDays, CreditCard, Loader2 } from "lucide-react";
import { format } from "date-fns";

const Profile = () => {
  const { user, signOut } = useAuth();
  const supabase = useSupabaseClient();
  const { subscribed, subscription_tier, subscription_end, loading, error, checkSubscription } = useSubscription();
  const { openCustomerPortal, isLoading: isPortalLoading } = useManageSubscription();
  
  const [fullName, setFullName] = useState(user?.user_metadata.full_name || '');
  const [isUpdating, setIsUpdating] = useState(false);
  
  const handleUpdateProfile = async () => {
    setIsUpdating(true);
    
    try {
      const { error } = await supabase.auth.updateUser({
        data: { full_name: fullName }
      });
      
      if (error) throw error;
      
      toast.success("Profile updated successfully");
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("Failed to update profile", {
        description: "Please try again later"
      });
    } finally {
      setIsUpdating(false);
    }
  };
  
  const handleSignOut = async () => {
    try {
      await signOut();
      toast.success("You have been signed out");
    } catch (error) {
      console.error("Error signing out:", error);
      toast.error("Failed to sign out");
    }
  };
  
  // Format subscription end date
  const formattedEndDate = subscription_end 
    ? format(new Date(subscription_end), "MMMM d, yyyy")
    : null;
  
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-grow py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <h1 className="text-3xl font-bold mb-8">Account Settings</h1>
            
            <Tabs defaultValue="profile">
              <TabsList className="mb-8">
                <TabsTrigger value="profile">Profile</TabsTrigger>
                <TabsTrigger value="subscription">Subscription</TabsTrigger>
              </TabsList>
              
              <TabsContent value="profile">
                <Card>
                  <CardHeader>
                    <CardTitle>Profile Information</CardTitle>
                    <CardDescription>Update your personal information</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="flex items-center space-x-4">
                      <Avatar className="h-20 w-20">
                        <AvatarImage src={user?.user_metadata.avatar_url || ""} />
                        <AvatarFallback>{user?.email?.[0].toUpperCase() || "U"}</AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="font-medium">{fullName || user?.email}</h3>
                        <p className="text-sm text-gray-500">{user?.email}</p>
                      </div>
                    </div>
                    
                    <div className="space-y-1">
                      <Label htmlFor="fullName">Full Name</Label>
                      <Input 
                        id="fullName" 
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="Full Name"
                      />
                    </div>
                    
                    <div className="space-y-1">
                      <Label htmlFor="email">Email</Label>
                      <Input 
                        id="email" 
                        value={user?.email || ""}
                        disabled
                      />
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-between">
                    <Button variant="outline" onClick={handleSignOut}>
                      Sign Out
                    </Button>
                    <Button onClick={handleUpdateProfile} disabled={isUpdating}>
                      {isUpdating ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Updating...
                        </>
                      ) : "Save Changes"}
                    </Button>
                  </CardFooter>
                </Card>
              </TabsContent>
              
              <TabsContent value="subscription">
                <Card>
                  <CardHeader>
                    <CardTitle>Subscription Details</CardTitle>
                    <CardDescription>
                      Manage your subscription and billing information
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {loading ? (
                      <div className="flex items-center justify-center py-6">
                        <Loader2 className="h-8 w-8 animate-spin text-job-green" />
                      </div>
                    ) : error ? (
                      <div className="text-center py-6">
                        <p className="text-red-500">Failed to load subscription details</p>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="mt-2"
                          onClick={() => checkSubscription()}
                        >
                          Retry
                        </Button>
                      </div>
                    ) : subscribed ? (
                      <div className="space-y-6">
                        <div className="flex items-start space-x-4">
                          <div className="bg-green-100 p-3 rounded-full">
                            <CreditCard className="h-6 w-6 text-green-600" />
                          </div>
                          <div>
                            <h3 className="font-medium">Active Subscription</h3>
                            <p className="text-sm text-green-600">
                              You are currently on the {subscription_tier} plan
                            </p>
                          </div>
                        </div>
                        
                        {formattedEndDate && (
                          <div className="flex items-start space-x-4">
                            <div className="bg-blue-100 p-3 rounded-full">
                              <CalendarDays className="h-6 w-6 text-blue-600" />
                            </div>
                            <div>
                              <h3 className="font-medium">Next Billing Date</h3>
                              <p className="text-sm text-gray-600">
                                Your subscription will renew on {formattedEndDate}
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="text-center py-6">
                        <p className="mb-4">You don't have an active subscription</p>
                        <Button asChild>
                          <a href="/pricing">View Plans</a>
                        </Button>
                      </div>
                    )}
                  </CardContent>
                  {subscribed && (
                    <CardFooter>
                      <Button 
                        className="w-full" 
                        variant="outline"
                        onClick={openCustomerPortal}
                        disabled={isPortalLoading}
                      >
                        {isPortalLoading ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Loading...
                          </>
                        ) : "Manage Subscription"}
                      </Button>
                    </CardFooter>
                  )}
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Profile;
