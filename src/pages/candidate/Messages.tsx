
import React from 'react';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from '@/components/ui/separator';
import { Search, Send } from 'lucide-react';

// Mock data for conversations
const conversations = [
  { 
    id: 1, 
    name: 'Sarah Johnson', 
    company: 'Tech Solutions Ltd', 
    avatar: '/placeholder.svg',
    lastMessage: 'Thanks for your application! We would like to schedule an interview.',
    time: '10:45 AM',
    unread: true
  },
  { 
    id: 2, 
    name: 'Michael Wong', 
    company: 'Creative Designs', 
    avatar: '/placeholder.svg',
    lastMessage: 'Could you provide more details about your experience with React?',
    time: 'Yesterday',
    unread: false
  },
  { 
    id: 3, 
    name: 'Priya Sharma', 
    company: 'DataSystems', 
    avatar: '/placeholder.svg',
    lastMessage: 'Your resume looks great. Are you available for a call next week?',
    time: 'May 1',
    unread: false
  },
  { 
    id: 4, 
    name: 'John Okafor', 
    company: 'CloudTech Africa', 
    avatar: '/placeholder.svg',
    lastMessage: 'We are reviewing your application and will get back to you soon.',
    time: 'Apr 28',
    unread: false
  }
];

// Mock messages for a conversation
const messages = [
  {
    id: 1,
    sender: 'Sarah Johnson',
    content: 'Hello! Thanks for your application to the Frontend Developer position at Tech Solutions.',
    time: '10:30 AM',
    isSender: false,
    avatar: '/placeholder.svg'
  },
  {
    id: 2,
    sender: 'Me',
    content: 'Thank you for considering my application! I am very interested in the position.',
    time: '10:32 AM',
    isSender: true,
    avatar: '/placeholder.svg'
  },
  {
    id: 3,
    sender: 'Sarah Johnson',
    content: 'We are impressed with your portfolio and experience. Would you be available for an interview this Thursday or Friday?',
    time: '10:40 AM',
    isSender: false,
    avatar: '/placeholder.svg'
  },
  {
    id: 4,
    sender: 'Me',
    content: 'I would be available this Friday afternoon. What time works best for you?',
    time: '10:43 AM',
    isSender: true,
    avatar: '/placeholder.svg'
  },
  {
    id: 5,
    sender: 'Sarah Johnson',
    content: 'Great! How about 2:00 PM (EAT) on Friday? We can do a video call via Zoom.',
    time: '10:45 AM',
    isSender: false,
    avatar: '/placeholder.svg'
  },
];

const CandidateMessages = () => {
  const [activeConversation, setActiveConversation] = React.useState(conversations[0]);
  
  return (
    <DashboardLayout userType="candidate">
      <div className="h-[calc(100vh-8rem)]">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 h-full">
          {/* Conversations list */}
          <Card className="md:col-span-1 overflow-hidden">
            <CardContent className="p-0 flex flex-col h-[calc(100vh-8rem)]">
              <div className="p-3 border-b">
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search messages"
                    className="pl-8"
                  />
                </div>
              </div>
              <ScrollArea className="flex-grow">
                <div className="space-y-0">
                  {conversations.map((conversation) => (
                    <React.Fragment key={conversation.id}>
                      <div 
                        className={`p-3 flex items-start cursor-pointer hover:bg-gray-100 ${activeConversation?.id === conversation.id ? 'bg-gray-100' : ''}`}
                        onClick={() => setActiveConversation(conversation)}
                      >
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={conversation.avatar} />
                          <AvatarFallback>{conversation.name[0]}</AvatarFallback>
                        </Avatar>
                        <div className="ml-3 flex-1 overflow-hidden">
                          <div className="flex items-baseline justify-between">
                            <div className="font-medium truncate max-w-[120px]">
                              {conversation.name}
                            </div>
                            <div className="text-xs text-muted-foreground whitespace-nowrap">
                              {conversation.time}
                            </div>
                          </div>
                          <div className="text-sm text-muted-foreground truncate">
                            {conversation.company}
                          </div>
                          <div className="flex justify-between items-center">
                            <div className="text-sm truncate max-w-[180px]">
                              {conversation.lastMessage}
                            </div>
                            {conversation.unread && (
                              <div className="h-2 w-2 rounded-full bg-blue-500"></div>
                            )}
                          </div>
                        </div>
                      </div>
                      <Separator />
                    </React.Fragment>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
          
          {/* Messages */}
          <Card className="md:col-span-2 overflow-hidden">
            {activeConversation ? (
              <CardContent className="p-0 flex flex-col h-[calc(100vh-8rem)]">
                {/* Header */}
                <div className="p-3 border-b flex items-center">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={activeConversation.avatar} />
                    <AvatarFallback>{activeConversation.name[0]}</AvatarFallback>
                  </Avatar>
                  <div className="ml-3">
                    <div className="font-medium">{activeConversation.name}</div>
                    <div className="text-sm text-muted-foreground">{activeConversation.company}</div>
                  </div>
                </div>
                
                {/* Messages area */}
                <ScrollArea className="flex-grow p-4">
                  <div className="space-y-4">
                    {messages.map((message) => (
                      <div 
                        key={message.id}
                        className={`flex ${message.isSender ? 'justify-end' : 'justify-start'}`}
                      >
                        <div className={`flex gap-2 max-w-[70%] ${message.isSender ? 'flex-row-reverse' : ''}`}>
                          {!message.isSender && (
                            <Avatar className="h-8 w-8 mt-1">
                              <AvatarImage src={message.avatar} />
                              <AvatarFallback>{message.sender[0]}</AvatarFallback>
                            </Avatar>
                          )}
                          <div>
                            <div 
                              className={`rounded-lg px-4 py-2 inline-block ${
                                message.isSender ? 'bg-primary text-primary-foreground' : 'bg-muted'
                              }`}
                            >
                              {message.content}
                            </div>
                            <div className="text-xs text-muted-foreground mt-1">
                              {message.time}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
                
                {/* Message input */}
                <div className="p-3 border-t">
                  <div className="flex gap-2">
                    <Input placeholder="Type your message..." className="flex-1" />
                    <Button size="icon">
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            ) : (
              <CardContent className="flex items-center justify-center h-full">
                <div className="text-center text-muted-foreground">
                  <p>Select a conversation to start messaging</p>
                </div>
              </CardContent>
            )}
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default CandidateMessages;
