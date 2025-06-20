
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import "https://deno.land/x/xhr@0.1.0/mod.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Enhanced function to extract key skills from resume content
const extractKeySkills = (resumeContent: string): string[] => {
  const skillsSection = resumeContent.toLowerCase();
  const commonSkills = [
    'javascript', 'typescript', 'react', 'node.js', 'python', 'java', 'c++', 'sql',
    'aws', 'azure', 'docker', 'kubernetes', 'git', 'agile', 'scrum', 'leadership',
    'project management', 'communication', 'problem solving', 'teamwork', 'analytical',
    'machine learning', 'data analysis', 'mongodb', 'postgresql', 'express', 'vue',
    'angular', 'php', 'ruby', 'golang', 'swift', 'kotlin', 'flutter', 'react native'
  ];
  
  const foundSkills = commonSkills.filter(skill => 
    skillsSection.includes(skill.toLowerCase())
  );
  
  return foundSkills.slice(0, 8); // Limit to top 8 skills
};

// Enhanced function to extract job requirements and key qualifications
const analyzeJobRequirements = (jobDescription: string): {
  requiredSkills: string[],
  experienceLevel: string,
  keyQualifications: string[]
} => {
  const lowerDesc = jobDescription.toLowerCase();
  
  // Extract required skills
  const skillKeywords = [
    'javascript', 'typescript', 'react', 'node.js', 'python', 'java', 'sql',
    'aws', 'azure', 'docker', 'kubernetes', 'agile', 'leadership', 'management',
    'communication', 'problem solving', 'analytical', 'machine learning', 'data'
  ];
  
  const requiredSkills = skillKeywords.filter(skill => 
    lowerDesc.includes(skill)
  );
  
  // Determine experience level
  let experienceLevel = 'mid-level';
  if (lowerDesc.includes('senior') || lowerDesc.includes('lead') || lowerDesc.includes('principal')) {
    experienceLevel = 'senior';
  } else if (lowerDesc.includes('junior') || lowerDesc.includes('entry') || lowerDesc.includes('graduate')) {
    experienceLevel = 'junior';
  }
  
  // Extract key qualifications
  const qualificationPatterns = [
    /(\d+\+?\s*years?\s*(?:of\s*)?experience)/gi,
    /(bachelor'?s?\s*degree)/gi,
    /(master'?s?\s*degree)/gi,
    /(certification)/gi,
    /(proven track record)/gi
  ];
  
  const keyQualifications: string[] = [];
  qualificationPatterns.forEach(pattern => {
    const matches = jobDescription.match(pattern);
    if (matches) {
      keyQualifications.push(...matches.slice(0, 2));
    }
  });
  
  return { requiredSkills, experienceLevel, keyQualifications };
};

// Enhanced function to format candidate information for AI processing
const formatCandidateInfo = (candidateData: any, resumeContent: string): string => {
  if (!candidateData && !resumeContent) return '';
  
  const extractedSkills = extractKeySkills(resumeContent);
  
  let candidateSection = '\n\nCANDIDATE PROFILE:\n';
  
  // Personal Information
  if (candidateData?.personalInfo) {
    if (candidateData.personalInfo.name) {
      candidateSection += `Name: ${candidateData.personalInfo.name}\n`;
    }
    if (candidateData.personalInfo.email) {
      candidateSection += `Email: ${candidateData.personalInfo.email}\n`;
    }
    if (candidateData.personalInfo.phone) {
      candidateSection += `Phone: ${candidateData.personalInfo.phone}\n`;
    }
  }
  
  // Key Skills
  if (extractedSkills.length > 0) {
    candidateSection += `\nKey Technical Skills: ${extractedSkills.join(', ')}\n`;
  }
  
  // Experience Summary
  if (candidateData?.experience && candidateData.experience.length > 0) {
    candidateSection += '\nRelevant Experience:\n';
    candidateData.experience.slice(0, 3).forEach((exp: any, index: number) => {
      candidateSection += `${index + 1}. ${exp.title || 'Role'} at ${exp.company || 'Company'}`;
      if (exp.duration) candidateSection += ` (${exp.duration})`;
      candidateSection += '\n';
      if (exp.description) {
        const shortDesc = exp.description.substring(0, 150);
        candidateSection += `   Key achievements: ${shortDesc}...\n`;
      }
    });
  }
  
  // Education
  if (candidateData?.education && candidateData.education.length > 0) {
    candidateSection += '\nEducation:\n';
    candidateData.education.forEach((edu: any) => {
      candidateSection += `- ${edu.degree || 'Degree'} from ${edu.institution || 'Institution'}`;
      if (edu.year) candidateSection += ` (${edu.year})`;
      candidateSection += '\n';
    });
  }
  
  return candidateSection;
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { resumeContent, jobDescription, jobTitle, companyName, candidateData } = await req.json()

    console.log('🔄 Processing CV tailoring request for:', jobTitle, 'at', companyName);

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
      console.error('❌ OpenAI API key not configured');
      return new Response(
        JSON.stringify({ error: 'AI service not configured. Please contact support.' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Analyze job requirements
    const jobAnalysis = analyzeJobRequirements(jobDescription);
    console.log('📊 Job analysis:', jobAnalysis);
    
    // Extract candidate skills
    const candidateSkills = extractKeySkills(resumeContent);
    console.log('🎯 Candidate skills:', candidateSkills);
    
    // Format candidate information
    const candidateInfo = formatCandidateInfo(candidateData, resumeContent);
    
    // Create enhanced AI prompt
    const prompt = `You are an expert resume writer and career counselor. Create a tailored resume that follows this specific structure:

CANDIDATE INFORMATION:
${candidateInfo}

ORIGINAL RESUME CONTENT:
${resumeContent.substring(0, 2500)}

TARGET JOB:
Position: ${jobTitle || 'Not specified'}
Company: ${companyName || 'Not specified'}
Required Skills: ${jobAnalysis.requiredSkills.join(', ')}
Experience Level: ${jobAnalysis.experienceLevel}

Job Description:
${jobDescription.substring(0, 2000)}

INSTRUCTIONS:
1. **CAREER PROFILE** (MOST IMPORTANT): Write exactly 3 compelling sentences that:
   - Highlight the candidate's ${jobAnalysis.experienceLevel} experience level
   - Mention 3-4 most relevant skills from: ${candidateSkills.join(', ')}
   - Emphasize measurable impact and value proposition
   - Align with the specific job requirements

2. **CONTACT INFORMATION**: Use the exact candidate details provided above (name, email, phone)

3. **TAILORED EXPERIENCE**: 
   - Rewrite job descriptions to highlight achievements relevant to ${jobTitle}
   - Use keywords from job description: ${jobAnalysis.requiredSkills.slice(0, 6).join(', ')}
   - Focus on quantifiable results and impact

4. **SKILLS SECTION**: Prioritize skills that match job requirements

5. **FORMAT**: Create ATS-friendly formatting with clear section headers

CRITICAL: Start with candidate's actual contact information, then the 3-sentence career profile, then experience.

Generate a complete, professional resume:`;

    console.log('🤖 Sending request to OpenAI...');

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
            content: 'You are an expert resume writer who creates compelling, ATS-optimized resumes. You MUST use the exact candidate information provided and create a 3-sentence career profile that highlights impact and value. Always use real candidate data, never placeholders.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 2500,
        temperature: 0.3,
      }),
    })

    if (!response.ok) {
      const error = await response.json()
      console.error('❌ OpenAI API error:', error)
      
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

    // Enhanced scoring based on keyword matching and structure
    const resumeKeywords = tailoredResume.toLowerCase();
    const skillMatches = jobAnalysis.requiredSkills.filter(skill => 
      resumeKeywords.includes(skill.toLowerCase())
    ).length;
    
    const hasCareerProfile = resumeKeywords.includes('career') || resumeKeywords.includes('profile') || resumeKeywords.includes('summary');
    const hasContactInfo = candidateData?.personalInfo?.name ? 
      resumeKeywords.includes(candidateData.personalInfo.name.toLowerCase()) : true;
    
    // Calculate comprehensive score
    const keywordScore = Math.round((skillMatches / Math.max(jobAnalysis.requiredSkills.length, 1)) * 40);
    const structureScore = (hasCareerProfile ? 30 : 0) + (hasContactInfo ? 20 : 0);
    const baseScore = 10; // Base score for successful generation
    
    const finalScore = Math.min(95, Math.max(65, keywordScore + structureScore + baseScore));

    console.log('✅ Resume tailored successfully. Score:', finalScore);

    return new Response(
      JSON.stringify({
        tailoredResume,
        score: finalScore,
        analysis: {
          skillsMatched: skillMatches,
          requiredSkills: jobAnalysis.requiredSkills.length,
          candidateSkills: candidateSkills,
          experienceLevel: jobAnalysis.experienceLevel,
          hasCareerProfile,
          hasContactInfo
        },
        suggestions: {
          keywordsMatched: skillMatches,
          totalKeywords: jobAnalysis.requiredSkills.length,
          recommendations: [
            '3-sentence career profile crafted for the specific role',
            `${skillMatches} of ${jobAnalysis.requiredSkills.length} required skills highlighted`,
            'Experience sections tailored to job requirements',
            'ATS-optimized formatting implemented',
            hasContactInfo ? 'Candidate contact information properly included' : 'Contact information needs verification'
          ]
        }
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('❌ Error in tailor-cv function:', error)
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error', 
        details: error.message 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})
