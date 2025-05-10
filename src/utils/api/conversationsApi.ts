
import { supabase } from '@/integrations/supabase/client';
import { Conversation, Message } from '@/types/api';

// Fetch conversations with latest messages
export const fetchConversations = async (userId: string, userRole: 'candidate' | 'employer') => {
  try {
    const idField = userRole === 'candidate' ? 'candidate_id' : 'employer_id';
    
    // First get conversations
    const { data: conversations, error: convError } = await supabase
      .from('conversations')
      .select('*')
      .eq(idField, userId)
      .order('last_message_at', { ascending: false });

    if (convError) throw convError;
    
    // Then get user profiles for each conversation
    const enhancedConversations: Conversation[] = [];
    
    for (const conv of conversations) {
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
        employer_name: employerProfile && !empError ? employerProfile.full_name || employerProfile.username : 'Employer',
        candidate_name: candidateProfile && !candError ? candidateProfile.full_name || candidateProfile.username : 'Candidate',
        company: employerProfile && !empError ? employerProfile.username : undefined, // Using username instead of company_name
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
    // Get messages
    const { data: messages, error: msgError } = await supabase
      .from('messages')
      .select('*')
      .eq('conversation_id', conversationId)
      .order('sent_at', { ascending: true });

    if (msgError) throw msgError;
    
    // Get sender profile for each message
    const enhancedMessages: Message[] = [];
    
    for (const msg of messages) {
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
