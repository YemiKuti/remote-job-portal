
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { fetchAdminCompanies, createCompany, updateCompany, deleteCompany, Company, CompanyFormData } from "@/utils/api/adminApi";

export const useCompaniesManagement = () => {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    const loadCompanies = async () => {
      try {
        setLoading(true);
        console.log('Loading admin companies...');
        
        const data = await fetchAdminCompanies();
        console.log('Admin companies loaded:', data);
        
        setCompanies(data || []);
      } catch (error) {
        console.error('Error fetching admin companies:', error);
        toast({
          title: 'Error',
          description: 'Failed to load companies. Please try again.',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };
    
    loadCompanies();
  }, [toast]);

  const handleCreateCompany = async (companyData: CompanyFormData) => {
    try {
      console.log('Creating company:', companyData);
      
      const newCompanyId = await createCompany(companyData);
      
      if (newCompanyId) {
        // Reload companies to get the latest data
        const updatedCompanies = await fetchAdminCompanies();
        setCompanies(updatedCompanies);
        
        toast({
          title: 'Success',
          description: 'Company created successfully',
        });
        
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Error creating company:', error);
      toast({
        title: 'Error',
        description: 'Failed to create company. Please try again.',
        variant: 'destructive',
      });
      return false;
    }
  };

  const handleUpdateCompany = async (companyId: string, companyData: CompanyFormData & { status?: string }) => {
    try {
      console.log('Updating company:', companyId, companyData);
      
      const success = await updateCompany(companyId, companyData);
      
      if (success) {
        // Update local state
        setCompanies(companies.map(company => 
          company.id === companyId 
            ? { ...company, ...companyData, updated_at: new Date().toISOString() }
            : company
        ));
        
        toast({
          title: 'Success',
          description: 'Company updated successfully',
        });
        
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Error updating company:', error);
      toast({
        title: 'Error',
        description: 'Failed to update company. Please try again.',
        variant: 'destructive',
      });
      return false;
    }
  };

  const handleDeleteCompany = async (companyId: string) => {
    try {
      console.log('Deleting company:', companyId);
      
      const success = await deleteCompany(companyId);
      
      if (success) {
        // Remove from local state
        setCompanies(companies.filter(company => company.id !== companyId));
        
        toast({
          title: 'Success',
          description: 'Company deleted successfully',
        });
        
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Error deleting company:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete company. Please try again.',
        variant: 'destructive',
      });
      return false;
    }
  };

  const filteredCompanies = searchTerm.trim() === '' 
    ? companies 
    : companies.filter(company => 
        company.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        (company.industry && company.industry.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (company.location && company.location.toLowerCase().includes(searchTerm.toLowerCase()))
      );

  return {
    companies: filteredCompanies,
    loading,
    searchTerm,
    setSearchTerm,
    handleCreateCompany,
    handleUpdateCompany,
    handleDeleteCompany
  };
};
