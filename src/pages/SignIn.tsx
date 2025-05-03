
import React from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { User, Building, ShieldCheck } from "lucide-react";
import memberfulService from "@/services/memberful";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const SignIn = () => {
  const navigate = useNavigate();

  const handleMemberfulSignIn = () => {
    memberfulService.signIn();
  };

  const handleRoleSelection = (role: "candidate" | "employer" | "admin") => {
    // For now navigate directly to the respective dashboards
    // In a real application, this would first authenticate the user
    switch (role) {
      case "candidate":
        navigate("/candidate");
        break;
      case "employer":
        navigate("/employer");
        break;
      case "admin":
        navigate("/admin");
        break;
    }
  };

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1 bg-gray-50">
        <div className="container mx-auto py-12 px-4 md:px-6">
          <div className="max-w-md mx-auto">
            <Card>
              <CardHeader className="text-center">
                <CardTitle className="text-2xl font-bold">Sign In</CardTitle>
                <CardDescription>
                  Choose how you want to sign in to AfricanTechJobs
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4">
                  <Button 
                    onClick={handleMemberfulSignIn} 
                    variant="outline"
                    className="border-job-green text-job-green hover:bg-job-hover h-16"
                  >
                    Continue with Memberful
                  </Button>
                  
                  <div className="relative flex items-center py-2">
                    <div className="flex-grow border-t border-gray-300"></div>
                    <span className="flex-shrink mx-4 text-gray-400">or sign in as</span>
                    <div className="flex-grow border-t border-gray-300"></div>
                  </div>
                  
                  <Button 
                    onClick={() => handleRoleSelection("candidate")} 
                    className="bg-job-green hover:bg-job-darkGreen h-16"
                  >
                    <User className="mr-2" /> Candidate
                  </Button>
                  
                  <Button 
                    onClick={() => handleRoleSelection("employer")} 
                    className="bg-job-green hover:bg-job-darkGreen h-16"
                  >
                    <Building className="mr-2" /> Employer
                  </Button>
                  
                  <Button 
                    onClick={() => handleRoleSelection("admin")} 
                    className="bg-gray-800 hover:bg-gray-900 h-16"
                  >
                    <ShieldCheck className="mr-2" /> Administrator
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

export default SignIn;
