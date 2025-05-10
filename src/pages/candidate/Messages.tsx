
import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from '@/components/ui/separator';
import { Search, Send, Loader2 } from 'lucide-react';
import { fetchConversations, fetchMessages, Message, Conversation } from '@/utils/dataFetching';
import { useAuth } from '@/components/AuthProvider';

const CandidateMessages = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [activeConversation, setActiveConversation] = useState<Conversation | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [newMessage, setNewMessage] = useState('');
  
  useEffect(() => {
    const loadConversations = async () => {
      if (!user) return;
      
      setLoading(true);
      const convs = await fetchConversations(user.id, 'candidate');
      setConversations(convs);
      
      if (convs.length > 0) {
        setActiveConversation(convs[0]);
        const msgs = await fetchMessages(convs[0].id);
        setMessages(msgs);
      }
      
      setLoading(false);
    };
    
    loadConversations();
  }, [user]);
  
  const handleConversationClick = async (conversation: Conversation) => {
    setActiveConversation(conversation);
    const msgs = await fetchMessages(conversation.id);
    setMessages(msgs);
  };
  
  const handleSendMessage = async () => {
    if (!newMessage.trim() || !activeConversation || !user) return;
    
    // In a real app, you would save this to the database
    const message = {
      id: `temp-${Date.now()}`,
      conversation_id: activeConversation.id,
      sender_id: user.id,
      recipient_id: activeConversation.employer_id,
      content: newMessage,
      sent_at: new Date().toISOString(),
      read: false,
      sender_name: user.user_metadata?.full_name || user.user_metadata?.username || 'Me'
    };
    
    setMessages([...messages, message]);
    setNewMessage('');
    
    // In a real app, you would save the message to the database here
  };
  
  const filteredConversations = conversations.filter(conv => {
    const employerName = conv.employer_name?.toLowerCase() || '';
    const company = conv.company?.toLowerCase() || '';
    const searchTermLower = searchTerm.toLowerCase();
    return employerName.includes(searchTermLower) || company.includes(searchTermLower);
  });
  
  if (loading) {
    return (
      <DashboardLayout userType="candidate">
        <div className="flex items-center justify-center h-[calc(100vh-8rem)]">
          <Loader2 className="h-12 w-12 animate-spin text-muted-foreground" />
        </div>
      </DashboardLayout>
    );
  }
  
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
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
              <ScrollArea className="flex-grow">
                <div className="space-y-0">
                  {filteredConversations.length > 0 ? (
                    filteredConversations.map((conversation) => (
                      <React.Fragment key={conversation.id}>
                        <div 
                          className={`p-3 flex items-start cursor-pointer hover:bg-gray-100 ${activeConversation?.id === conversation.id ? 'bg-gray-100' : ''}`}
                          onClick={() => handleConversationClick(conversation)}
                        >
                          <Avatar className="h-10 w-10">
                            <AvatarFallback>{conversation.employer_name?.[0] || 'E'}</AvatarFallback>
                          </Avatar>
                          <div className="ml-3 flex-1 overflow-hidden">
                            <div className="flex items-baseline justify-between">
                              <div className="font-medium truncate max-w-[120px]">
                                {conversation.employer_name || 'Employer'}
                              </div>
                              <div className="text-xs text-muted-foreground whitespace-nowrap">
                                {new Date(conversation.last_message_at).toLocaleDateString()}
                              </div>
                            </div>
                            <div className="text-sm text-muted-foreground truncate">
                              {conversation.company || 'Company'}
                            </div>
                            <div className="flex justify-between items-center">
                              <div className="text-sm truncate max-w-[180px]">
                                {conversation.last_message || 'No messages yet'}
                              </div>
                              {conversation.unread_count > 0 && (
                                <div className="h-2 w-2 rounded-full bg-blue-500"></div>
                              )}
                            </div>
                          </div>
                        </div>
                        <Separator />
                      </React.Fragment>
                    ))
                  ) : (
                    <div className="p-4 text-center text-muted-foreground">
                      No conversations found
                    </div>
                  )}
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
                    <AvatarFallback>{activeConversation.employer_name?.[0] || 'E'}</AvatarFallback>
                  </Avatar>
                  <div className="ml-3">
                    <div className="font-medium">{activeConversation.employer_name || 'Employer'}</div>
                    <div className="text-sm text-muted-foreground">{activeConversation.company || 'Company'}</div>
                  </div>
                </div>
                
                {/* Messages area */}
                <ScrollArea className="flex-grow p-4">
                  <div className="space-y-4">
                    {messages.length > 0 ? (
                      messages.map((message) => (
                        <div 
                          key={message.id}
                          className={`flex ${message.sender_id === user?.id ? 'justify-end' : 'justify-start'}`}
                        >
                          <div className={`flex gap-2 max-w-[70%] ${message.sender_id === user?.id ? 'flex-row-reverse' : ''}`}>
                            {message.sender_id !== user?.id && (
                              <Avatar className="h-8 w-8 mt-1">
                                <AvatarFallback>{message.sender_name?.[0] || 'S'}</AvatarFallback>
                              </Avatar>
                            )}
                            <div>
                              <div 
                                className={`rounded-lg px-4 py-2 inline-block ${
                                  message.sender_id === user?.id ? 'bg-primary text-primary-foreground' : 'bg-muted'
                                }`}
                              >
                                {message.content}
                              </div>
                              <div className="text-xs text-muted-foreground mt-1">
                                {new Date(message.sent_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center mt-8">
                        <p className="text-muted-foreground">No messages yet.</p>
                        <p className="text-muted-foreground text-sm mt-1">Start the conversation!</p>
                      </div>
                    )}
                  </div>
                </ScrollArea>
                
                {/* Message input */}
                <div className="p-3 border-t">
                  <div className="flex gap-2">
                    <Input 
                      placeholder="Type your message..." 
                      className="flex-1" 
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          handleSendMessage();
                        }
                      }}
                    />
                    <Button size="icon" onClick={handleSendMessage}>
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
