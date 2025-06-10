
import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Building, Calendar, FileText, Loader2, X } from 'lucide-react';
import { fetchCandidateApplications, withdrawApplication } from '@/utils/api/candidateApi';
import { useAuth } from '@/components/AuthProvider';

const CandidateApplications = () => {
  const { user } = useAuth();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [withdrawing, setWithdrawing] = useState<string | null>(null);
  
  useEffect(() => {
    const loadApplications = async () => {
      if (!user) return;
      
      setLoading(true);
      const apps = await fetchCandidateApplications(user.id);
      setApplications(apps);
      setLoading(false);
    };
    
    loadApplications();
  }, [user]);
  
  const statusColors: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-800',
    reviewed: 'bg-blue-100 text-blue-800',
    rejected: 'bg-red-100 text-red-800',
    interview: 'bg-purple-100 text-purple-800',
    offer: 'bg-green-100 text-green-800',
    withdrawn: 'bg-gray-100 text-gray-800',
  };
  
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const handleWithdrawApplication = async (applicationId: string) => {
    if (!confirm('Are you sure you want to withdraw this application? This action cannot be undone.')) {
      return;
    }

    setWithdrawing(applicationId);
    const success = await withdrawApplication(applicationId);
    
    if (success) {
      // Update local state
      setApplications(prev =>
        prev.map(app =>
          app.id === applicationId
            ? { ...app, status: 'withdrawn' }
            : app
        )
      );
    }
    setWithdrawing(null);
  };

  const getFilteredApplications = (status?: string) => {
    if (!status || status === 'all') return applications;
    return applications.filter(app => app.status === status);
  };
  
  const renderApplications = (apps: any[]) => {
    if (loading) {
      return (
        <div className="flex justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      );
    }
    
    if (apps.length === 0) {
      return (
        <div className="text-center py-8">
          <p className="text-muted-foreground">No applications found</p>
        </div>
      );
    }
    
    return (
      <div className="space-y-6">
        {apps.map((app) => (
          <div key={app.id} className="flex flex-col sm:flex-row sm:items-center justify-between border-b pb-6 last:border-0 last:pb-0">
            <div className="space-y-1">
              <h3 className="font-medium">{app.position || "Position"}</h3>
              <div className="flex items-center text-sm text-muted-foreground">
                <Building className="mr-1 h-4 w-4" />
                <span>{app.company || "Company"}</span>
              </div>
              <div className="flex items-center text-sm text-muted-foreground">
                <Calendar className="mr-1 h-4 w-4" />
                <span>Applied on {formatDate(app.applied_date)}</span>
              </div>
              <div className="mt-2">
                <Badge className={statusColors[app.status as keyof typeof statusColors] || 'bg-gray-100 text-gray-800'}>
                  {app.status.charAt(0).toUpperCase() + app.status.slice(1)}
                </Badge>
              </div>
            </div>
            
            <div className="flex gap-2 mt-4 sm:mt-0">
              <Button variant="outline" size="sm" className="flex items-center">
                <FileText className="mr-1 h-4 w-4" />
                View Details
              </Button>
              {app.status === 'pending' && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="flex items-center text-red-600 hover:text-red-700"
                  onClick={() => handleWithdrawApplication(app.id)}
                  disabled={withdrawing === app.id}
                >
                  {withdrawing === app.id ? (
                    <Loader2 className="mr-1 h-4 w-4 animate-spin" />
                  ) : (
                    <X className="mr-1 h-4 w-4" />
                  )}
                  Withdraw
                </Button>
              )}
            </div>
          </div>
        ))}
      </div>
    );
  };
  
  return (
    <DashboardLayout userType="candidate">
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">My Applications</h2>
          <p className="text-muted-foreground">
            Track and manage your job applications
          </p>
        </div>
        <Separator />
        
        <Tabs defaultValue="all" className="w-full">
          <TabsList className="grid grid-cols-6 max-w-2xl">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="pending">Pending</TabsTrigger>
            <TabsTrigger value="reviewed">Reviewed</TabsTrigger>
            <TabsTrigger value="interview">Interview</TabsTrigger>
            <TabsTrigger value="offer">Offer</TabsTrigger>
            <TabsTrigger value="withdrawn">Withdrawn</TabsTrigger>
          </TabsList>
          
          <TabsContent value="all" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>All Applications</CardTitle>
                <CardDescription>
                  Showing all your job applications
                </CardDescription>
              </CardHeader>
              <CardContent>
                {renderApplications(applications)}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="pending" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Pending Applications</CardTitle>
                <CardDescription>
                  Applications waiting for employer review
                </CardDescription>
              </CardHeader>
              <CardContent>
                {renderApplications(getFilteredApplications('pending'))}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="reviewed">
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Reviewed Applications</CardTitle>
                <CardDescription>Applications that have been reviewed</CardDescription>
              </CardHeader>
              <CardContent>
                {renderApplications(getFilteredApplications('reviewed'))}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="interview">
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Interview Stage</CardTitle>
                <CardDescription>Applications in the interview process</CardDescription>
              </CardHeader>
              <CardContent>
                {renderApplications(getFilteredApplications('interview'))}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="offer">
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Job Offers</CardTitle>
                <CardDescription>Applications with job offers</CardDescription>
              </CardHeader>
              <CardContent>
                {renderApplications(getFilteredApplications('offer'))}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="withdrawn">
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Withdrawn Applications</CardTitle>
                <CardDescription>Applications you have withdrawn</CardDescription>
              </CardHeader>
              <CardContent>
                {renderApplications(getFilteredApplications('withdrawn'))}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default CandidateApplications;
