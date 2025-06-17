
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import "https://deno.land/x/xhr@0.1.0/mod.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

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

    const prompt = `You are a professional resume writer and ATS optimization expert. Your task is to tailor a resume for a specific job posting to maximize ATS compatibility and recruiter appeal.

ORIGINAL RESUME:
${resumeContent}

JOB POSTING:
Position: ${jobTitle || 'Not specified'}
Company: ${companyName || 'Not specified'}
Description: ${jobDescription}

INSTRUCTIONS:
1. Analyze the job requirements and extract key skills, technologies, and qualifications
2. Tailor the resume to highlight relevant experience and skills that match the job
3. Optimize keywords for ATS systems while maintaining natural language
4. Restructure content to emphasize most relevant experience first
5. Ensure the resume remains truthful and accurate to the original content
6. Format for maximum ATS compatibility (clear sections, standard headings)
7. Keep the same overall length and structure but optimize content

REQUIREMENTS:
- Maintain professional formatting
- Use standard section headers (Summary, Experience, Education, Skills, etc.)
- Include relevant keywords from the job description naturally
- Emphasize quantifiable achievements
- Ensure ATS-friendly format (no complex formatting, tables, or graphics)

Please provide the tailored resume content that would be most effective for this specific position.`

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: 'You are an expert resume writer and ATS optimization specialist. Provide clear, professional, and ATS-optimized resume content.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 3000,
        temperature: 0.3,
      }),
    })

    if (!response.ok) {
      const error = await response.json()
      console.error('OpenAI API error:', error)
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
    const jobKeywords = jobDescription.toLowerCase().match(/\b\w{3,}\b/g) || []
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
