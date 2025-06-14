
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { resumeContent, jobDescription, jobRequirements, jobTitle } = await req.json()

    const openaiApiKey = Deno.env.get('OPENAI_API_KEY')
    if (!openaiApiKey) {
      throw new Error('OpenAI API key not configured')
    }

    const prompt = `
As an expert resume consultant, analyze this resume against the job requirements and provide tailoring suggestions:

JOB TITLE: ${jobTitle}
JOB DESCRIPTION: ${jobDescription}
JOB REQUIREMENTS: ${JSON.stringify(jobRequirements)}

CURRENT RESUME:
${resumeContent}

Please provide a JSON response with the following structure:
{
  "analysis": {
    "matchScore": "number between 0-100",
    "strengths": ["list of current strengths"],
    "gaps": ["list of missing requirements"],
    "keywords": ["important keywords from job description"]
  },
  "suggestions": {
    "summary": "suggested professional summary tailored to this job",
    "skillsToHighlight": ["skills to emphasize"],
    "experienceAdjustments": [
      {
        "section": "work experience section to modify",
        "suggestion": "how to modify it",
        "reason": "why this change helps"
      }
    ],
    "additionalSections": [
      {
        "title": "section to add",
        "content": "suggested content",
        "reason": "why this helps"
      }
    ]
  },
  "tailoredContent": "complete tailored resume content with improvements applied"
}

Focus on:
1. Matching keywords from the job description
2. Highlighting relevant experience
3. Emphasizing transferable skills
4. Suggesting specific achievements that align with job requirements
5. Optimizing the professional summary for this role
`

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: 'You are an expert resume consultant and career advisor. Provide detailed, actionable advice for tailoring resumes to specific job opportunities.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 4000
      }),
    })

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.statusText}`)
    }

    const aiResponse = await response.json()
    const content = aiResponse.choices[0]?.message?.content

    if (!content) {
      throw new Error('No response from OpenAI')
    }

    // Parse the JSON response from AI
    let analysisResult
    try {
      analysisResult = JSON.parse(content)
    } catch (e) {
      // If JSON parsing fails, create a basic structure
      analysisResult = {
        analysis: {
          matchScore: 70,
          strengths: ["Experience in relevant field"],
          gaps: ["Need to highlight specific skills"],
          keywords: ["Extract from job description"]
        },
        suggestions: {
          summary: content.substring(0, 200) + "...",
          skillsToHighlight: [],
          experienceAdjustments: [],
          additionalSections: []
        },
        tailoredContent: content
      }
    }

    return new Response(
      JSON.stringify(analysisResult),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    )

  } catch (error) {
    console.error('Error in tailor-cv function:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    )
  }
})
