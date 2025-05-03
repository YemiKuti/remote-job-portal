
import React from 'react';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Building, Calendar, FileText } from 'lucide-react';

// Mock data
const applications = [
  { 
    id: 1, 
    position: 'Frontend Developer', 
    company: 'Tech Solutions Ltd', 
    location: 'Nairobi, Kenya', 
    date: '2025-04-28', 
    status: 'pending' 
  },
  { 
    id: 2, 
    position: 'UX Designer', 
    company: 'Creative Designs', 
    location: 'Lagos, Nigeria', 
    date: '2025-04-25', 
    status: 'reviewed' 
  },
  { 
    id: 3, 
    position: 'Product Manager', 
    company: 'InnovateAfrica', 
    location: 'Cape Town, South Africa', 
    date: '2025-04-20', 
    status: 'rejected' 
  },
  { 
    id: 4, 
    position: 'Backend Engineer', 
    company: 'DataSystems', 
    location: 'Remote', 
    date: '2025-04-15', 
    status: 'interview' 
  },
  { 
    id: 5, 
    position: 'DevOps Engineer', 
    company: 'CloudTech Africa', 
    location: 'Accra, Ghana', 
    date: '2025-04-12', 
    status: 'offer' 
  }
];

const CandidateApplications = () => {
  const statusColors = {
    pending: 'bg-yellow-100 text-yellow-800',
    reviewed: 'bg-blue-100 text-blue-800',
    rejected: 'bg-red-100 text-red-800',
    interview: 'bg-purple-100 text-purple-800',
    offer: 'bg-green-100 text-green-800',
  };
  
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
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
          <TabsList className="grid grid-cols-5 max-w-md">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="pending">Pending</TabsTrigger>
            <TabsTrigger value="reviewed">Reviewed</TabsTrigger>
            <TabsTrigger value="interview">Interview</TabsTrigger>
            <TabsTrigger value="offer">Offer</TabsTrigger>
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
                <div className="space-y-6">
                  {applications.map((app) => (
                    <div key={app.id} className="flex flex-col sm:flex-row sm:items-center justify-between border-b pb-6 last:border-0 last:pb-0">
                      <div className="space-y-1">
                        <h3 className="font-medium">{app.position}</h3>
                        <div className="flex items-center text-sm text-muted-foreground">
                          <Building className="mr-1 h-4 w-4" />
                          <span>{app.company}</span>
                        </div>
                        <div className="flex items-center text-sm text-muted-foreground">
                          <Calendar className="mr-1 h-4 w-4" />
                          <span>Applied on {formatDate(app.date)}</span>
                        </div>
                        <div className="mt-2">
                          <Badge className={statusColors[app.status as keyof typeof statusColors]}>
                            {app.status.charAt(0).toUpperCase() + app.status.slice(1)}
                          </Badge>
                        </div>
                      </div>
                      
                      <div className="flex gap-2 mt-4 sm:mt-0">
                        <Button variant="outline" size="sm" className="flex items-center">
                          <FileText className="mr-1 h-4 w-4" />
                          View Details
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
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
                <div className="space-y-6">
                  {applications
                    .filter(app => app.status === 'pending')
                    .map((app) => (
                      <div key={app.id} className="flex flex-col sm:flex-row sm:items-center justify-between border-b pb-6 last:border-0 last:pb-0">
                        <div className="space-y-1">
                          <h3 className="font-medium">{app.position}</h3>
                          <div className="flex items-center text-sm text-muted-foreground">
                            <Building className="mr-1 h-4 w-4" />
                            <span>{app.company}</span>
                          </div>
                          <div className="flex items-center text-sm text-muted-foreground">
                            <Calendar className="mr-1 h-4 w-4" />
                            <span>Applied on {formatDate(app.date)}</span>
                          </div>
                        </div>
                        
                        <div className="flex gap-2 mt-4 sm:mt-0">
                          <Button variant="outline" size="sm" className="flex items-center">
                            <FileText className="mr-1 h-4 w-4" />
                            View Details
                          </Button>
                        </div>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Similar structure for other tabs */}
          <TabsContent value="reviewed">
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Reviewed Applications</CardTitle>
                <CardDescription>Applications that have been reviewed</CardDescription>
              </CardHeader>
              <CardContent>
                {applications.filter(app => app.status === 'reviewed').length > 0 ? (
                  <div className="space-y-6">
                    {applications
                      .filter(app => app.status === 'reviewed')
                      .map((app) => (
                        <div key={app.id} className="flex flex-col sm:flex-row sm:items-center justify-between border-b pb-6 last:border-0 last:pb-0">
                          {/* Similar structure as above */}
                          <div className="space-y-1">
                            <h3 className="font-medium">{app.position}</h3>
                            <div className="flex items-center text-sm text-muted-foreground">
                              <Building className="mr-1 h-4 w-4" />
                              <span>{app.company}</span>
                            </div>
                            <div className="flex items-center text-sm text-muted-foreground">
                              <Calendar className="mr-1 h-4 w-4" />
                              <span>Applied on {formatDate(app.date)}</span>
                            </div>
                          </div>
                          
                          <div className="flex gap-2 mt-4 sm:mt-0">
                            <Button variant="outline" size="sm" className="flex items-center">
                              <FileText className="mr-1 h-4 w-4" />
                              View Details
                            </Button>
                          </div>
                        </div>
                      ))}
                  </div>
                ) : (
                  <p className="text-center py-8 text-muted-foreground">No reviewed applications yet</p>
                )}
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
                {applications.filter(app => app.status === 'interview').length > 0 ? (
                  <div className="space-y-6">
                    {applications
                      .filter(app => app.status === 'interview')
                      .map((app) => (
                        <div key={app.id} className="flex flex-col sm:flex-row sm:items-center justify-between border-b pb-6 last:border-0 last:pb-0">
                          {/* Similar structure as above */}
                          <div className="space-y-1">
                            <h3 className="font-medium">{app.position}</h3>
                            <div className="flex items-center text-sm text-muted-foreground">
                              <Building className="mr-1 h-4 w-4" />
                              <span>{app.company}</span>
                            </div>
                            <div className="flex items-center text-sm text-muted-foreground">
                              <Calendar className="mr-1 h-4 w-4" />
                              <span>Applied on {formatDate(app.date)}</span>
                            </div>
                          </div>
                          
                          <div className="flex gap-2 mt-4 sm:mt-0">
                            <Button variant="outline" size="sm" className="flex items-center">
                              <FileText className="mr-1 h-4 w-4" />
                              View Details
                            </Button>
                          </div>
                        </div>
                      ))}
                  </div>
                ) : (
                  <p className="text-center py-8 text-muted-foreground">No interview stage applications yet</p>
                )}
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
                {applications.filter(app => app.status === 'offer').length > 0 ? (
                  <div className="space-y-6">
                    {applications
                      .filter(app => app.status === 'offer')
                      .map((app) => (
                        <div key={app.id} className="flex flex-col sm:flex-row sm:items-center justify-between border-b pb-6 last:border-0 last:pb-0">
                          {/* Similar structure as above */}
                          <div className="space-y-1">
                            <h3 className="font-medium">{app.position}</h3>
                            <div className="flex items-center text-sm text-muted-foreground">
                              <Building className="mr-1 h-4 w-4" />
                              <span>{app.company}</span>
                            </div>
                            <div className="flex items-center text-sm text-muted-foreground">
                              <Calendar className="mr-1 h-4 w-4" />
                              <span>Applied on {formatDate(app.date)}</span>
                            </div>
                          </div>
                          
                          <div className="flex gap-2 mt-4 sm:mt-0">
                            <Button variant="outline" size="sm" className="flex items-center">
                              <FileText className="mr-1 h-4 w-4" />
                              View Details
                            </Button>
                          </div>
                        </div>
                      ))}
                  </div>
                ) : (
                  <p className="text-center py-8 text-muted-foreground">No job offers yet</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default CandidateApplications;
