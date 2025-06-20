
export const validateOpenAISetup = async (): Promise<boolean> => {
  try {
    console.log('🔍 Validating OpenAI setup...');
    
    // Test the edge function to see if OpenAI is configured
    const { data, error } = await fetch('/api/test-openai', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ test: true })
    }).then(res => res.json()).catch(() => ({ error: 'Network error' }));
    
    if (error && error.includes('not configured')) {
      console.log('❌ OpenAI API key not configured');
      return false;
    }
    
    console.log('✅ OpenAI setup validated');
    return true;
  } catch (error) {
    console.error('❌ Error validating OpenAI setup:', error);
    return false;
  }
};

export const getOpenAIModels = () => {
  return {
    'gpt-4o-mini': 'Fast and efficient model for resume tailoring',
    'gpt-4o': 'More powerful model for complex tailoring tasks'
  };
};
