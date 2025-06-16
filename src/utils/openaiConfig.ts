
import { supabase } from '@/integrations/supabase/client';

export const validateOpenAISetup = async (): Promise<boolean> => {
  try {
    console.log('🔍 Validating OpenAI setup...');
    
    const { data, error } = await supabase.functions.invoke('analyze-cv', {
      body: { test: true }
    });

    if (error) {
      console.error('❌ OpenAI validation error:', error);
      return false;
    }

    const isValid = data?.status === 'ok' && data?.hasOpenAI === true;
    console.log('✅ OpenAI setup validation result:', isValid);
    
    return isValid;
  } catch (error) {
    console.error('❌ Error validating OpenAI setup:', error);
    return false;
  }
};
