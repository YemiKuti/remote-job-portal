
import { useState, useEffect } from "react";
import { jobs } from "@/data/jobs";
import SearchBar from "@/components/SearchBar";
import JobCard from "@/components/JobCard";
import AdvancedFilters from "@/components/AdvancedFilters";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { SearchFilters, Job } from "@/types";
import { toast } from "sonner";
import { Link } from "react-router-dom";

const MAX_JOBS_DEFAULT = 5;
const MAX_JOBS_SEARCH = 3;

const Index = () => {
  const [filteredJobs, setFilteredJobs] = useState<Job[]>([]);
  const [isFiltering, setIsFiltering] = useState(false);
  const [isAdvancedFiltersOpen, setIsAdvancedFiltersOpen] = useState(false);
  
  // Sort jobs by posted date (newest first) and limit to MAX_JOBS_DEFAULT
  useEffect(() => {
    const sortedJobs = [...jobs].sort((a, b) => 
      new Date(b.postedDate).getTime() - new Date(a.postedDate).getTime()
    );
    setFilteredJobs(sortedJobs.slice(0, MAX_JOBS_DEFAULT));
  }, []);

  const handleSearch = (query: string) => {
    if (!query.trim()) {
      // Reset to default view if search is empty
      const sortedJobs = [...jobs].sort((a, b) => 
        new Date(b.postedDate).getTime() - new Date(a.postedDate).getTime()
      );
      setFilteredJobs(sortedJobs.slice(0, MAX_JOBS_DEFAULT));
      setIsFiltering(false);
      return;
    }

    setIsFiltering(true);
    const searchTerms = query.toLowerCase().split(' ');
    
    const searchResults = jobs.filter(job => {
      const jobText = `${job.title} ${job.company} ${job.description} ${job.techStack.join(' ')}`.toLowerCase();
      return searchTerms.every(term => jobText.includes(term));
    });

    const sortedResults = [...searchResults].sort((a, b) => 
      new Date(b.postedDate).getTime() - new Date(a.postedDate).getTime()
    );

    setFilteredJobs(sortedResults.slice(0, MAX_JOBS_SEARCH));
    
    if (searchResults.length === 0) {
      toast.info("No jobs found matching your search.");
    } else if (searchResults.length > MAX_JOBS_SEARCH) {
      toast.info(`Showing ${MAX_JOBS_SEARCH} of ${searchResults.length} matching jobs. Subscribe to see more.`);
    }
  };

  const handleAdvancedSearch = (filters: SearchFilters) => {
    setIsFiltering(true);
    
    const filteredResults = jobs.filter(job => {
      // Filter by search query
      if (filters.query && !`${job.title} ${job.company} ${job.description}`.toLowerCase().includes(filters.query.toLowerCase())) {
        return false;
      }
      
      // Filter by location
      if (filters.location && !job.location.toLowerCase().includes(filters.location.toLowerCase())) {
        return false;
      }
      
      // Filter by experience level
      if (filters.experienceLevel && job.experienceLevel !== filters.experienceLevel) {
        return false;
      }
      
      // Filter by visa sponsorship
      if (filters.visaSponsorship !== null && job.visaSponsorship !== filters.visaSponsorship) {
        return false;
      }
      
      // Filter by company size
      if (filters.companySize && job.companySize !== filters.companySize) {
        return false;
      }
      
      // Filter by employment type
      if (filters.employmentType && job.employmentType !== filters.employmentType) {
        return false;
      }
      
      // Filter by tech stack
      if (filters.techStack.length > 0 && !filters.techStack.some(tech => job.techStack.includes(tech))) {
        return false;
      }
      
      // Filter by minimum salary
      if (filters.minSalary !== null && job.salary.min < filters.minSalary) {
        return false;
      }
      
      // Filter out jobs with hide keywords
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
    
    setFilteredJobs(sortedResults.slice(0, MAX_JOBS_SEARCH));
    
    if (filteredResults.length === 0) {
      toast.info("No jobs found matching your filters.");
    } else if (filteredResults.length > MAX_JOBS_SEARCH) {
      toast.info(`Showing ${MAX_JOBS_SEARCH} of ${filteredResults.length} matching jobs. Subscribe to see more.`);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-grow">
        <div className="bg-gradient-to-br from-job-blue to-job-lightBlue py-16">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6">
              Find Your Perfect Remote Job
            </h1>
            <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
              Discover remote opportunities from companies worldwide
            </p>
            <div className="flex justify-center">
              <SearchBar 
                onSearch={handleSearch} 
                onAdvancedSearch={() => setIsAdvancedFiltersOpen(true)} 
              />
            </div>
          </div>
        </div>
        
        <div className="container mx-auto px-4 py-12">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl font-semibold">
              {isFiltering ? "Search Results" : "Latest Remote Jobs"}
            </h2>
            {isFiltering && (
              <Button 
                variant="outline" 
                onClick={() => {
                  const sortedJobs = [...jobs].sort((a, b) => 
                    new Date(b.postedDate).getTime() - new Date(a.postedDate).getTime()
                  );
                  setFilteredJobs(sortedJobs.slice(0, MAX_JOBS_DEFAULT));
                  setIsFiltering(false);
                }}
              >
                Clear Filters
              </Button>
            )}
          </div>
          
          {filteredJobs.length > 0 ? (
            <div className="space-y-6">
              {filteredJobs.map((job) => (
                <JobCard key={job.id} job={job} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <h3 className="text-xl font-medium text-gray-800 mb-2">No jobs found</h3>
              <p className="text-gray-600 mb-6">Try adjusting your search criteria</p>
              <Button 
                onClick={() => {
                  const sortedJobs = [...jobs].sort((a, b) => 
                    new Date(b.postedDate).getTime() - new Date(a.postedDate).getTime()
                  );
                  setFilteredJobs(sortedJobs.slice(0, MAX_JOBS_DEFAULT));
                  setIsFiltering(false);
                }}
              >
                View All Jobs
              </Button>
            </div>
          )}
          
          {filteredJobs.length > 0 && (
            <div className="mt-10 text-center">
              <p className="mb-4 text-gray-600">
                {isFiltering 
                  ? "Want to see more search results?" 
                  : "Want to see more remote jobs?"}
              </p>
              <Button className="bg-job-blue hover:bg-job-darkBlue">
                <Link to="/pricing">Subscribe Now</Link>
              </Button>
            </div>
          )}
        </div>
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
