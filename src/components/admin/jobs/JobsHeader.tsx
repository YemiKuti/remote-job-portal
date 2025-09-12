
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus, Link2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { CSVUploadDialog } from "./CSVUploadDialog";
import { useToast } from "@/hooks/use-toast";
import { testSupabaseConnectivity } from "@/utils/supabaseHealth";

interface JobsHeaderProps {
  onJobsUploaded?: () => void;
}

export const JobsHeader: React.FC<JobsHeaderProps> = ({ onJobsUploaded }) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [testing, setTesting] = useState(false);

  const handleTest = async () => {
    setTesting(true);
    try {
      const result = await testSupabaseConnectivity();
      if (result.success) {
        console.info('✅ Supabase connectivity test passed:', result);
        toast({
          title: 'Supabase Connected',
          description: 'Read and write tests completed successfully.',
        });
      } else {
        console.error('❌ Supabase connectivity test failed:', result);
        const firstError = result.steps.find(s => !s.success)?.message || 'Unknown error';
        toast({
          title: 'Supabase Connection Failed',
          description: firstError,
          variant: 'destructive',
        });
      }
    } catch (e: any) {
      console.error('❌ Unexpected error during connectivity test:', e);
      toast({ title: 'Test Error', description: e?.message || String(e), variant: 'destructive' });
    } finally {
      setTesting(false);
    }
  };
  return (
    <div className="flex justify-between items-center">
      <div>
        <h1 className="text-2xl font-bold">Job Management</h1>
        <p className="text-muted-foreground">Manage all job listings in the system</p>
      </div>
      <div className="flex items-center gap-2">
        <Button variant="outline" className="flex items-center gap-2" onClick={handleTest} disabled={testing}>
          <Link2 className="h-4 w-4" />
          <span>{testing ? 'Testing…' : 'Test Supabase'}</span>
        </Button>
        <CSVUploadDialog onJobsUploaded={onJobsUploaded || (() => {})} />
        <Button className="flex items-center gap-2" onClick={() => navigate('/admin/jobs/new')}>
          <Plus className="h-4 w-4" />
          <span>Create Job</span>
        </Button>
      </div>
    </div>
  );
};
