
import { EmptyState } from '@/components/ui/empty-state';
import { Users, Eye } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const ApplicationsEmptyState = () => {
  const navigate = useNavigate();

  return (
    <EmptyState
      icon={Users}
      title="No applications yet"
      description="You haven't received any job applications yet. Make sure your job postings are active and visible to attract candidates."
      actionLabel="View Job Postings"
      onAction={() => navigate('/employer/jobs')}
    />
  );
};

export const CandidatesEmptyState = () => {
  return (
    <EmptyState
      icon={Eye}
      title="No candidates found"
      description="No candidates match your current search criteria. Try adjusting your filters or search terms."
    />
  );
};
