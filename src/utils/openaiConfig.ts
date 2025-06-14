
import { supabase } from '@/integrations/supabase/client';

export interface OpenAIConfig {
  apiKey: string;
  model: string;
  maxTokens: number;
  temperature: number;
}

export const getOpenAIConfig = async (): Promise<OpenAIConfig> => {
  try {
    // In production, the API key should be stored in Supabase secrets
    // and accessed via an edge function for security
    const defaultConfig: OpenAIConfig = {
      apiKey: '', // Will be set via edge function
      model: 'gpt-4',
      maxTokens: 2000,
      temperature: 0.7
    };
    
    return defaultConfig;
  } catch (error) {
    console.error('❌ Error getting OpenAI config:', error);
    throw new Error('Failed to load AI configuration');
  }
};

export const validateOpenAISetup = async (): Promise<boolean> => {
  try {
    // Test if the tailor-cv edge function is available and configured
    const { data, error } = await supabase.functions.invoke('tailor-cv', {
      body: { test: true }
    });
    
    if (error) {
      console.error('❌ OpenAI setup validation failed:', error);
      return false;
    }
    
    console.log('✅ OpenAI setup is valid');
    return true;
  } catch (error) {
    console.error('❌ Error validating OpenAI setup:', error);
    return false;
  }
};
