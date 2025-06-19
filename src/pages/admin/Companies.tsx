
import React, { useState } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Edit, Trash2, ExternalLink } from "lucide-react";
import { useCompaniesManagement } from '@/hooks/admin/useCompaniesManagement';
import { AddCompanyDialog } from '@/components/admin/companies/AddCompanyDialog';
import { EditCompanyDialog } from '@/components/admin/companies/EditCompanyDialog';
import { Company } from '@/utils/api/adminApi';

const CompaniesPage = () => {
  const {
    companies,
    loading,
    searchTerm,
    setSearchTerm,
    handleCreateCompany,
    handleUpdateCompany,
    handleDeleteCompany
  } = useCompaniesManagement();

  const [editingCompany, setEditingCompany] = useState<Company | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const handleEdit = (company: Company) => {
    console.log('Edit company clicked:', company);
    setEditingCompany(company);
    setEditDialogOpen(true);
  };

  const handleDelete = async (companyId: string, companyName: string) => {
    const confirmMessage = `Are you sure you want to delete "${companyName}"? This action cannot be undone.`;
    if (window.confirm(confirmMessage)) {
      console.log('Delete company confirmed:', companyId);
      await handleDeleteCompany(companyId);
    }
  };

  const handleEditDialogClose = () => {
    setEditDialogOpen(false);
    setEditingCompany(null);
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">Loading companies...</div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Companies Management</h1>
          <AddCompanyDialog onCreateCompany={handleCreateCompany} />
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>Companies ({companies.length})</CardTitle>
            <CardDescription>Manage and monitor all registered companies on the platform.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center mb-4">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                <Input
                  placeholder="Search companies..."
                  className="pl-8"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Company Name</TableHead>
                    <TableHead>Industry</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Size</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {companies.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center text-muted-foreground">
                        {searchTerm ? 'No companies found matching your search.' : 'No companies found. Add your first company to get started.'}
                      </TableCell>
                    </TableRow>
                  ) : (
                    companies.map((company) => (
                      <TableRow key={company.id}>
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-2">
                            {company.logo_url && (
                              <img 
                                src={company.logo_url} 
                                alt={`${company.name} logo`}
                                className="w-8 h-8 rounded object-cover"
                                onError={(e) => {
                                  e.currentTarget.style.display = 'none';
                                }}
                              />
                            )}
                            <div>
                              <div>{company.name}</div>
                              {company.website && (
                                <a 
                                  href={company.website} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="text-xs text-blue-600 hover:underline flex items-center gap-1"
                                >
                                  <ExternalLink className="h-3 w-3" />
                                  Website
                                </a>
                              )}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>{company.industry || 'N/A'}</TableCell>
                        <TableCell>{company.location || 'N/A'}</TableCell>
                        <TableCell>{company.company_size || 'N/A'}</TableCell>
                        <TableCell>
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            company.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                          }`}>
                            {company.status}
                          </span>
                        </TableCell>
                        <TableCell>{formatDate(company.created_at)}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => handleEdit(company)}
                              className="h-8 w-8 p-0"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => handleDelete(company.id, company.name)}
                              className="h-8 w-8 p-0 text-red-600 hover:text-red-800"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        <EditCompanyDialog
          company={editingCompany}
          open={editDialogOpen}
          onOpenChange={handleEditDialogClose}
          onUpdateCompany={handleUpdateCompany}
        />
      </div>
    </AdminLayout>
  );
};

export default CompaniesPage;
