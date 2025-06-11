
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/components/AuthProvider';
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
import { Filter, X, Briefcase, MapPin, Building } from 'lucide-react';
import { jobs } from '@/data/jobs';
import { Job } from '@/types';

const JobsBrowse = () => {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filteredJobs, setFilteredJobs] = useState<Job[]>(jobs);
  const [activeFilters, setActiveFilters] = useState<any>({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate loading time
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    let filtered = jobs;

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
  }, [searchQuery, activeFilters]);

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

  if (isLoading) {
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
                {filteredJobs.length} Job{filteredJobs.length !== 1 ? 's' : ''} Found
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
          {filteredJobs.length > 0 ? (
            <div className="grid gap-4">
              {filteredJobs.map((job) => (
                <JobCard key={job.id} job={job} />
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="text-center py-12">
                <Briefcase className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No jobs found</h3>
                <p className="text-muted-foreground mb-4">
                  Try adjusting your search criteria or browse all available positions.
                </p>
                <Button onClick={clearAllFilters}>
                  Clear Filters
                </Button>
              </CardContent>
            </Card>
          )}

          {/* User-specific messaging */}
          {user && user.user_metadata?.role === 'candidate' && (
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
