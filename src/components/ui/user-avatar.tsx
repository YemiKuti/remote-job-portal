
import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useUserAvatar } from '@/hooks/useUserAvatar';

interface UserAvatarProps {
  userId?: string;
  fallbackText?: string;
  className?: string;
}

export const UserAvatar = ({ userId, fallbackText = 'U', className }: UserAvatarProps) => {
  const { avatarUrl, isLoading } = useUserAvatar(userId);

  return (
    <Avatar className={className}>
      {!isLoading && avatarUrl && (
        <AvatarImage src={avatarUrl} alt="Profile picture" />
      )}
      <AvatarFallback>{fallbackText}</AvatarFallback>
    </Avatar>
  );
};
