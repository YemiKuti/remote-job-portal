import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('🚀 CV Tailoring request received');
    
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const openaiApiKey = Deno.env.get('OPENAI_API_KEY');
    
    if (!openaiApiKey) {
      throw new Error('OpenAI API key not configured');
    }
    
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // Get request data
    const { resumeContent, jobDescription, jobTitle, companyName } = await req.json();
    
    console.log('📄 Processing CV tailoring request:', {
      resumeLength: resumeContent?.length || 0,
      jobDescriptionLength: jobDescription?.length || 0,
      jobTitle: jobTitle || 'Not provided',
      companyName: companyName || 'Not provided'
    });
    
    // Validate input
    if (!resumeContent || !jobDescription) {
      throw new Error('Resume content and job description are required');
    }
    
    // Get user from auth header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('Authorization header required');
    }
    
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      console.error('❌ Auth error:', authError);
      throw new Error('Invalid authentication');
    }
    
    console.log('👤 User authenticated:', user.id);
    
    // Check if user is candidate (not admin or employer)
    const { data: userRoles } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id);
    
    const isAdmin = userRoles?.some(r => r.role === 'admin');
    const isEmployer = userRoles?.some(r => r.role === 'employer');
    
    if (isAdmin || isEmployer) {
      throw new Error('CV tailoring is only available for candidates');
    }
    
    console.log('✅ User role validated as candidate');
    
    // Create AI prompt for CV tailoring
    const prompt = `You are an expert CV tailoring assistant. Please analyze the provided resume and job description, then create a tailored version that maximizes the candidate's match for this specific role.

RESUME CONTENT:
${resumeContent}

JOB DESCRIPTION:
${jobDescription}

JOB TITLE: ${jobTitle || 'Not specified'}
COMPANY: ${companyName || 'Not specified'}

INSTRUCTIONS:
1. Maintain all factual information about the candidate
2. Restructure and reorder content to highlight relevant experience
3. Use keywords from the job description naturally throughout
4. Adjust the professional summary to align with the role
5. Prioritize relevant skills and experience
6. Keep the same format structure but optimize content

Return the tailored resume in the following JSON format:
{
  "tailoredContent": "The complete tailored resume text",
  "matchScore": 85,
  "analysis": {
    "keywordsAdded": ["keyword1", "keyword2"],
    "sectionsOptimized": ["Summary", "Skills", "Experience"],
    "improvementAreas": ["Brief explanation of changes made"]
  }
}`;

    console.log('🤖 Sending request to OpenAI...');
    
    // Call OpenAI API
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { 
            role: 'system', 
            content: 'You are an expert CV tailoring assistant. Always respond with valid JSON format.'
          },
          { role: 'user', content: prompt }
        ],
        temperature: 0.3,
        max_tokens: 2000,
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('❌ OpenAI API error:', errorData);
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const aiResponse = await response.json();
    const aiContent = aiResponse.choices[0].message.content;
    
    console.log('✅ OpenAI response received');
    
    // Parse AI response
    let tailoringResult;
    try {
      tailoringResult = JSON.parse(aiContent);
    } catch (parseError) {
      console.error('❌ Failed to parse AI response:', parseError);
      // Fallback response
      tailoringResult = {
        tailoredContent: aiContent,
        matchScore: 75,
        analysis: {
          keywordsAdded: [],
          sectionsOptimized: ["Content optimized"],
          improvementAreas: ["Resume tailored for job requirements"]
        }
      };
    }
    
    // Store result in tailored_resumes table
    const { data: tailoredResume, error: insertError } = await supabase
      .from('tailored_resumes')
      .insert({
        user_id: user.id,
        tailored_content: tailoringResult.tailoredContent,
        job_title: jobTitle,
        company_name: companyName,
        job_description: jobDescription,
        ai_suggestions: tailoringResult.analysis,
        tailoring_score: tailoringResult.matchScore || 75,
        file_format: 'txt'
      })
      .select()
      .single();
    
    if (insertError) {
      console.error('❌ Error storing tailored resume:', insertError);
      throw new Error('Failed to store tailored resume');
    }
    
    console.log('💾 Tailored resume stored with ID:', tailoredResume.id);
    
    // Return success response
    const result = {
      success: true,
      data: {
        id: tailoredResume.id,
        tailoredContent: tailoringResult.tailoredContent,
        matchScore: tailoringResult.matchScore || 75,
        analysis: tailoringResult.analysis,
        jobTitle: jobTitle,
        companyName: companyName
      }
    };
    
    console.log('✅ CV tailoring completed successfully');
    
    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
    
  } catch (error: any) {
    console.error('❌ CV tailoring error:', error);
    
    return new Response(JSON.stringify({ 
      success: false, 
      error: error.message || 'CV tailoring failed'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});