
import React from "react";
import { Link } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Auth from "@/components/Auth";

const SignUp = () => {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1 bg-gray-50">
        <div className="container mx-auto py-12 px-4 md:px-6">
          <div className="max-w-md mx-auto">
            <div className="text-center mb-6">
              <h1 className="text-3xl font-bold">Create Your Account</h1>
              <p className="text-gray-600 mt-2">
                Join AfricanTechJobs and start your career journey
              </p>
              <p className="text-sm text-gray-500 mt-4">
                Already have an account?{" "}
                <Link to="/signin" className="text-blue-600 hover:underline">
                  Sign in here
                </Link>
              </p>
            </div>
            <Auth initialTab="signup" />
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default SignUp;
