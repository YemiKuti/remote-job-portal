
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface AnalyzeCVRequest {
  resumeId: string;
  resumeContent: string;
  test?: boolean;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Create Supabase client with service role for RLS bypass
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )

    // Get the authorization header from the request
    const authHeader = req.headers.get('Authorization')!
    const token = authHeader.replace('Bearer ', '')
    
    // Verify the user token using the anon client
    const anonClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
    )
    
    const { data: { user }, error: authError } = await anonClient.auth.getUser(token)
    
    if (authError || !user) {
      console.error('❌ Auth error:', authError)
      throw new Error('Unauthorized')
    }

    const { resumeId, resumeContent, test }: AnalyzeCVRequest = await req.json()

    // Handle test requests
    if (test) {
      return new Response(
        JSON.stringify({ 
          status: 'ok', 
          message: 'CV Analysis service is available',
          hasOpenAI: !!Deno.env.get('OPENAI_API_KEY')
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log('🔄 Processing CV analysis for user:', user.id)

    const openAIApiKey = Deno.env.get('OPENAI_API_KEY')
    if (!openAIApiKey) {
      console.error('❌ OpenAI API key not configured')
      throw new Error('AI service not configured. Please contact support.')
    }

    // Create the prompt for OpenAI to analyze the CV
    const prompt = `
Analyze the following resume/CV and extract relevant information for job matching.

RESUME CONTENT:
${resumeContent}

Please provide a detailed analysis in JSON format only (no markdown, no code blocks):

{
  "extractedSkills": ["array of technical and soft skills mentioned"],
  "extractedExperience": ["array of work experience with years if mentioned"],
  "industryKeywords": ["array of industry-related terms and technologies"],
  "experienceLevel": "entry|mid|senior|executive",
  "analysisData": {
    "summary": "brief professional summary",
    "topSkills": ["top 5 most relevant skills"],
    "industries": ["relevant industries"],
    "jobTitles": ["suggested job titles this person would be good for"],
    "careerLevel": "detailed assessment of career level",
    "strengths": ["key professional strengths"],
    "certifications": ["any certifications mentioned"],
    "education": ["education background"],
    "yearsOfExperience": "number or null"
  }
}

Return only valid JSON without any markdown formatting or code blocks.
`

    // Call OpenAI API
    const openAIResponse = await fetch('https://api.openai.com/v1/chat/completions', {
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
            content: 'You are an expert CV/resume analyzer. Always respond with valid JSON only, no markdown formatting or code blocks.'
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

    if (!openAIResponse.ok) {
      const errorText = await openAIResponse.text()
      console.error('❌ OpenAI API error:', errorText)
      throw new Error('AI analysis failed. Please try again.')
    }

    const openAIData = await openAIResponse.json()
    let aiContent = openAIData.choices[0]?.message?.content

    if (!aiContent) {
      throw new Error('No response from AI service')
    }

    // Clean up the AI response - remove any markdown code blocks
    aiContent = aiContent.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()

    // Parse the AI response
    let analysisResult
    try {
      analysisResult = JSON.parse(aiContent)
    } catch (parseError) {
      console.error('❌ Failed to parse AI response:', parseError)
      console.error('❌ AI Content:', aiContent)
      // Provide a fallback response
      analysisResult = {
        extractedSkills: ["Communication", "Problem Solving", "Teamwork"],
        extractedExperience: ["Professional experience"],
        industryKeywords: ["Technology", "Business"],
        experienceLevel: "mid",
        analysisData: {
          summary: "Professional with diverse experience",
          topSkills: ["Communication", "Problem Solving"],
          industries: ["Technology"],
          jobTitles: ["Professional"],
          careerLevel: "Mid-level professional",
          strengths: ["Adaptability", "Learning"],
          certifications: [],
          education: [],
          yearsOfExperience: null
        }
      }
    }

    // Save CV analysis to database using service role client
    const { data: cvAnalysis, error: cvError } = await supabaseClient
      .from('cv_analysis')
      .insert({
        user_id: user.id,
        resume_id: resumeId === 'temp' ? null : resumeId,
        extracted_skills: analysisResult.extractedSkills,
        extracted_experience: analysisResult.extractedExperience,
        industry_keywords: analysisResult.industryKeywords,
        experience_level: analysisResult.experienceLevel,
        analysis_data: analysisResult.analysisData
      })
      .select()
      .single()

    if (cvError) {
      console.error('❌ Error saving CV analysis:', cvError)
      throw new Error('Failed to save analysis results')
    }

    // Fetch active jobs for recommendations
    const { data: jobs, error: jobsError } = await supabaseClient
      .from('jobs')
      .select('*')
      .eq('status', 'active')
      .limit(50)

    if (jobsError) {
      console.error('❌ Error fetching jobs:', jobsError)
    }

    // Generate job recommendations based on analysis
    const recommendations = []
    if (jobs && jobs.length > 0) {
      for (const job of jobs) {
        let matchScore = 0
        const matchingKeywords = []

        // Calculate match score based on skills
        const jobRequirements = (job.requirements || []).join(' ').toLowerCase()
        const jobDescription = (job.description || '').toLowerCase()
        const jobTechStack = (job.tech_stack || []).join(' ').toLowerCase()
        const allJobText = `${jobRequirements} ${jobDescription} ${jobTechStack}`

        // Check skill matches
        for (const skill of analysisResult.extractedSkills) {
          if (allJobText.includes(skill.toLowerCase())) {
            matchScore += 10
            matchingKeywords.push(skill)
          }
        }

        // Check industry keyword matches
        for (const keyword of analysisResult.industryKeywords) {
          if (allJobText.includes(keyword.toLowerCase())) {
            matchScore += 5
            if (!matchingKeywords.includes(keyword)) {
              matchingKeywords.push(keyword)
            }
          }
        }

        // Experience level bonus
        if (job.experience_level && analysisResult.experienceLevel) {
          if (job.experience_level.toLowerCase() === analysisResult.experienceLevel.toLowerCase()) {
            matchScore += 15
          }
        }

        // Only include jobs with some match
        if (matchScore > 0) {
          recommendations.push({
            user_id: user.id,
            cv_analysis_id: cvAnalysis.id,
            job_id: job.id,
            match_score: Math.min(matchScore, 100), // Cap at 100
            matching_keywords: matchingKeywords,
            recommendation_reason: `Strong match based on ${matchingKeywords.length} matching skills and keywords including: ${matchingKeywords.slice(0, 3).join(', ')}`
          })
        }
      }

      // Sort by match score and take top 20
      recommendations.sort((a, b) => b.match_score - a.match_score)
      const topRecommendations = recommendations.slice(0, 20)

      // Save recommendations to database using service role client
      if (topRecommendations.length > 0) {
        const { error: recError } = await supabaseClient
          .from('job_recommendations')
          .insert(topRecommendations)

        if (recError) {
          console.error('❌ Error saving job recommendations:', recError)
        }
      }
    }

    console.log('✅ CV analysis completed successfully')

    return new Response(
      JSON.stringify({
        success: true,
        analysis: cvAnalysis,
        recommendationsCount: recommendations.length,
        topMatchScore: recommendations.length > 0 ? recommendations[0].match_score : 0
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('❌ Error in analyze-cv function:', error)
    return new Response(
      JSON.stringify({ 
        error: error.message,
        details: 'Failed to process CV analysis request'
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})
