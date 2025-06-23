import { useState, useEffect } from "react";
import SearchBar from "@/components/SearchBar";
import JobCard from "@/components/JobCard";
import AdvancedFilters from "@/components/AdvancedFilters";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import HeroSection from "@/components/HeroSection";
import FeaturedCompanies from "@/components/FeaturedCompanies";
import Testimonials from "@/components/Testimonials";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { SearchFilters, Job } from "@/types";
import { toast } from "sonner";
import { Link, useNavigate } from "react-router-dom";
import { useSubscription } from "@/hooks/useSupabase";
import { useActiveJobs } from "@/hooks/useActiveJobs";
import { useAuth } from "@/components/AuthProvider";
import { Crown, ArrowRight } from "lucide-react";

const MAX_JOBS_DEFAULT = 7; // Changed from 3 to 7
const MAX_JOBS_SEARCH = 7; // Changed from 3 to 7

const Index = () => {
  const { jobs: allJobs, loading, error } = useActiveJobs();
  const [filteredJobs, setFilteredJobs] = useState<Job[]>([]);
  const [isFiltering, setIsFiltering] = useState(false);
  const [isAdvancedFiltersOpen, setIsAdvancedFiltersOpen] = useState(false);
  const { subscribed, loading: subscriptionLoading } = useSubscription();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  useEffect(() => {
    if (!loading && allJobs.length > 0) {
      const sortedJobs = [...allJobs].sort((a, b) => 
        new Date(b.postedDate).getTime() - new Date(a.postedDate).getTime()
      );
      
      // If user is subscribed, show all jobs, otherwise limit to MAX_JOBS_DEFAULT (now 7)
      setFilteredJobs(subscribed ? sortedJobs : sortedJobs.slice(0, MAX_JOBS_DEFAULT));
    }
  }, [allJobs, subscribed, loading]);

  const handleSearch = (query: string) => {
    if (!query.trim()) {
      const sortedJobs = [...allJobs].sort((a, b) => 
        new Date(b.postedDate).getTime() - new Date(a.postedDate).getTime()
      );
      setFilteredJobs(subscribed ? sortedJobs : sortedJobs.slice(0, MAX_JOBS_DEFAULT));
      setIsFiltering(false);
      return;
    }

    setIsFiltering(true);
    const searchTerms = query.toLowerCase().split(' ');
    
    const searchResults = allJobs.filter(job => {
      const jobText = `${job.title} ${job.company} ${job.description} ${job.techStack.join(' ')}`.toLowerCase();
      return searchTerms.every(term => jobText.includes(term));
    });

    const sortedResults = [...searchResults].sort((a, b) => 
      new Date(b.postedDate).getTime() - new Date(a.postedDate).getTime()
    );

    setFilteredJobs(subscribed ? sortedResults : sortedResults.slice(0, MAX_JOBS_SEARCH));
    
    if (searchResults.length === 0) {
      toast.info("No jobs found matching your search.");
    } else if (!subscribed && searchResults.length > MAX_JOBS_SEARCH) {
      toast.info(`Showing ${MAX_JOBS_SEARCH} of ${searchResults.length} matching jobs. Subscribe to see more.`);
    }
  };

  const handleAdvancedSearch = (filters: SearchFilters) => {
    setIsFiltering(true);
    
    const filteredResults = allJobs.filter(job => {
      if (filters.query && !`${job.title} ${job.company} ${job.description}`.toLowerCase().includes(filters.query.toLowerCase())) {
        return false;
      }
      
      if (filters.location && filters.location !== "any-location" && !job.location.toLowerCase().includes(filters.location.toLowerCase())) {
        return false;
      }
      
      // Skip experience level filter if "all-levels" is selected
      if (filters.experienceLevel && filters.experienceLevel !== "all-levels" && job.experienceLevel !== filters.experienceLevel) {
        return false;
      }
      
      // Skip company size filter if "all-sizes" is selected
      if (filters.companySize && filters.companySize !== "all-sizes" && job.companySize !== filters.companySize) {
        return false;
      }
      
      // Skip employment type filter if "all-types" is selected
      if (filters.employmentType && filters.employmentType !== "all-types" && job.employmentType !== filters.employmentType) {
        return false;
      }
      
      if (filters.techStack.length > 0 && !filters.techStack.some(tech => job.techStack.includes(tech))) {
        return false;
      }
      
      if (filters.minSalary !== null && job.salary.min < filters.minSalary) {
        return false;
      }
      
      if (filters.hideKeywords.length > 0) {
        const jobText = `${job.title} ${job.company} ${job.description} ${job.techStack.join(' ')}`.toLowerCase();
        if (filters.hideKeywords.some(keyword => jobText.includes(keyword.toLowerCase()))) {
          return false;
        }
      }
      
      return true;
    });

    const sortedResults = [...filteredResults].sort((a, b) => 
      new Date(b.postedDate).getTime() - new Date(a.postedDate).getTime()
    );
    
    setFilteredJobs(subscribed ? sortedResults : sortedResults.slice(0, MAX_JOBS_SEARCH));
    
    if (filteredResults.length === 0) {
      toast.info("No jobs found matching your filters.");
    } else if (!subscribed && filteredResults.length > MAX_JOBS_SEARCH) {
      toast.info(`Showing ${MAX_JOBS_SEARCH} of ${filteredResults.length} matching jobs. Subscribe to see more.`);
    }
  };

  const clearFilters = () => {
    const sortedJobs = [...allJobs].sort((a, b) => 
      new Date(b.postedDate).getTime() - new Date(a.postedDate).getTime()
    );
    setFilteredJobs(subscribed ? sortedJobs : sortedJobs.slice(0, MAX_JOBS_DEFAULT));
    setIsFiltering(false);
  };

  const handleSubscribeClick = () => {
    navigate('/pricing');
  };

  // Determine if we should show the subscription prompt
  const shouldLimitJobs = !subscribed && !subscriptionLoading;
  const hasMoreJobs = shouldLimitJobs && allJobs.length > MAX_JOBS_DEFAULT;

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        
        <main className="flex-grow">
          <HeroSection />
          
          <div className="bg-white py-8 shadow-md">
            <div className="container mx-auto px-4">
              <div className="flex justify-center">
                <SearchBar 
                  onSearch={handleSearch} 
                  onAdvancedSearch={() => setIsAdvancedFiltersOpen(true)} 
                />
              </div>
            </div>
          </div>
          
          <div className="container mx-auto px-4 py-12">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                <h2 className="text-2xl font-semibold mb-8">Loading Jobs...</h2>
                <div className="space-y-6">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="animate-pulse">
                      <div className="h-32 bg-gray-200 rounded"></div>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="lg:col-span-1">
                <FeaturedCompanies />
              </div>
            </div>
          </div>
          
          <Testimonials />
        </main>
        
        <Footer />
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        
        <main className="flex-grow">
          <HeroSection />
          
          <div className="bg-white py-8 shadow-md">
            <div className="container mx-auto px-4">
              <div className="flex justify-center">
                <SearchBar 
                  onSearch={handleSearch} 
                  onAdvancedSearch={() => setIsAdvancedFiltersOpen(true)} 
                />
              </div>
            </div>
          </div>
          
          <div className="container mx-auto px-4 py-12">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                <div className="text-center py-16">
                  <h3 className="text-xl font-medium text-gray-800 mb-2">Unable to load jobs</h3>
                  <p className="text-gray-600 mb-6">{error}</p>
                  <Button onClick={() => window.location.reload()}>
                    Retry
                  </Button>
                </div>
              </div>
              
              <div className="lg:col-span-1">
                <FeaturedCompanies />
              </div>
            </div>
          </div>
          
          <Testimonials />
        </main>
        
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-grow">
        <HeroSection />
        
        <div className="bg-white py-8 shadow-md">
          <div className="container mx-auto px-4">
            <div className="flex justify-center">
              <SearchBar 
                onSearch={handleSearch} 
                onAdvancedSearch={() => setIsAdvancedFiltersOpen(true)} 
              />
            </div>
          </div>
        </div>
        
        <div className="container mx-auto px-4 py-12">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-2xl font-semibold">
                  {isFiltering ? "Search Results" : "Latest Jobs"}
                </h2>
                {isFiltering && (
                  <Button 
                    variant="outline" 
                    onClick={clearFilters}
                  >
                    Clear Filters
                  </Button>
                )}
              </div>
              
              {filteredJobs.length > 0 ? (
                <div className="space-y-6">
                  <div className="space-y-6">
                    {filteredJobs.map((job) => (
                      <JobCard key={job.id} job={job} />
                    ))}
                  </div>

                  {/* Subscribe to see more jobs section */}
                  <Card className="border-2 border-dashed border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10">
                    <CardContent className="text-center py-8">
                      <div className="mx-auto mb-4 w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                        <Crown className="w-8 h-8 text-primary" />
                      </div>
                      
                      {hasMoreJobs ? (
                        <>
                          <h3 className="text-xl font-semibold text-gray-900 mb-2">
                            Want to see more jobs?
                          </h3>
                          <p className="text-gray-600 mb-6 max-w-md mx-auto">
                            You're viewing {MAX_JOBS_DEFAULT} of {allJobs.length} available jobs. 
                            Subscribe to unlock all job listings and premium features.
                          </p>
                        </>
                      ) : (
                        <>
                          <h3 className="text-xl font-semibold text-gray-900 mb-2">
                            Get Premium Access
                          </h3>
                          <p className="text-gray-600 mb-6 max-w-md mx-auto">
                            Subscribe to unlock premium features, job alerts, and enhanced search capabilities to find your perfect job faster.
                          </p>
                        </>
                      )}
                      
                      <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
                        <Button 
                          onClick={handleSubscribeClick}
                          className="bg-primary hover:bg-primary/90 text-white px-6 py-2"
                        >
                          Subscribe Now
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                        {!user && (
                          <Button 
                            variant="outline"
                            onClick={() => navigate('/signin')}
                          >
                            Sign In to Continue
                          </Button>
                        )}
                      </div>
                      <p className="text-xs text-gray-500 mt-4">
                        Join thousands of professionals finding their dream jobs
                      </p>
                    </CardContent>
                  </Card>
                </div>
              ) : (
                <div className="text-center py-16">
                  <h3 className="text-xl font-medium text-gray-800 mb-2">No jobs found</h3>
                  <p className="text-gray-600 mb-6">
                    {isFiltering 
                      ? "Try adjusting your search criteria" 
                      : "No jobs are currently available"}
                  </p>
                  {isFiltering && (
                    <Button onClick={clearFilters}>
                      View All Jobs
                    </Button>
                  )}
                </div>
              )}
            </div>
            
            <div className="lg:col-span-1">
              <FeaturedCompanies />
            </div>
          </div>
        </div>
        
        <Testimonials />
      </main>
      
      <Footer />
      
      <AdvancedFilters 
        isOpen={isAdvancedFiltersOpen} 
        onClose={() => setIsAdvancedFiltersOpen(false)} 
        onApplyFilters={handleAdvancedSearch}
      />
    </div>
  );
};

export default Index;
