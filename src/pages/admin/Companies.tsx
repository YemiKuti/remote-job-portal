
import React from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Search, Building, CheckCircle, XCircle, Eye } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const CompaniesAdmin = () => {
  // Mock data for the companies page
  const companies = [
    { 
      id: "1", 
      name: "TechCorp Inc.", 
      industry: "Information Technology", 
      location: "Nairobi, Kenya", 
      jobs: 5,
      verified: true,
      logo: "/placeholder.svg"
    },
    { 
      id: "2", 
      name: "Design Studio", 
      industry: "Creative & Design", 
      location: "Cape Town, South Africa", 
      jobs: 2,
      verified: true,
      logo: "/placeholder.svg"
    },
    { 
      id: "3", 
      name: "Analytics Africa", 
      industry: "Data & Analytics", 
      location: "Lagos, Nigeria", 
      jobs: 3,
      verified: false,
      logo: "/placeholder.svg"
    },
    { 
      id: "4", 
      name: "Cloud Solutions", 
      industry: "Cloud Computing", 
      location: "Remote", 
      jobs: 4,
      verified: true,
      logo: "/placeholder.svg"
    },
    { 
      id: "5", 
      name: "GrowthHub", 
      industry: "Marketing & Advertising", 
      location: "Accra, Ghana", 
      jobs: 1,
      verified: false,
      logo: "/placeholder.svg"
    },
  ];

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
                {companies.map((company) => (
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
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-green-600">
                            <CheckCircle className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-red-600">
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
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default CompaniesAdmin;
