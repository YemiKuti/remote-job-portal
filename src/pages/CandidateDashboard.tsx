
import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Briefcase, 
  Building, 
  MapPin, 
  Calendar, 
  BookmarkIcon, 
  TrendingUp,
  Bell,
  Users,
  FileText
} from 'lucide-react';
import { useAuth } from '@/components/AuthProvider';
import { fetchCandidateApplications, fetchSavedJobs, fetchRecommendedJobs } from '@/utils/api/candidateApi';
import { NotificationCenter } from '@/components/candidate/NotificationCenter';

const CandidateDashboard = () => {
  const { user } = useAuth();
  const [applications, setApplications] = useState([]);
  const [savedJobs, setSavedJobs] = useState([]);
  const [recommendedJobs, setRecommendedJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDashboardData = async () => {
      if (!user) return;
      
      setLoading(true);
      try {
        const [appsData, savedData, recommendedData] = await Promise.all([
          fetchCandidateApplications(user.id),
          fetchSavedJobs(user.id),
          fetchRecommendedJobs(user.id, 3)
        ]);
        
        setApplications(appsData);
        setSavedJobs(savedData);
        setRecommendedJobs(recommendedData);
      } catch (error) {
        console.error('Error loading dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadDashboardData();
  }, [user]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'reviewed': return 'bg-blue-100 text-blue-800';
      case 'interview': return 'bg-purple-100 text-purple-800';
      case 'offer': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <DashboardLayout userType="candidate">
        <div className="flex items-center justify-center h-full">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout userType="candidate">
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Dashboard</h2>
          <p className="text-muted-foreground">
            Welcome back! Here's an overview of your job search activity.
          </p>
        </div>
        <Separator />

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Applications</CardTitle>
              <Briefcase className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{applications.length}</div>
              <p className="text-xs text-muted-foreground">
                {applications.filter(app => app.status === 'pending').length} pending review
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Saved Jobs</CardTitle>
              <BookmarkIcon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{savedJobs.length}</div>
              <p className="text-xs text-muted-foreground">
                Jobs bookmarked for later
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Interviews</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {applications.filter(app => app.status === 'interview').length}
              </div>
              <p className="text-xs text-muted-foreground">
                Active interview processes
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Job Offers</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {applications.filter(app => app.status === 'offer').length}
              </div>
              <p className="text-xs text-muted-foreground">
                Pending decisions
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Grid */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Recent Applications */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Recent Applications</CardTitle>
                <CardDescription>
                  Your latest job applications and their status
                </CardDescription>
              </CardHeader>
              <CardContent>
                {applications.length > 0 ? (
                  <div className="space-y-4">
                    {applications.slice(0, 5).map((app) => (
                      <div key={app.id} className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0">
                        <div className="space-y-1">
                          <h4 className="font-medium">{app.position || "Position"}</h4>
                          <div className="flex items-center text-sm text-muted-foreground">
                            <Building className="mr-1 h-3 w-3" />
                            <span>{app.company || "Company"}</span>
                            <MapPin className="ml-2 mr-1 h-3 w-3" />
                            <span>{app.location || "Location"}</span>
                          </div>
                          <div className="flex items-center text-xs text-muted-foreground">
                            <Calendar className="mr-1 h-3 w-3" />
                            <span>Applied {formatDate(app.applied_date)}</span>
                          </div>
                        </div>
                        <Badge className={getStatusColor(app.status)}>
                          {app.status.charAt(0).toUpperCase() + app.status.slice(1)}
                        </Badge>
                      </div>
                    ))}
                    <div className="pt-4">
                      <Button variant="outline" className="w-full">
                        View All Applications
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Briefcase className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
                    <p className="text-muted-foreground">No applications yet</p>
                    <p className="text-sm text-muted-foreground mb-4">Start applying to jobs to see them here</p>
                    <Button>Browse Jobs</Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Notifications */}
          <div>
            {user && <NotificationCenter userId={user.id} />}
          </div>
        </div>

        {/* Recommended Jobs */}
        <Card>
          <CardHeader>
            <CardTitle>Recommended for You</CardTitle>
            <CardDescription>
              Jobs that match your profile and preferences
            </CardDescription>
          </CardHeader>
          <CardContent>
            {recommendedJobs.length > 0 ? (
              <div className="grid gap-4 md:grid-cols-3">
                {recommendedJobs.map((job) => (
                  <div key={job.id} className="border rounded-lg p-4 space-y-2">
                    <h4 className="font-medium">{job.title}</h4>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Building className="mr-1 h-3 w-3" />
                      <span>{job.company}</span>
                    </div>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <MapPin className="mr-1 h-3 w-3" />
                      <span>{job.location}</span>
                    </div>
                    {job.salary_min && job.salary_max && (
                      <p className="text-sm font-medium">
                        ${job.salary_min.toLocaleString()} - ${job.salary_max.toLocaleString()}
                      </p>
                    )}
                    <div className="flex gap-2 pt-2">
                      <Button size="sm" className="flex-1">Apply</Button>
                      <Button size="sm" variant="outline">Save</Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
                <p className="text-muted-foreground">No recommendations available</p>
                <p className="text-sm text-muted-foreground">Complete your profile to get personalized job recommendations</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default CandidateDashboard;
