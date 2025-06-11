
import { EmptyState } from '@/components/ui/empty-state';
import { Briefcase, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface EmptyJobsStateProps {
  type: 'active' | 'draft' | 'pending' | 'closed';
}

export const EmptyJobsState = ({ type }: EmptyJobsStateProps) => {
  const navigate = useNavigate();

  const stateConfig = {
    active: {
      title: 'No active jobs',
      description: 'You don\'t have any active job postings. Create your first job posting to start attracting candidates.',
      actionLabel: 'Post Your First Job',
      onAction: () => navigate('/employer/post-job')
    },
    draft: {
      title: 'No draft jobs',
      description: 'You don\'t have any draft job postings. Save incomplete job postings as drafts to finish later.',
      actionLabel: 'Create New Job',
      onAction: () => navigate('/employer/post-job')
    },
    pending: {
      title: 'No pending jobs',
      description: 'You don\'t have any jobs pending approval. Jobs will appear here while waiting for admin review.',
      actionLabel: 'Post New Job',
      onAction: () => navigate('/employer/post-job')
    },
    closed: {
      title: 'No closed jobs',
      description: 'You don\'t have any closed job postings. Jobs appear here when they\'re filled or expired.',
      actionLabel: 'View Active Jobs',
      onAction: () => navigate('/employer/jobs')
    }
  };

  const config = stateConfig[type];

  return (
    <EmptyState
      icon={Briefcase}
      title={config.title}
      description={config.description}
      actionLabel={config.actionLabel}
      onAction={config.onAction}
    />
  );
};
