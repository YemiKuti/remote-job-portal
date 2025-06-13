import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Search, Filter, Loader2, AlertCircle } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { fetchEmployerApplications, updateApplicationStatus } from '@/utils/api/employerApi';
import { useAuth } from '@/components/AuthProvider';

const EmployerCandidates = () => {
  const { user } = useAuth();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  
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
      } finally {
        setLoading(false);
      }
    };
    
    loadApplications();
  }, [user]);
  
  const handleUpdateStatus = async (applicationId: string, newStatus: string) => {
    try {
      const success = await updateApplicationStatus(applicationId, newStatus);
      
      if (success) {
        // Update local state
        setApplications(applications.map(app => 
          app.id === applicationId ? { ...app, status: newStatus } : app
        ));
      }
    } catch (err) {
      console.error('Error updating application status:', err);
      setError('Failed to update application status');
    }
  };
  
  const filteredApplications = applications.filter(app => {
    const matchesSearch = app.candidate?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          app.candidate?.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          app.job?.title?.toLowerCase().includes(searchTerm.toLowerCase());
                          
    if (!matchesSearch) return false;
    
    if (activeTab === 'all') return true;
    return app.status === activeTab;
  });

  return (
    <DashboardLayout userType="employer">
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Candidates</h2>
          <p className="text-muted-foreground">
            View and manage candidate applications
          </p>
        </div>
        
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Input 
              placeholder="Search candidates..."
              className="max-w-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Button variant="outline" size="icon">
              <Search className="h-4 w-4" />
            </Button>
          </div>
          <Button variant="outline">
            <Filter className="mr-2 h-4 w-4" /> Advanced Filters
          </Button>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>Candidate Applications</CardTitle>
            <CardDescription>Review and manage applications across all job postings</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="all" onValueChange={setActiveTab}>
              <TabsList className="mb-4">
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="pending">Pending</TabsTrigger>
                <TabsTrigger value="shortlisted">Shortlisted</TabsTrigger>
                <TabsTrigger value="rejected">Rejected</TabsTrigger>
              </TabsList>
              <TabsContent value="all" className="space-y-4">
                {loading ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                  </div>
                ) : filteredApplications.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">
                      {applications.length === 0 
                        ? "No applications found. When candidates apply for your jobs, they will appear here." 
                        : "No applications match your search criteria."}
                    </p>
                  </div>
                ) : (
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
                        {filteredApplications.map(app => (
                          <tr key={app.id} className="bg-white border-b">
                            <td className="px-6 py-4 font-medium">
                              <div className="flex items-center gap-3">
                                <Avatar>
                                  <AvatarFallback>
                                    {(app.candidate?.full_name || app.candidate?.username || 'C')[0]}
                                  </AvatarFallback>
                                </Avatar>
                                {app.candidate?.full_name || app.candidate?.username || 'Candidate'}
                              </div>
                            </td>
                            <td className="px-6 py-4">{app.job?.title}</td>
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
                                <Button size="sm" variant="outline">View</Button>
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
                )}
              </TabsContent>
              <TabsContent value="pending">
                {loading ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                  </div>
                ) : filteredApplications.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">No pending applications found.</p>
                  </div>
                ) : (
                  <div className="relative overflow-x-auto rounded-md border">
                    {/* Same table structure as above */}
                  </div>
                )}
              </TabsContent>
              <TabsContent value="shortlisted">
                {loading ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                  </div>
                ) : filteredApplications.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">No shortlisted candidates found.</p>
                  </div>
                ) : (
                  <div className="relative overflow-x-auto rounded-md border">
                    {/* Same table structure as above */}
                  </div>
                )}
              </TabsContent>
              <TabsContent value="rejected">
                {loading ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                  </div>
                ) : filteredApplications.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">No rejected applications found.</p>
                  </div>
                ) : (
                  <div className="relative overflow-x-auto rounded-md border">
                    {/* Same table structure as above */}
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default EmployerCandidates;
