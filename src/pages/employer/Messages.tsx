
import React from 'react';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Search, Send } from 'lucide-react';

const EmployerMessages = () => {
  // Mock data
  const conversations = [
    { id: '1', name: 'John Smith', lastMessage: 'Thanks for the interview opportunity!', time: '10:30 AM', unread: true },
    { id: '2', name: 'Sarah Jones', lastMessage: 'I am available for the interview on Tuesday', time: 'Yesterday', unread: false },
    { id: '3', name: 'Michael Brown', lastMessage: 'Looking forward to hearing back from you', time: 'Apr 28', unread: false },
  ];
  
  const currentChat = {
    id: '1',
    name: 'John Smith',
    position: 'Frontend Developer',
    messages: [
      { id: 'm1', sender: 'them', text: 'Hello! I recently applied for the Frontend Developer position at your company.', time: '10:15 AM' },
      { id: 'm2', sender: 'me', text: 'Hi John, thanks for your application. We were impressed by your portfolio.', time: '10:20 AM' },
      { id: 'm3', sender: 'them', text: 'Thank you! I\'m very excited about the possibility of joining your team.', time: '10:22 AM' },
      { id: 'm4', sender: 'me', text: 'We\'d like to invite you for an interview. Are you available next week?', time: '10:25 AM' },
      { id: 'm5', sender: 'them', text: 'Thanks for the interview opportunity! I\'m available on Monday and Wednesday afternoon.', time: '10:30 AM' },
    ]
  };
  
  return (
    <DashboardLayout userType="employer">
      <div className="flex h-[calc(100vh-160px)]">
        {/* Conversations List */}
        <div className="w-1/3 border-r pr-4">
          <div className="mb-4">
            <h2 className="text-2xl font-bold tracking-tight">Messages</h2>
            <p className="text-muted-foreground">
              Chat with candidates
            </p>
          </div>
          
          <div className="mb-4">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Search conversations..."
                className="w-full pl-8"
              />
            </div>
          </div>
          
          <div className="space-y-2">
            {conversations.map((conversation) => (
              <div 
                key={conversation.id} 
                className={`flex items-center space-x-3 p-3 rounded-md cursor-pointer hover:bg-gray-100 ${conversation.id === currentChat.id ? 'bg-gray-100' : ''}`}
              >
                <Avatar>
                  <AvatarFallback>{conversation.name[0]}</AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between">
                    <p className="font-medium truncate">{conversation.name}</p>
                    <p className="text-xs text-muted-foreground">{conversation.time}</p>
                  </div>
                  <p className="text-sm truncate text-muted-foreground">
                    {conversation.lastMessage}
                  </p>
                </div>
                {conversation.unread && (
                  <div className="h-2 w-2 bg-blue-500 rounded-full"></div>
                )}
              </div>
            ))}
          </div>
        </div>
        
        {/* Chat Window */}
        <div className="flex-1 flex flex-col">
          {/* Chat Header */}
          <div className="p-4 border-b">
            <div className="flex items-center space-x-3">
              <Avatar>
                <AvatarFallback>{currentChat.name[0]}</AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium">{currentChat.name}</p>
                <p className="text-sm text-muted-foreground">{currentChat.position}</p>
              </div>
            </div>
          </div>
          
          {/* Messages */}
          <div className="flex-1 p-4 overflow-y-auto space-y-4">
            {currentChat.messages.map((message) => (
              <div 
                key={message.id} 
                className={`flex ${message.sender === 'me' ? 'justify-end' : 'justify-start'}`}
              >
                <div 
                  className={`max-w-[70%] p-3 rounded-lg ${
                    message.sender === 'me' 
                      ? 'bg-blue-500 text-white rounded-br-none' 
                      : 'bg-gray-100 rounded-bl-none'
                  }`}
                >
                  <p>{message.text}</p>
                  <p className={`text-xs mt-1 ${message.sender === 'me' ? 'text-blue-100' : 'text-gray-500'}`}>
                    {message.time}
                  </p>
                </div>
              </div>
            ))}
          </div>
          
          {/* Message Input */}
          <div className="p-4 border-t">
            <div className="flex space-x-2">
              <Input 
                placeholder="Type a message..."
                className="flex-1"
              />
              <Button size="icon">
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default EmployerMessages;
