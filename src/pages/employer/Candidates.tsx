import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Filter, Loader2, AlertCircle, User, ArrowLeft, Grid, List } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { EnhancedApplicationDetailModal } from '@/components/employer/EnhancedApplicationDetailModal';
import { ApplicationCard } from '@/components/employer/ApplicationCard';
import { fetchEmployerApplications, updateApplicationStatus } from '@/utils/api/employerApi';
import { useAuth } from '@/components/AuthProvider';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

const EmployerCandidates = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const jobId = searchParams.get('jobId');
  
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [sortBy, setSortBy] = useState('newest');
  const [viewMode, setViewMode] = useState('cards');
  
  useEffect(() => {
    const loadApplications = async () => {
      if (!user) return;
      
      setLoading(true);
      setError(null);
      try {
        const data = await fetchEmployerApplications(user.id);
        setApplications(data);
      } catch (err) {
        console.error('Error loading applications:', err);
        setError(err.message || 'Failed to load applications');
        toast.error('Failed to load applications');
      } finally {
        setLoading(false);
      }
    };
    
    loadApplications();
  }, [user]);
  
  const handleUpdateStatus = async (applicationId: string, newStatus: string, notes?: string) => {
    try {
      const success = await updateApplicationStatus(applicationId, newStatus);
      
      if (success) {
        setApplications(applications.map(app => 
          app.id === applicationId ? { ...app, status: newStatus } : app
        ));
        toast.success(`Application status updated to ${newStatus}`);
      }
    } catch (err) {
      console.error('Error updating application status:', err);
      setError('Failed to update application status');
      toast.error('Failed to update application status');
    }
  };

  const handleViewApplication = (application) => {
    setSelectedApplication(application);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedApplication(null);
  };
  
  const getCandidateDisplayName = (candidate) => {
    if (!candidate) return 'Unknown Candidate';
    return candidate.full_name || candidate.username || 'Candidate Profile Incomplete';
  };
  
  const getCandidateInitials = (candidate) => {
    if (!candidate) return 'U';
    const name = candidate.full_name || candidate.username;
    if (!name) return 'C';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };
  
  // Filter applications by job ID if specified
  const jobFilteredApplications = jobId 
    ? applications.filter(app => app.job?.id === jobId)
    : applications;
    
  // Get the job title for display when filtering by job
  const filteredJobTitle = jobId && jobFilteredApplications.length > 0 
    ? jobFilteredApplications[0].job?.title 
    : null;
  
  // Apply search and status filters
  const filteredApplications = jobFilteredApplications.filter(app => {
    const candidateName = getCandidateDisplayName(app.candidate);
    const matchesSearch = candidateName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          app.job?.title?.toLowerCase().includes(searchTerm.toLowerCase());
                          
    if (!matchesSearch) return false;
    
    if (activeTab === 'all') return true;
    return app.status === activeTab;
  });

  // Sort applications
  const sortedApplications = [...filteredApplications].sort((a, b) => {
    switch (sortBy) {
      case 'newest':
        return new Date(b.applied_date).getTime() - new Date(a.applied_date).getTime();
      case 'oldest':
        return new Date(a.applied_date).getTime() - new Date(b.applied_date).getTime();
      case 'name':
        return getCandidateDisplayName(a.candidate).localeCompare(getCandidateDisplayName(b.candidate));
      default:
        return 0;
    }
  });

  const renderApplicationTable = () => (
    <div className="relative overflow-x-auto rounded-md border">
      <table className="w-full text-sm text-left">
        <thead className="bg-gray-50 text-xs uppercase">
          <tr>
            <th scope="col" className="px-6 py-3">Candidate</th>
            <th scope="col" className="px-6 py-3">Position</th>
            <th scope="col" className="px-6 py-3">Applied Date</th>
            <th scope="col" className="px-6 py-3">Status</th>
            <th scope="col" className="px-6 py-3">Actions</th>
          </tr>
        </thead>
        <tbody>
          {sortedApplications.map(app => (
            <tr key={app.id} className="bg-white border-b">
              <td className="px-6 py-4 font-medium">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-medium">
                    {getCandidateInitials(app.candidate)}
                  </div>
                  <div>
                    <div className="font-medium">
                      {getCandidateDisplayName(app.candidate)}
                    </div>
                    {!app.candidate?.full_name && !app.candidate?.username && (
                      <div className="text-xs text-orange-600 flex items-center gap-1">
                        <User className="h-3 w-3" />
                        Profile needs completion
                      </div>
                    )}
                  </div>
                </div>
              </td>
              <td className="px-6 py-4">{app.job?.title || 'Position Unavailable'}</td>
              <td className="px-6 py-4">{new Date(app.applied_date).toLocaleDateString()}</td>
              <td className="px-6 py-4">
                <span className={`px-2 py-1 text-xs rounded-full ${
                  app.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                  app.status === 'reviewed' ? 'bg-blue-100 text-blue-800' : 
                  app.status === 'shortlisted' ? 'bg-green-100 text-green-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {app.status.charAt(0).toUpperCase() + app.status.slice(1)}
                </span>
              </td>
              <td className="px-6 py-4">
                <div className="flex space-x-2">
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => handleViewApplication(app)}
                  >
                    View
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => handleUpdateStatus(app.id, 'shortlisted')}
                    disabled={app.status === 'shortlisted'}
                  >
                    Shortlist
                  </Button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  const renderApplicationCards = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {sortedApplications.map(app => (
        <ApplicationCard
          key={app.id}
          application={app}
          onViewDetails={handleViewApplication}
          onUpdateStatus={handleUpdateStatus}
        />
      ))}
    </div>
  );

  return (
    <DashboardLayout userType="employer">
      <div className="space-y-6">
        <div>
          <div className="flex items-center gap-4">
            {jobId && (
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => navigate('/employer/jobs')}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Jobs
              </Button>
            )}
            <div>
              <h2 className="text-2xl font-bold tracking-tight">
                {jobId ? `Applicants for: ${filteredJobTitle || 'Job'}` : 'Candidates'}
              </h2>
              <p className="text-muted-foreground">
                {jobId 
                  ? 'View and manage applications for this specific job'
                  : 'View and manage candidate applications'
                }
              </p>
            </div>
          </div>
        </div>
        
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        {/* Enhanced Filters and Search */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center space-x-2 flex-1">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Search candidates or positions..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Newest First</SelectItem>
                <SelectItem value="oldest">Oldest First</SelectItem>
                <SelectItem value="name">By Name</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center border rounded-lg p-1">
              <Button
                variant={viewMode === 'cards' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('cards')}
                className="flex items-center gap-1"
              >
                <Grid className="h-4 w-4" />
                Cards
              </Button>
              <Button
                variant={viewMode === 'table' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('table')}
                className="flex items-center gap-1"
              >
                <List className="h-4 w-4" />
                Table
              </Button>
            </div>
            <Button variant="outline" size="sm">
              <Filter className="mr-2 h-4 w-4" /> 
              Filters
            </Button>
          </div>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>
              {jobId ? `Applications for ${filteredJobTitle || 'Job'}` : 'Candidate Applications'}
            </CardTitle>
            <CardDescription>
              {jobId 
                ? 'Review and manage applications for this job posting'
                : 'Review and manage applications across all job postings'
              }
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="all" onValueChange={setActiveTab}>
              <TabsList className="mb-4">
                <TabsTrigger value="all">All ({jobFilteredApplications.length})</TabsTrigger>
                <TabsTrigger value="pending">
                  Pending ({jobFilteredApplications.filter(app => app.status === 'pending').length})
                </TabsTrigger>
                <TabsTrigger value="shortlisted">
                  Shortlisted ({jobFilteredApplications.filter(app => app.status === 'shortlisted').length})
                </TabsTrigger>
                <TabsTrigger value="interviewed">
                  Interviewed ({jobFilteredApplications.filter(app => app.status === 'interviewed').length})
                </TabsTrigger>
                <TabsTrigger value="rejected">
                  Rejected ({jobFilteredApplications.filter(app => app.status === 'rejected').length})
                </TabsTrigger>
              </TabsList>
              
              {['all', 'pending', 'shortlisted', 'interviewed', 'rejected'].map(status => (
                <TabsContent key={status} value={status} className="space-y-4">
                  {loading ? (
                    <div className="flex justify-center py-8">
                      <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                    </div>
                  ) : sortedApplications.length === 0 ? (
                    <div className="text-center py-8">
                      <p className="text-muted-foreground">
                        {jobFilteredApplications.length === 0 
                          ? (jobId 
                              ? "No applications found for this job posting." 
                              : "No applications found. When candidates apply for your jobs, they will appear here.")
                          : "No applications match your search criteria."}
                      </p>
                    </div>
                  ) : (
                    viewMode === 'cards' ? renderApplicationCards() : renderApplicationTable()
                  )}
                </TabsContent>
              ))}
            </Tabs>
          </CardContent>
        </Card>

        {/* Enhanced Application Detail Modal */}
        <EnhancedApplicationDetailModal
          application={selectedApplication}
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          onUpdateStatus={handleUpdateStatus}
        />
      </div>
    </DashboardLayout>
  );
};

export default EmployerCandidates;
