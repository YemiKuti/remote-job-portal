
import React from 'react';
import { Check, CheckCheck } from 'lucide-react';

interface MessageStatusProps {
  read: boolean;
  seen: boolean;
  isSentByCurrentUser: boolean;
}

export const MessageStatus = ({ read, seen, isSentByCurrentUser }: MessageStatusProps) => {
  if (!isSentByCurrentUser) return null;

  return (
    <div className="flex items-center ml-1">
      {seen ? (
        <CheckCheck className="h-3 w-3 text-blue-500" />
      ) : read ? (
        <CheckCheck className="h-3 w-3 text-gray-400" />
      ) : (
        <Check className="h-3 w-3 text-gray-400" />
      )}
    </div>
  );
};
