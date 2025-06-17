
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { MessageSquare, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/components/AuthProvider';
import { createOrFindConversation } from '@/utils/api/conversationsApi';
import { toast } from 'sonner';

interface MessageCandidateButtonProps {
  candidateId: string;
  candidateName: string;
  size?: 'default' | 'sm' | 'lg' | 'icon';
  variant?: 'default' | 'outline' | 'ghost' | 'link' | 'destructive' | 'secondary';
  className?: string;
}

export const MessageCandidateButton: React.FC<MessageCandidateButtonProps> = ({
  candidateId,
  candidateName,
  size = 'sm',
  variant = 'outline',
  className = ''
}) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleStartConversation = async () => {
    if (!user) {
      toast.error('Please sign in to send messages');
      return;
    }

    if (!candidateId) {
      toast.error('Cannot start conversation: candidate not found');
      return;
    }

    setLoading(true);
    try {
      await createOrFindConversation(candidateId, 'employer');
      navigate('/employer/messages');
      toast.success(`Started conversation with ${candidateName}`);
    } catch (error) {
      console.error('Error starting conversation:', error);
      toast.error('Failed to start conversation. Please try again.');
    }
    setLoading(false);
  };

  return (
    <Button
      variant={variant}
      size={size}
      className={className}
      onClick={handleStartConversation}
      disabled={loading || !candidateId}
    >
      {loading ? (
        <Loader2 className="h-4 w-4 animate-spin mr-2" />
      ) : (
        <MessageSquare className="h-4 w-4 mr-2" />
      )}
      Message
    </Button>
  );
};
