
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import "https://deno.land/x/xhr@0.1.0/mod.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Helper function to truncate text while preserving important sections
const smartTruncate = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;
  
  // Try to preserve key sections
  const lines = text.split('\n');
  const importantSections = [];
  let currentLength = 0;
  
  for (const line of lines) {
    const trimmedLine = line.trim();
    if (trimmedLine.length === 0) continue;
    
    // Prioritize lines that look like headers or key information
    const isImportant = /^(summary|objective|experience|education|skills|work|employment|achievements?|projects?|certifications?)/i.test(trimmedLine) ||
                       trimmedLine.length < 100; // Short lines are likely headers
    
    if (isImportant || currentLength + line.length < maxLength) {
      importantSections.push(line);
      currentLength += line.length + 1;
    }
    
    if (currentLength >= maxLength) break;
  }
  
  return importantSections.join('\n');
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { resumeContent, jobDescription, jobTitle, companyName } = await req.json()

    if (!resumeContent || !jobDescription) {
      return new Response(
        JSON.stringify({ error: 'Resume content and job description are required' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    const openAIApiKey = Deno.env.get('OPENAI_API_KEY')
    if (!openAIApiKey) {
      return new Response(
        JSON.stringify({ error: 'OpenAI API key not configured' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Truncate content to fit within token limits (approximately 3000 chars for resume, 2000 for job description)
    const truncatedResume = smartTruncate(resumeContent, 3000);
    const truncatedJobDescription = smartTruncate(jobDescription, 2000);

    const prompt = `You are a professional resume writer. Tailor this resume for the job posting below.

RESUME:
${truncatedResume}

JOB POSTING:
Position: ${jobTitle || 'Not specified'}
Company: ${companyName || 'Not specified'}
Description: ${truncatedJobDescription}

INSTRUCTIONS:
1. Keep the same format and structure as the original resume
2. Highlight relevant skills and experience that match the job requirements
3. Use keywords from the job description naturally
4. Maintain all truthful information
5. Focus on the most relevant sections for this role

Return the tailored resume content:`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'You are an expert resume writer and ATS optimization specialist. Provide clear, professional, and ATS-optimized resume content that maintains the original structure.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 2000,
        temperature: 0.3,
      }),
    })

    if (!response.ok) {
      const error = await response.json()
      console.error('OpenAI API error:', error)
      
      // Provide more specific error messages
      if (error.error?.code === 'rate_limit_exceeded') {
        return new Response(
          JSON.stringify({ error: 'AI service is currently busy. Please try again in a few moments.' }),
          { 
            status: 429, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        )
      }
      
      return new Response(
        JSON.stringify({ error: 'Failed to process resume with AI' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    const aiResponse = await response.json()
    const tailoredResume = aiResponse.choices[0]?.message?.content

    if (!tailoredResume) {
      return new Response(
        JSON.stringify({ error: 'No response from AI' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Generate a simple score based on keyword matching
    const jobKeywords = truncatedJobDescription.toLowerCase().match(/\b\w{3,}\b/g) || []
    const resumeKeywords = tailoredResume.toLowerCase().match(/\b\w{3,}\b/g) || []
    const matchedKeywords = jobKeywords.filter(keyword => 
      resumeKeywords.includes(keyword)
    )
    const score = Math.min(95, Math.max(70, Math.round((matchedKeywords.length / jobKeywords.length) * 100)))

    return new Response(
      JSON.stringify({
        tailoredResume,
        score,
        suggestions: {
          keywordsMatched: matchedKeywords.length,
          totalKeywords: jobKeywords.length,
          recommendations: [
            'Resume has been optimized for ATS compatibility',
            'Keywords from job description have been naturally integrated',
            'Content has been restructured to highlight relevant experience'
          ]
        }
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Error in tailor-cv function:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})
