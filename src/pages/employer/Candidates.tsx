
import React from 'react';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Search, Filter } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

const EmployerCandidates = () => {
  // Mock data
  const allCandidates = [
    { id: '1', name: 'John Smith', position: 'Frontend Developer', status: 'pending', appliedDate: '2025-05-01' },
    { id: '2', name: 'Sarah Jones', position: 'UX Designer', status: 'reviewed', appliedDate: '2025-04-28' },
    { id: '3', name: 'Michael Brown', position: 'Product Manager', status: 'shortlisted', appliedDate: '2025-04-26' },
  ];

  return (
    <DashboardLayout userType="employer">
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Candidates</h2>
          <p className="text-muted-foreground">
            View and manage candidate applications
          </p>
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Input 
              placeholder="Search candidates..."
              className="max-w-sm"
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
            <Tabs defaultValue="all">
              <TabsList className="mb-4">
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="pending">Pending</TabsTrigger>
                <TabsTrigger value="shortlisted">Shortlisted</TabsTrigger>
                <TabsTrigger value="rejected">Rejected</TabsTrigger>
              </TabsList>
              <TabsContent value="all" className="space-y-4">
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
                      {allCandidates.map(candidate => (
                        <tr key={candidate.id} className="bg-white border-b">
                          <td className="px-6 py-4 font-medium">
                            <div className="flex items-center gap-3">
                              <Avatar>
                                <AvatarFallback>{candidate.name[0]}</AvatarFallback>
                              </Avatar>
                              {candidate.name}
                            </div>
                          </td>
                          <td className="px-6 py-4">{candidate.position}</td>
                          <td className="px-6 py-4">{new Date(candidate.appliedDate).toLocaleDateString()}</td>
                          <td className="px-6 py-4">
                            <span className={`px-2 py-1 text-xs rounded-full ${
                              candidate.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                              candidate.status === 'reviewed' ? 'bg-blue-100 text-blue-800' : 
                              candidate.status === 'shortlisted' ? 'bg-green-100 text-green-800' :
                              'bg-red-100 text-red-800'
                            }`}>
                              {candidate.status.charAt(0).toUpperCase() + candidate.status.slice(1)}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex space-x-2">
                              <Button size="sm" variant="outline">View</Button>
                              <Button size="sm" variant="outline">Contact</Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </TabsContent>
              <TabsContent value="pending">
                <div className="text-center py-6">
                  <p className="text-muted-foreground">Pending applications will appear here.</p>
                </div>
              </TabsContent>
              <TabsContent value="shortlisted">
                <div className="text-center py-6">
                  <p className="text-muted-foreground">Shortlisted candidates will appear here.</p>
                </div>
              </TabsContent>
              <TabsContent value="rejected">
                <div className="text-center py-6">
                  <p className="text-muted-foreground">Rejected applications will appear here.</p>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default EmployerCandidates;
