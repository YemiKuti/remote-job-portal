
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { MessageCircle, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/components/AuthProvider';
import { createOrFindConversation } from '@/utils/api/conversationsApi';
import { toast } from 'sonner';

interface StartConversationButtonProps {
  recipientId: string;
  recipientName?: string;
  currentUserRole?: 'candidate' | 'employer';
  variant?: 'default' | 'outline' | 'ghost' | 'link' | 'destructive' | 'secondary';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  className?: string;
  children?: React.ReactNode;
}

export const StartConversationButton: React.FC<StartConversationButtonProps> = ({
  recipientId,
  recipientName = 'User',
  currentUserRole = 'candidate',
  variant = 'outline',
  size = 'sm',
  className = '',
  children
}) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleStartConversation = async () => {
    if (!user) {
      toast.error('Please sign in to send messages');
      return;
    }

    if (!recipientId) {
      toast.error('Cannot start conversation: recipient not found');
      return;
    }

    setLoading(true);
    try {
      await createOrFindConversation(recipientId, currentUserRole);
      
      // Navigate to the appropriate messages page
      const messagesRoute = currentUserRole === 'employer' 
        ? '/employer/messages' 
        : '/candidate/messages';
      
      navigate(messagesRoute);
      toast.success(`Started conversation with ${recipientName}`);
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
      disabled={loading || !recipientId}
    >
      {loading ? (
        <Loader2 className="h-4 w-4 animate-spin mr-2" />
      ) : (
        <MessageCircle className="h-4 w-4 mr-2" />
      )}
      {children || 'Message'}
    </Button>
  );
};
