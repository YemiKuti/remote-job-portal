
import React from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ShieldCheck } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useToast } from "@/components/ui/use-toast";

const AdminSignIn = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleAdminSignIn = () => {
    // For now, this directly navigates to the admin dashboard
    // In a real application, this would authenticate the user first
    toast({
      title: "Admin access",
      description: "Proceeding to admin dashboard...",
    });
    navigate("/admin");
  };

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1 bg-gray-50">
        <div className="container mx-auto py-12 px-4 md:px-6">
          <div className="max-w-md mx-auto">
            <Card>
              <CardHeader className="text-center">
                <CardTitle className="text-2xl font-bold">Admin Access</CardTitle>
                <CardDescription>
                  Sign in to access the administrator portal
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4">
                  <Button 
                    onClick={handleAdminSignIn} 
                    className="bg-gray-800 hover:bg-gray-900 h-16"
                  >
                    <ShieldCheck className="mr-2" /> Continue as Administrator
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default AdminSignIn;
