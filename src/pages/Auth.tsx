
import Auth from "@/components/Auth";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/components/AuthProvider";
import { useEffect, useState } from "react";

export default function AuthPage() {
  const { user, isLoading } = useAuth();
  const location = useLocation();
  const [selectedRole, setSelectedRole] = useState('candidate');
  const [selectedProvider, setSelectedProvider] = useState<string | null>(null);
  
  useEffect(() => {
    // Parse URL parameters
    const params = new URLSearchParams(location.search);
    const role = params.get('role');
    const provider = params.get('provider');
    
    if (role && ['candidate', 'employer', 'admin'].includes(role)) {
      setSelectedRole(role);
    }
    
    if (provider) {
      setSelectedProvider(provider);
    }
  }, [location]);
  
  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }
  
  // Redirect if already authenticated
  if (user) {
    const role = user.user_metadata?.role;
    if (role === 'admin') return <Navigate to="/admin" replace />;
    if (role === 'employer') return <Navigate to="/employer" replace />;
    if (role === 'candidate') return <Navigate to="/candidate" replace />;
    return <Navigate to="/" replace />;
  }
  
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow">
        <Auth initialRole={selectedRole} initialProvider={selectedProvider} />
      </main>
      <Footer />
    </div>
  );
}
