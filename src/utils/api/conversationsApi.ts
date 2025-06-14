import { supabase } from '@/integrations/supabase/client';
import { Conversation, Message } from '@/types/api';

// Fetch conversations with latest messages
export const fetchConversations = async (userId: string, userRole: 'candidate' | 'employer') => {
  try {
    // Use the RLS-enabled query to get conversations for the current user
    const { data: conversations, error: convError } = await supabase
      .from('conversations')
      .select('*')
      .order('last_message_at', { ascending: false });

    if (convError) throw convError;
    
    // Then get user profiles for each conversation
    const enhancedConversations: Conversation[] = [];
    
    for (const conv of conversations || []) {
      // Get employer profile
      const { data: employerProfile, error: empError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', conv.employer_id)
        .single();
        
      // Get candidate profile
      const { data: candidateProfile, error: candError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', conv.candidate_id)
        .single();
        
      enhancedConversations.push({
        ...conv,
        created_at: conv.last_message_at, // Use last_message_at as created_at if not available
        employer_name: employerProfile && !empError ? employerProfile.full_name || employerProfile.username : 'Employer',
        candidate_name: candidateProfile && !candError ? candidateProfile.full_name || candidateProfile.username : 'Candidate',
        company: employerProfile && !empError ? employerProfile.username : undefined,
      });
    }
    
    return enhancedConversations;
  } catch (error: any) {
    console.error('Error fetching conversations:', error);
    return [];
  }
};

// Fetch messages for a conversation
export const fetchMessages = async (conversationId: string) => {
  try {
    // Get messages using RLS-enabled query
    const { data: messages, error: msgError } = await supabase
      .from('messages')
      .select('*')
      .eq('conversation_id', conversationId)
      .order('sent_at', { ascending: true });

    if (msgError) throw msgError;
    
    // Get sender profile for each message
    const enhancedMessages: Message[] = [];
    
    for (const msg of messages || []) {
      const { data: senderProfile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', msg.sender_id)
        .single();
        
      enhancedMessages.push({
        ...msg,
        sender_name: senderProfile && !profileError ? senderProfile.full_name || senderProfile.username : 'User'
      });
    }
    
    return enhancedMessages;
  } catch (error: any) {
    console.error('Error fetching messages:', error);
    return [];
  }
};

// Create or find a conversation between two users
export const createOrFindConversation = async (
  otherUserId: string,
  currentUserRole: 'candidate' | 'employer' = 'candidate'
) => {
  try {
    // Get the current user ID
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      throw new Error('User not authenticated');
    }

    const { data: conversationId, error } = await supabase.rpc('find_or_create_conversation', {
      user1_id: user.id,
      user2_id: otherUserId,
      user1_role: currentUserRole,
      user2_role: currentUserRole === 'candidate' ? 'employer' : 'candidate'
    });

    if (error) throw error;
    return conversationId;
  } catch (error: any) {
    console.error('Error creating/finding conversation:', error);
    throw error;
  }
};

// Send a message using the database function with optional attachment
export const sendMessage = async (
  conversationId: string,
  recipientId: string,
  content: string,
  attachment?: {
    url: string;
    name: string;
    size: number;
  }
) => {
  try {
    const { data: messageId, error } = await supabase.rpc('send_message', {
      conversation_id: conversationId,
      recipient_id: recipientId,
      message_content: content,
      attachment_url: attachment?.url || null,
      attachment_name: attachment?.name || null,
      attachment_size: attachment?.size || null
    });

    if (error) throw error;
    return messageId;
  } catch (error: any) {
    console.error('Error sending message:', error);
    throw error;
  }
};

// Mark messages as read
export const markMessagesAsRead = async (conversationId: string) => {
  try {
    const { data, error } = await supabase.rpc('mark_messages_read', {
      conv_id: conversationId
    });

    if (error) throw error;
    return data;
  } catch (error: any) {
    console.error('Error marking messages as read:', error);
    throw error;
  }
};

// Mark messages as seen - NEW FUNCTION
export const markMessagesAsSeen = async (conversationId: string) => {
  try {
    const { data, error } = await supabase.rpc('mark_messages_seen', {
      conv_id: conversationId
    });

    if (error) throw error;
    return data;
  } catch (error: any) {
    console.error('Error marking messages as seen:', error);
    throw error;
  }
};
