
import React from "react";
import { useNavigate, Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { User, Building, ShieldCheck } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const SignIn = () => {
  const navigate = useNavigate();

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
                  Choose your role to access AfricanTechJobs
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4">
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
                </div>
              </CardContent>
              <CardFooter className="flex justify-center">
                <Link to="/admin-signin" className="text-sm text-gray-500 hover:text-gray-700">
                  Administrator Access
                </Link>
              </CardFooter>
            </Card>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default SignIn;
