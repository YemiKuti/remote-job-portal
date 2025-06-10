
import Auth from "@/components/Auth";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/components/AuthProvider";
import { useEffect, useState } from "react";
import { ErrorBoundary } from "@/components/ErrorBoundary";

export default function AuthPage() {
  const { user, isLoading, authError } = useAuth();
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
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="space-y-4 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }
  
  // Show auth error if present
  if (authError) {
    console.error('🔐 Auth Page: Auth error detected:', authError);
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
    <ErrorBoundary>
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-grow">
          <Auth initialRole={selectedRole} initialProvider={selectedProvider} />
        </main>
        <Footer />
      </div>
    </ErrorBoundary>
  );
}
