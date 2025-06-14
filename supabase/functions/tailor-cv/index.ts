
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface TailorCVRequest {
  resumeContent: string;
  jobDescription: string;
  jobRequirements: string[];
  jobTitle: string;
  jobCompany?: string;
  test?: boolean;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
    )

    // Get the authorization header from the request
    const authHeader = req.headers.get('Authorization')!
    const token = authHeader.replace('Bearer ', '')
    
    // Set the auth token for the client
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(token)
    
    if (authError || !user) {
      console.error('❌ Auth error:', authError)
      throw new Error('Unauthorized')
    }

    const { 
      resumeContent, 
      jobDescription, 
      jobRequirements, 
      jobTitle, 
      jobCompany,
      test 
    }: TailorCVRequest = await req.json()

    // Handle test requests
    if (test) {
      return new Response(
        JSON.stringify({ 
          status: 'ok', 
          message: 'CV Tailoring service is available',
          hasOpenAI: !!Deno.env.get('OPENAI_API_KEY')
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log('🔄 Processing CV tailoring request for:', jobTitle, 'at', jobCompany)

    const openAIApiKey = Deno.env.get('OPENAI_API_KEY')
    if (!openAIApiKey) {
      console.error('❌ OpenAI API key not configured')
      throw new Error('AI service not configured. Please contact support.')
    }

    // Create the prompt for OpenAI
    const prompt = `
You are an expert resume writer and career coach. Analyze the following resume against a job posting and provide detailed feedback and suggestions.

JOB POSTING:
Title: ${jobTitle}
Company: ${jobCompany || 'Not specified'}
Description: ${jobDescription}
Requirements: ${jobRequirements.join(', ')}

RESUME CONTENT:
${resumeContent}

Please provide a detailed analysis in the following JSON format:
{
  "analysis": {
    "matchScore": [number between 0-100],
    "strengths": [array of strings highlighting what matches well],
    "gaps": [array of strings identifying missing or weak areas],
    "keywords": [array of important keywords from job posting]
  },
  "suggestions": {
    "summary": "A tailored professional summary for this specific role",
    "skillsToHighlight": [array of skills to emphasize],
    "experienceAdjustments": [
      {
        "section": "section name",
        "suggestion": "specific improvement suggestion",
        "reason": "why this change would help"
      }
    ],
    "additionalSections": [
      {
        "title": "section title",
        "content": "suggested content",
        "reason": "why this section would be valuable"
      }
    ]
  },
  "tailoredContent": "A complete, tailored version of the resume optimized for this specific job"
}

Focus on:
1. Keyword optimization for ATS systems
2. Quantifiable achievements and metrics
3. Relevant skills and technologies
4. Industry-specific language
5. Role-specific accomplishments

Provide actionable, specific suggestions that will genuinely improve the candidate's chances.
`

    // Call OpenAI API
    const openAIResponse = await fetch('https://api.openai.com/v1/chat/completions', {
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
            content: 'You are an expert resume writer and career coach. Always respond with valid JSON in the exact format requested.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 3000,
        temperature: 0.7,
      }),
    })

    if (!openAIResponse.ok) {
      const errorText = await openAIResponse.text()
      console.error('❌ OpenAI API error:', errorText)
      throw new Error('AI analysis failed')
    }

    const openAIData = await openAIResponse.json()
    const aiContent = openAIData.choices[0]?.message?.content

    if (!aiContent) {
      throw new Error('No response from AI service')
    }

    // Parse the AI response
    let analysisResult
    try {
      analysisResult = JSON.parse(aiContent)
    } catch (parseError) {
      console.error('❌ Failed to parse AI response:', parseError)
      // Provide a fallback response
      analysisResult = {
        analysis: {
          matchScore: 75,
          strengths: ["Professional experience relevant to the role"],
          gaps: ["Could benefit from more specific keywords"],
          keywords: jobRequirements.slice(0, 5)
        },
        suggestions: {
          summary: `Experienced professional seeking ${jobTitle} position at ${jobCompany}`,
          skillsToHighlight: jobRequirements.slice(0, 3),
          experienceAdjustments: [{
            section: "Professional Experience",
            suggestion: "Add more quantifiable achievements",
            reason: "Numbers and metrics make impact more tangible"
          }],
          additionalSections: []
        },
        tailoredContent: `Tailored resume for ${jobTitle} position:\n\n${resumeContent}`
      }
    }

    console.log('✅ CV tailoring completed successfully')

    return new Response(
      JSON.stringify(analysisResult),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('❌ Error in tailor-cv function:', error)
    return new Response(
      JSON.stringify({ 
        error: error.message,
        details: 'Failed to process CV tailoring request'
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})
