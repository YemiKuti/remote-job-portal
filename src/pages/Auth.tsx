
import Auth from "@/components/Auth";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/components/AuthProvider";

export default function AuthPage() {
  const { user, isLoading } = useAuth();
  
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
        <Auth />
      </main>
      <Footer />
    </div>
  );
}
