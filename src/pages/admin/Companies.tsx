
import React, { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Search, Building, CheckCircle, XCircle, Eye, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Company {
  id: string;
  name: string;
  industry: string;
  location: string;
  jobs: number;
  verified: boolean;
  logo: string;
}

const CompaniesAdmin = () => {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const { toast } = useToast();

  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        setLoading(true);
        
        // In a real app, you'd have a companies table
        // For now, we're getting employer profiles and job counts
        const { data: profiles, error: profilesError } = await supabase
          .from('profiles')
          .select('id, username, full_name')
          .eq('role', 'employer');
        
        if (profilesError) throw profilesError;
        
        // Get job counts for each employer
        const companiesWithJobs: Company[] = [];
        
        for (const profile of profiles || []) {
          // Count jobs for this employer
          const { count: jobCount, error: jobError } = await supabase
            .from('jobs')
            .select('*', { count: 'exact', head: true })
            .eq('employer_id', profile.id);
            
          if (jobError) throw jobError;
          
          companiesWithJobs.push({
            id: profile.id,
            name: profile.full_name || profile.username || 'Unnamed Company',
            industry: 'Technology', // Mock data
            location: 'Remote', // Mock data
            jobs: jobCount || 0,
            verified: true, // Mock data
            logo: '/placeholder.svg'
          });
        }
        
        setCompanies(companiesWithJobs);
      } catch (error) {
        console.error('Error fetching companies:', error);
        toast({
          title: 'Error',
          description: 'Failed to load companies. Please try again.',
          variant: 'destructive'
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchCompanies();
  }, [toast]);

  const handleVerifyCompany = async (companyId: string, verified: boolean) => {
    try {
      // In a real app, you'd update a companies table
      // For this demo, we'll just show a success toast
      toast({
        title: 'Success',
        description: `Company ${verified ? 'verified' : 'unverified'} successfully`,
      });
      
      // Update local state
      setCompanies(companies.map(company => 
        company.id === companyId 
          ? { ...company, verified } 
          : company
      ));
    } catch (error) {
      console.error('Error updating company verification:', error);
      toast({
        title: 'Error',
        description: 'Failed to update company verification status',
        variant: 'destructive'
      });
    }
  };

  const filteredCompanies = searchTerm.trim() === '' 
    ? companies 
    : companies.filter(company => 
        company.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        company.industry.toLowerCase().includes(searchTerm.toLowerCase()) ||
        company.location.toLowerCase().includes(searchTerm.toLowerCase())
      );

  return (
    <DashboardLayout userType="admin">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">Company Management</h1>
            <p className="text-muted-foreground">Manage all companies registered in the system</p>
          </div>
          <Button className="flex items-center gap-2">
            <Building className="h-4 w-4" />
            <span>Add Company</span>
          </Button>
        </div>

        <div className="flex items-center gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search companies by name, industry, or location..." 
              className="pl-8 w-full"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Button variant="outline">Filters</Button>
        </div>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle>All Companies</CardTitle>
            <CardDescription>Showing all registered companies</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : filteredCompanies.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No companies found. Try a different search term or add new companies.</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Company</TableHead>
                    <TableHead>Industry</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Job Listings</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCompanies.map((company) => (
                    <TableRow key={company.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={company.logo} alt={company.name} />
                            <AvatarFallback>{company.name[0]}</AvatarFallback>
                          </Avatar>
                          <span className="font-medium">{company.name}</span>
                        </div>
                      </TableCell>
                      <TableCell>{company.industry}</TableCell>
                      <TableCell>{company.location}</TableCell>
                      <TableCell>{company.jobs}</TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          company.verified 
                            ? 'bg-green-100 text-green-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}>
                          {company.verified ? 'Verified' : 'Pending Verification'}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <Eye className="h-4 w-4" />
                        </Button>
                        {!company.verified && (
                          <>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-8 w-8 text-green-600"
                              onClick={() => handleVerifyCompany(company.id, true)}
                            >
                              <CheckCircle className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-8 w-8 text-red-600"
                              onClick={() => handleVerifyCompany(company.id, false)}
                            >
                              <XCircle className="h-4 w-4" />
                            </Button>
                          </>
                        )}
                        <Button variant="ghost" size="sm">Edit</Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default CompaniesAdmin;
