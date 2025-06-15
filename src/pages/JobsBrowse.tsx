import React, { useState, useEffect } from 'react';
import { useAuth } from '@/components/AuthProvider';
import { useSubscription } from '@/hooks/useSupabase';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import SearchBar from '@/components/SearchBar';
import JobCard from '@/components/JobCard';
import AdvancedFilters from '@/components/AdvancedFilters';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Filter, X, Briefcase, MapPin, Building, AlertCircle, Crown, ArrowRight } from 'lucide-react';
import { Job } from '@/types';
import { useActiveJobs } from '@/hooks/useActiveJobs';
import { useNavigate } from 'react-router-dom';

const JobsBrowse = () => {
  const { user } = useAuth();
  const { subscribed, loading: subscriptionLoading } = useSubscription();
  const { jobs: allJobs, loading, error, refetch } = useActiveJobs();
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filteredJobs, setFilteredJobs] = useState<Job[]>([]);
  const [activeFilters, setActiveFilters] = useState<any>({});
  const navigate = useNavigate();

  // Job limit for free users
  const FREE_JOB_LIMIT = 5;
  const shouldLimitJobs = !subscribed && !subscriptionLoading;
  const displayedJobs = shouldLimitJobs ? filteredJobs.slice(0, FREE_JOB_LIMIT) : filteredJobs;
  const hasMoreJobs = shouldLimitJobs && filteredJobs.length > FREE_JOB_LIMIT;

  // Debug logging
  console.log('JobsBrowse Debug:', {
    subscribed,
    subscriptionLoading,
    shouldLimitJobs,
    filteredJobsLength: filteredJobs.length,
    displayedJobsLength: displayedJobs.length,
    hasMoreJobs,
    FREE_JOB_LIMIT
  });

  useEffect(() => {
    let filtered = allJobs;

    // Apply search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(job =>
        job.title.toLowerCase().includes(query) ||
        job.company.toLowerCase().includes(query) ||
        job.location.toLowerCase().includes(query) ||
        job.techStack.some(tech => tech.toLowerCase().includes(query))
      );
    }

    // Apply other filters
    if (activeFilters.location && activeFilters.location.length > 0) {
      filtered = filtered.filter(job => activeFilters.location.includes(job.location));
    }

    if (activeFilters.employmentType && activeFilters.employmentType.length > 0) {
      filtered = filtered.filter(job => activeFilters.employmentType.includes(job.employmentType));
    }

    if (activeFilters.experienceLevel && activeFilters.experienceLevel.length > 0) {
      filtered = filtered.filter(job => activeFilters.experienceLevel.includes(job.experienceLevel));
    }

    if (activeFilters.techStack && activeFilters.techStack.length > 0) {
      filtered = filtered.filter(job =>
        job.techStack.some(tech => activeFilters.techStack.includes(tech))
      );
    }

    setFilteredJobs(filtered);
  }, [allJobs, searchQuery, activeFilters]);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const handleAdvancedSearch = () => {
    setShowFilters(!showFilters);
  };

  const handleFiltersApply = (filters: any) => {
    setActiveFilters(filters);
    setShowFilters(false);
  };

  const clearAllFilters = () => {
    setActiveFilters({});
    setSearchQuery('');
  };

  const getActiveFilterCount = () => {
    return Object.values(activeFilters).flat().length;
  };

  const handleSubscribeClick = () => {
    navigate('/pricing');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-grow container mx-auto px-4 py-8">
          <div className="space-y-6">
            <div className="animate-pulse space-y-4">
              <div className="h-8 bg-gray-200 rounded w-64"></div>
              <div className="h-12 bg-gray-200 rounded"></div>
              <div className="grid gap-4">
                {[1, 2, 3].map(i => (
                  <div key={i} className="h-32 bg-gray-200 rounded"></div>
                ))}
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="space-y-6">
          {/* Header */}
          <div className="text-center space-y-4">
            <h1 className="text-3xl md:text-4xl font-bold">Find Your Dream Job</h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Discover opportunities that match your skills and aspirations
            </p>
          </div>

          {/* Search Bar */}
          <div className="flex justify-center">
            <SearchBar
              onSearch={handleSearch}
              onAdvancedSearch={handleAdvancedSearch}
            />
          </div>

          {/* Error State */}
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="flex items-center justify-between">
                <span>{error}</span>
                <Button variant="outline" size="sm" onClick={refetch}>
                  Try Again
                </Button>
              </AlertDescription>
            </Alert>
          )}

          {/* Active Filters */}
          {getActiveFilterCount() > 0 && (
            <Card>
              <CardContent className="pt-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Active Filters:</span>
                  <Button variant="ghost" size="sm" onClick={clearAllFilters}>
                    <X className="h-4 w-4 mr-1" />
                    Clear All
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(activeFilters).map(([key, values]) => 
                    (values as string[]).map(value => (
                      <Badge key={`${key}-${value}`} variant="secondary">
                        {value}
                      </Badge>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Advanced Filters */}
          <AdvancedFilters
            isOpen={showFilters}
            onClose={() => setShowFilters(false)}
            onApplyFilters={handleFiltersApply}
          />

          {/* Results Summary */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <h2 className="text-xl font-semibold">
                {shouldLimitJobs && filteredJobs.length > FREE_JOB_LIMIT ? (
                  <>
                    {displayedJobs.length} of {filteredJobs.length} Job{filteredJobs.length !== 1 ? 's' : ''} 
                    <Badge variant="outline" className="ml-2">
                      <Crown className="h-3 w-3 mr-1" />
                      Free Preview
                    </Badge>
                  </>
                ) : (
                  <>
                    {filteredJobs.length} Job{filteredJobs.length !== 1 ? 's' : ''} Found
                  </>
                )}
              </h2>
              {searchQuery && (
                <span className="text-sm text-muted-foreground">
                  for "{searchQuery}"
                </span>
              )}
            </div>
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2"
            >
              <Filter className="h-4 w-4" />
              Filters
              {getActiveFilterCount() > 0 && (
                <Badge variant="secondary" className="ml-1">
                  {getActiveFilterCount()}
                </Badge>
              )}
            </Button>
          </div>

          <Separator />

          {/* Job Listings */}
          {displayedJobs.length > 0 ? (
            <div className="space-y-6">
              <div className="grid gap-4">
                {displayedJobs.map((job) => (
                  <JobCard key={job.id} job={job} />
                ))}
              </div>

              {/* Debug info for troubleshooting */}
              {process.env.NODE_ENV === 'development' && (
                <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-md text-sm">
                  <strong>Debug Info:</strong> hasMoreJobs: {hasMoreJobs.toString()}, 
                  shouldLimitJobs: {shouldLimitJobs.toString()}, 
                  filteredJobs: {filteredJobs.length}, 
                  subscribed: {subscribed ? 'true' : 'false'}
                </div>
              )}

              {/* Subscription Prompt - This should always show when hasMoreJobs is true */}
              {hasMoreJobs && (
                <Card className="border-2 border-dashed border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10">
                  <CardContent className="text-center py-8">
                    <div className="mx-auto mb-4 w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                      <Crown className="w-8 h-8 text-primary" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      Want to see more jobs?
                    </h3>
                    <p className="text-gray-600 mb-6 max-w-md mx-auto">
                      You're viewing {FREE_JOB_LIMIT} of {filteredJobs.length} available jobs. 
                      Subscribe to unlock all job listings and premium features.
                    </p>
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
              )}

              {/* Force show subscription prompt for testing if there are more than 5 jobs total */}
              {!hasMoreJobs && filteredJobs.length > FREE_JOB_LIMIT && (
                <Card className="border-2 border-orange-200 bg-orange-50">
                  <CardContent className="text-center py-4">
                    <p className="text-orange-800 text-sm">
                      <strong>Test Mode:</strong> You should see the subscription prompt above, but conditions aren't met. 
                      Subscribed: {subscribed ? 'Yes' : 'No'}, 
                      Jobs: {filteredJobs.length}
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          ) : !loading && (
            <Card>
              <CardContent className="text-center py-12">
                <Briefcase className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No jobs found</h3>
                <p className="text-muted-foreground mb-4">
                  {error 
                    ? "We're having trouble loading jobs right now." 
                    : "Try adjusting your search criteria or browse all available positions."
                  }
                </p>
                {error ? (
                  <Button onClick={refetch}>
                    Reload Jobs
                  </Button>
                ) : (
                  <Button onClick={clearAllFilters}>
                    Clear Filters
                  </Button>
                )}
              </CardContent>
            </Card>
          )}

          {/* User-specific messaging */}
          {user && user.user_metadata?.role === 'candidate' && subscribed && (
            <Alert>
              <Briefcase className="h-4 w-4" />
              <AlertDescription>
                💡 Tip: Save jobs you're interested in and track your applications from your dashboard.
              </AlertDescription>
            </Alert>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default JobsBrowse;
