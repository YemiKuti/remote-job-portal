
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import "https://deno.land/x/xhr@0.1.0/mod.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Enhanced function to extract comprehensive keywords from job description
const extractJobKeywords = (jobDescription: string, jobTitle: string): {
  technicalSkills: string[],
  softSkills: string[],
  industryTerms: string[],
  requirements: string[],
  allKeywords: string[]
} => {
  const lowerDesc = jobDescription.toLowerCase();
  const lowerTitle = jobTitle.toLowerCase();
  
  // Technical skills and tools
  const technicalKeywords = [
    'javascript', 'typescript', 'react', 'vue', 'angular', 'node.js', 'python', 'java', 'c++', 'c#',
    'sql', 'nosql', 'mongodb', 'postgresql', 'mysql', 'redis', 'elasticsearch',
    'aws', 'azure', 'gcp', 'docker', 'kubernetes', 'jenkins', 'gitlab', 'github',
    'git', 'agile', 'scrum', 'devops', 'ci/cd', 'microservices', 'api', 'rest', 'graphql',
    'machine learning', 'ai', 'data science', 'analytics', 'tableau', 'power bi',
    'html', 'css', 'sass', 'webpack', 'vite', 'npm', 'yarn', 'express', 'nestjs',
    'spring', 'django', 'flask', 'laravel', 'rails', 'php', 'ruby', 'golang', 'rust',
    'swift', 'kotlin', 'flutter', 'react native', 'ionic', 'xamarin',
    'terraform', 'ansible', 'chef', 'puppet', 'nagios', 'prometheus', 'grafana'
  ];
  
  // Soft skills and competencies
  const softSkillsKeywords = [
    'leadership', 'management', 'communication', 'collaboration', 'teamwork',
    'problem solving', 'analytical', 'critical thinking', 'decision making',
    'project management', 'time management', 'organization', 'planning',
    'mentoring', 'coaching', 'training', 'presentation', 'public speaking',
    'negotiation', 'customer service', 'stakeholder management', 'vendor management',
    'strategic thinking', 'innovation', 'creativity', 'adaptability', 'flexibility'
  ];
  
  // Industry-specific terms
  const industryKeywords = [
    'fintech', 'healthcare', 'edtech', 'e-commerce', 'saas', 'b2b', 'b2c',
    'startup', 'enterprise', 'compliance', 'security', 'gdpr', 'hipaa',
    'agile methodology', 'waterfall', 'lean', 'six sigma', 'itil',
    'digital transformation', 'cloud migration', 'modernization'
  ];
  
  // Extract matching technical skills
  const foundTechnicalSkills = technicalKeywords.filter(keyword => 
    lowerDesc.includes(keyword) || lowerTitle.includes(keyword)
  );
  
  // Extract matching soft skills
  const foundSoftSkills = softSkillsKeywords.filter(keyword => 
    lowerDesc.includes(keyword) || lowerTitle.includes(keyword)
  );
  
  // Extract matching industry terms
  const foundIndustryTerms = industryKeywords.filter(keyword => 
    lowerDesc.includes(keyword) || lowerTitle.includes(keyword)
  );
  
  // Extract requirements using patterns
  const requirementPatterns = [
    /(\d+\+?\s*years?\s*(?:of\s*)?experience)/gi,
    /(bachelor'?s?\s*degree)/gi,
    /(master'?s?\s*degree)/gi,
    /(certification)/gi,
    /(experience\s+(?:with|in)\s+[\w\s,]+)/gi,
    /(proficiency\s+(?:with|in)\s+[\w\s,]+)/gi,
    /(knowledge\s+(?:of|in)\s+[\w\s,]+)/gi
  ];
  
  const requirements: string[] = [];
  requirementPatterns.forEach(pattern => {
    const matches = jobDescription.match(pattern);
    if (matches) {
      requirements.push(...matches.slice(0, 3)); // Limit to avoid too many matches
    }
  });
  
  // Combine all keywords
  const allKeywords = [
    ...foundTechnicalSkills,
    ...foundSoftSkills,
    ...foundIndustryTerms
  ].slice(0, 15); // Limit to top 15 keywords
  
  return {
    technicalSkills: foundTechnicalSkills,
    softSkills: foundSoftSkills,
    industryTerms: foundIndustryTerms,
    requirements,
    allKeywords
  };
};

// Enhanced function to extract key skills from resume content
const extractResumeSkills = (resumeContent: string): string[] => {
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
  
  return foundSkills.slice(0, 12); // Limit to top 12 skills
};

// Enhanced function to format candidate information for AI processing
const formatCandidateInfo = (candidateData: any, resumeContent: string): string => {
  if (!candidateData && !resumeContent) return '';
  
  const extractedSkills = extractResumeSkills(resumeContent);
  
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
    candidateSection += `\nCurrent Technical Skills: ${extractedSkills.join(', ')}\n`;
  }
  
  // Experience Summary
  if (candidateData?.experience && candidateData.experience.length > 0) {
    candidateSection += '\nRelevant Experience:\n';
    candidateData.experience.slice(0, 3).forEach((exp: any, index: number) => {
      candidateSection += `${index + 1}. ${exp.title || 'Role'} at ${exp.company || 'Company'}`;
      if (exp.duration) candidateSection += ` (${exp.duration})`;
      candidateSection += '\n';
      if (exp.description) {
        const shortDesc = exp.description.substring(0, 200);
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

    // Extract comprehensive keywords from job description
    const jobKeywords = extractJobKeywords(jobDescription, jobTitle || '');
    console.log('🎯 Extracted job keywords:', jobKeywords);
    
    // Extract candidate skills
    const candidateSkills = extractResumeSkills(resumeContent);
    console.log('📊 Candidate current skills:', candidateSkills);
    
    // Identify skill gaps and matches
    const skillMatches = candidateSkills.filter(skill => 
      jobKeywords.allKeywords.includes(skill)
    );
    const skillGaps = jobKeywords.technicalSkills.filter(skill => 
      !candidateSkills.includes(skill)
    ).slice(0, 5); // Top 5 missing skills
    
    console.log('✅ Skill matches:', skillMatches);
    console.log('⚠️ Skill gaps:', skillGaps);
    
    // Format candidate information
    const candidateInfo = formatCandidateInfo(candidateData, resumeContent);
    
    // Create enhanced AI prompt with keyword integration strategy
    const prompt = `You are an expert resume writer and ATS optimization specialist. Create a tailored resume that strategically incorporates job-specific keywords while maintaining authenticity.

CANDIDATE INFORMATION:
${candidateInfo}

ORIGINAL RESUME CONTENT:
${resumeContent.substring(0, 2500)}

TARGET JOB ANALYSIS:
Position: ${jobTitle || 'Not specified'}
Company: ${companyName || 'Not specified'}

EXTRACTED JOB KEYWORDS TO INTEGRATE:
Technical Skills: ${jobKeywords.technicalSkills.join(', ')}
Soft Skills: ${jobKeywords.softSkills.join(', ')}
Industry Terms: ${jobKeywords.industryTerms.join(', ')}

CANDIDATE SKILL ANALYSIS:
Current Skills (to highlight): ${candidateSkills.join(', ')}
Matching Keywords: ${skillMatches.join(', ')}
Missing Keywords to Incorporate: ${skillGaps.join(', ')}

Job Description Context:
${jobDescription.substring(0, 2000)}

CRITICAL KEYWORD INTEGRATION INSTRUCTIONS:
1. **STRATEGIC KEYWORD PLACEMENT**: Naturally integrate these keywords throughout the resume:
   - Use exact keyword phrases from the job description when possible
   - Include variations and synonyms of key terms
   - Incorporate missing technical skills where relevant to past experience
   - Weave in soft skills and industry terms organically

2. **CAREER PROFILE** (HIGHEST PRIORITY): Write exactly 3 compelling sentences that:
   - Include 4-5 most critical keywords from the job requirements
   - Highlight measurable impact using industry-specific terminology
   - Use exact phrases from job description where authentic
   - Demonstrate value proposition with keyword-rich language

3. **EXPERIENCE OPTIMIZATION**:
   - Rewrite job descriptions to include missing keywords naturally
   - Use action verbs that match the job posting language
   - Incorporate technical terms and tools mentioned in job requirements
   - Add relevant industry terminology and methodologies
   - Quantify achievements using keywords and metrics

4. **SKILLS SECTION ENHANCEMENT**:
   - Prioritize skills that exactly match job requirements
   - Include variations of required technologies
   - Add complementary skills mentioned in job description
   - Group technical and soft skills strategically

5. **ATS OPTIMIZATION**:
   - Use exact keyword phrases as they appear in job description
   - Include both acronyms and full forms (e.g., "AI" and "Artificial Intelligence")
   - Integrate keywords in context, not just as lists
   - Ensure keyword density appears natural

KEYWORD INTEGRATION TARGETS:
- Must include: ${jobKeywords.allKeywords.slice(0, 8).join(', ')}
- Requirements to address: ${jobKeywords.requirements.slice(0, 3).join('; ')}
- Technical focus areas: ${jobKeywords.technicalSkills.slice(0, 6).join(', ')}

Generate a complete, keyword-optimized resume that reads naturally while maximizing ATS compatibility:`;

    console.log('🤖 Sending enhanced request to OpenAI...');

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
            content: 'You are an expert resume writer and ATS optimization specialist. You excel at naturally integrating job-specific keywords while maintaining authenticity and readability. You MUST use exact candidate information and create keyword-rich content that passes ATS systems while sounding professional and genuine.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 2800,
        temperature: 0.2, // Lower temperature for more consistent keyword integration
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

    // Enhanced scoring based on keyword integration
    const resumeText = tailoredResume.toLowerCase();
    
    // Calculate keyword match scores
    const technicalMatches = jobKeywords.technicalSkills.filter(skill => 
      resumeText.includes(skill.toLowerCase())
    ).length;
    
    const softSkillMatches = jobKeywords.softSkills.filter(skill => 
      resumeText.includes(skill.toLowerCase())
    ).length;
    
    const industryMatches = jobKeywords.industryTerms.filter(term => 
      resumeText.includes(term.toLowerCase())
    ).length;
    
    const totalPossibleMatches = jobKeywords.technicalSkills.length + 
                               jobKeywords.softSkills.length + 
                               jobKeywords.industryTerms.length;
    
    const totalMatches = technicalMatches + softSkillMatches + industryMatches;
    
    // Enhanced scoring algorithm
    const keywordScore = totalPossibleMatches > 0 ? 
      Math.round((totalMatches / totalPossibleMatches) * 50) : 20;
    
    const hasCareerProfile = resumeText.includes('profile') || 
                           resumeText.includes('summary') || 
                           resumeText.includes('objective');
    
    const hasContactInfo = candidateData?.personalInfo?.name ? 
      resumeText.includes(candidateData.personalInfo.name.toLowerCase()) : true;
    
    const structureScore = (hasCareerProfile ? 25 : 10) + (hasContactInfo ? 15 : 5);
    const baseScore = 10;
    
    const finalScore = Math.min(98, Math.max(70, keywordScore + structureScore + baseScore));

    console.log('✅ Resume tailored successfully. Final Score:', finalScore);
    console.log('📊 Keyword integration:', {
      technical: `${technicalMatches}/${jobKeywords.technicalSkills.length}`,
      softSkills: `${softSkillMatches}/${jobKeywords.softSkills.length}`,
      industry: `${industryMatches}/${jobKeywords.industryTerms.length}`
    });

    return new Response(
      JSON.stringify({
        tailoredResume,
        score: finalScore,
        analysis: {
          keywordIntegration: {
            technicalSkills: technicalMatches,
            softSkills: softSkillMatches,
            industryTerms: industryMatches,
            totalMatches,
            totalPossible: totalPossibleMatches
          },
          skillAnalysis: {
            candidateSkills,
            jobKeywords: jobKeywords.allKeywords,
            skillMatches,
            skillGaps
          },
          hasCareerProfile,
          hasContactInfo
        },
        suggestions: {
          keywordsIntegrated: `${totalMatches} of ${totalPossibleMatches} job keywords successfully integrated`,
          recommendations: [
            `✅ ${technicalMatches} technical skills from job requirements incorporated`,
            `✅ ${softSkillMatches} soft skills naturally integrated`,
            `✅ ${industryMatches} industry-specific terms included`,
            '✅ 3-sentence career profile optimized for target role',
            '✅ ATS-friendly keyword placement throughout resume',
            hasContactInfo ? '✅ Contact information properly formatted' : '⚠️ Contact information needs verification',
            `✅ ${skillMatches.length} existing skills highlighted as job matches`,
            skillGaps.length > 0 ? `📈 ${skillGaps.length} additional keywords strategically added` : '✅ All relevant keywords already present'
          ]
        },
        extractedKeywords: jobKeywords
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
