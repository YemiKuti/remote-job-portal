
import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Search, Send, Loader2 } from 'lucide-react';
import { 
  fetchConversations, 
  fetchMessages, 
  sendMessage, 
  markMessagesAsRead 
} from '@/utils/api/conversationsApi';
import { useAuth } from '@/components/AuthProvider';
import { toast } from 'sonner';
import type { Conversation, Message } from '@/types/api';

const EmployerMessages = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [activeConversation, setActiveConversation] = useState<Conversation | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [newMessage, setNewMessage] = useState('');
  
  useEffect(() => {
    const loadConversations = async () => {
      if (!user) return;
      
      setLoading(true);
      try {
        const convs = await fetchConversations(user.id, 'employer');
        setConversations(convs);
        
        if (convs.length > 0) {
          setActiveConversation(convs[0]);
          const msgs = await fetchMessages(convs[0].id);
          setMessages(msgs);
          // Mark messages as read when viewing conversation
          await markMessagesAsRead(convs[0].id);
        }
      } catch (error) {
        console.error('Error loading conversations:', error);
        toast.error('Failed to load conversations');
      }
      
      setLoading(false);
    };
    
    loadConversations();
  }, [user]);
  
  const handleConversationClick = async (conversation: Conversation) => {
    setActiveConversation(conversation);
    try {
      const msgs = await fetchMessages(conversation.id);
      setMessages(msgs);
      // Mark messages as read when viewing conversation
      await markMessagesAsRead(conversation.id);
      
      // Update conversation's unread count in local state
      setConversations(prev => 
        prev.map(conv => 
          conv.id === conversation.id 
            ? { ...conv, unread_count: 0 }
            : conv
        )
      );
    } catch (error) {
      console.error('Error loading messages:', error);
      toast.error('Failed to load messages');
    }
  };
  
  const handleSendMessage = async () => {
    if (!newMessage.trim() || !activeConversation || !user || sending) return;
    
    setSending(true);
    try {
      // Send message to database
      await sendMessage(
        activeConversation.id,
        activeConversation.candidate_id,
        newMessage
      );
      
      // Reload messages to show the new message
      const updatedMessages = await fetchMessages(activeConversation.id);
      setMessages(updatedMessages);
      setNewMessage('');
      
      // Update conversation's last message in local state
      setConversations(prev => 
        prev.map(conv => 
          conv.id === activeConversation.id 
            ? { 
                ...conv, 
                last_message: newMessage,
                last_message_at: new Date().toISOString()
              }
            : conv
        )
      );
      
      toast.success('Message sent successfully');
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message');
    }
    setSending(false);
  };
  
  const filteredConversations = conversations.filter(conv => {
    const candidateName = conv.candidate_name?.toLowerCase() || '';
    const searchTermLower = searchTerm.toLowerCase();
    return candidateName.includes(searchTermLower);
  });
  
  if (loading) {
    return (
      <DashboardLayout userType="employer">
        <div className="flex items-center justify-center h-[calc(100vh-8rem)]">
          <Loader2 className="h-12 w-12 animate-spin text-muted-foreground" />
        </div>
      </DashboardLayout>
    );
  }
  
  return (
    <DashboardLayout userType="employer">
      <div className="h-[calc(100vh-160px)]">
        <div className="flex h-full">
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
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            
            <div className="space-y-2">
              {filteredConversations.length > 0 ? (
                filteredConversations.map((conversation) => (
                  <div 
                    key={conversation.id} 
                    className={`flex items-center space-x-3 p-3 rounded-md cursor-pointer hover:bg-gray-100 ${conversation.id === activeConversation?.id ? 'bg-gray-100' : ''}`}
                    onClick={() => handleConversationClick(conversation)}
                  >
                    <Avatar>
                      <AvatarFallback>{(conversation.candidate_name || 'C')[0]}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between">
                        <p className="font-medium truncate">{conversation.candidate_name || 'Candidate'}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(conversation.last_message_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                      <p className="text-sm truncate text-muted-foreground">
                        {conversation.last_message || 'No messages yet'}
                      </p>
                    </div>
                    {conversation.unread_count > 0 && (
                      <div className="h-2 w-2 bg-blue-500 rounded-full"></div>
                    )}
                  </div>
                ))
              ) : (
                <div className="text-center py-6">
                  <p className="text-muted-foreground">No conversations found</p>
                </div>
              )}
            </div>
          </div>
          
          {/* Chat Window */}
          <div className="flex-1 flex flex-col">
            {activeConversation ? (
              <>
                {/* Chat Header */}
                <div className="p-4 border-b">
                  <div className="flex items-center space-x-3">
                    <Avatar>
                      <AvatarFallback>{(activeConversation.candidate_name || 'C')[0]}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{activeConversation.candidate_name || 'Candidate'}</p>
                      <p className="text-sm text-muted-foreground">Applicant</p>
                    </div>
                  </div>
                </div>
                
                {/* Messages */}
                <div className="flex-1 p-4 overflow-y-auto space-y-4">
                  {messages.length > 0 ? (
                    messages.map((message) => (
                      <div 
                        key={message.id} 
                        className={`flex ${message.sender_id === user?.id ? 'justify-end' : 'justify-start'}`}
                      >
                        <div 
                          className={`max-w-[70%] p-3 rounded-lg ${
                            message.sender_id === user?.id 
                              ? 'bg-blue-500 text-white rounded-br-none' 
                              : 'bg-gray-100 rounded-bl-none'
                          }`}
                        >
                          <p>{message.content}</p>
                          <p className={`text-xs mt-1 ${message.sender_id === user?.id ? 'text-blue-100' : 'text-gray-500'}`}>
                            {new Date(message.sent_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center pt-8">
                      <p className="text-muted-foreground">No messages in this conversation yet.</p>
                      <p className="text-sm text-muted-foreground mt-2">Start the conversation with this candidate!</p>
                    </div>
                  )}
                </div>
                
                {/* Message Input */}
                <div className="p-4 border-t">
                  <div className="flex space-x-2">
                    <Input 
                      placeholder="Type a message..."
                      className="flex-1"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          handleSendMessage();
                        }
                      }}
                      disabled={sending}
                    />
                    <Button 
                      size="icon" 
                      onClick={handleSendMessage}
                      disabled={sending || !newMessage.trim()}
                    >
                      {sending ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Send className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <p className="text-muted-foreground">Select a conversation</p>
                  <p className="text-sm text-muted-foreground mt-2">or start a new one</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default EmployerMessages;
