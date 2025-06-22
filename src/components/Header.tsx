
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Menu, X } from 'lucide-react';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <header className="border-b bg-white">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center">
            <img 
              src="/lovable-uploads/fc987f83-1bf7-4f42-8dfe-79ed6de6927d.png" 
              alt="AfricanTechJobs" 
              className="h-8 w-auto"
            />
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            <Link to="/jobs" className="text-gray-700 hover:text-job-green transition-colors">
              Browse Jobs
            </Link>
            <Link to="/pricing" className="text-gray-700 hover:text-job-green transition-colors">
              Pricing
            </Link>
            <Link to="/blog" className="text-gray-700 hover:text-job-green transition-colors">
              Blog
            </Link>
            <Link to="/faq" className="text-gray-700 hover:text-job-green transition-colors">
              FAQ
            </Link>
          </nav>

          {/* Desktop Auth Buttons */}
          <div className="hidden md:flex items-center space-x-4">
            <Button 
              variant="outline" 
              onClick={() => navigate('/signin')}
              className="border-job-green text-job-green hover:bg-job-green hover:text-white"
            >
              Sign In
            </Button>
            <Button 
              onClick={() => navigate('/signup')}
              className="bg-job-green hover:bg-job-darkGreen text-white"
            >
              Sign Up
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden"
            onClick={toggleMenu}
            aria-label="Toggle menu"
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <nav className="md:hidden mt-4 pb-4 border-t pt-4">
            <div className="flex flex-col space-y-4">
              <Link 
                to="/jobs" 
                className="text-gray-700 hover:text-job-green transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Browse Jobs
              </Link>
              <Link 
                to="/pricing" 
                className="text-gray-700 hover:text-job-green transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Pricing
              </Link>
              <Link 
                to="/blog" 
                className="text-gray-700 hover:text-job-green transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Blog
              </Link>
              <Link 
                to="/faq" 
                className="text-gray-700 hover:text-job-green transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                FAQ
              </Link>
              <div className="flex flex-col space-y-2 pt-4 border-t">
                <Button 
                  variant="outline" 
                  onClick={() => {
                    navigate('/signin');
                    setIsMenuOpen(false);
                  }}
                  className="border-job-green text-job-green hover:bg-job-green hover:text-white"
                >
                  Sign In
                </Button>
                <Button 
                  onClick={() => {
                    navigate('/signup');
                    setIsMenuOpen(false);
                  }}
                  className="bg-job-green hover:bg-job-darkGreen text-white"
                >
                  Sign Up
                </Button>
              </div>
            </div>
          </nav>
        )}
      </div>
    </header>
  );
};

export default Header;
