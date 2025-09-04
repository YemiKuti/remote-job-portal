
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import "https://deno.land/x/xhr@0.1.0/mod.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Enhanced function to extract and analyze job requirements intelligently
const analyzeJobRequirements = (jobDescription: string, jobTitle: string): {
  essentialSkills: string[],
  preferredSkills: string[],
  experienceLevel: string,
  education: string[],
  responsibilities: string[],
  achievements: string[],
  keywords: string[]
} => {
  const lowerDesc = jobDescription.toLowerCase();
  const lowerTitle = jobTitle.toLowerCase();
  
  // Comprehensive technical skills database
  const technicalSkills = [
    'javascript', 'typescript', 'react', 'vue', 'angular', 'node.js', 'python', 'java', 'c++', 'c#',
    'sql', 'nosql', 'mongodb', 'postgresql', 'mysql', 'redis', 'elasticsearch', 'firebase',
    'aws', 'azure', 'gcp', 'docker', 'kubernetes', 'jenkins', 'gitlab', 'github', 'terraform',
    'git', 'agile', 'scrum', 'devops', 'ci/cd', 'microservices', 'api', 'rest', 'graphql',
    'machine learning', 'ai', 'data science', 'analytics', 'tableau', 'power bi', 'pandas',
    'html', 'css', 'sass', 'webpack', 'vite', 'npm', 'yarn', 'express', 'nestjs', 'nextjs',
    'spring', 'django', 'flask', 'laravel', 'rails', 'php', 'ruby', 'golang', 'rust',
    'swift', 'kotlin', 'flutter', 'react native', 'ionic', 'xamarin', 'unity', 'unreal',
    'tensorflow', 'pytorch', 'scikit-learn', 'opencv', 'nlp', 'computer vision'
  ];
  
  // Professional competencies and soft skills
  const professionalSkills = [
    'leadership', 'management', 'communication', 'collaboration', 'teamwork',
    'problem solving', 'analytical thinking', 'critical thinking', 'decision making',
    'project management', 'time management', 'organization', 'planning', 'strategy',
    'mentoring', 'coaching', 'training', 'presentation', 'public speaking',
    'negotiation', 'customer service', 'stakeholder management', 'vendor management',
    'strategic thinking', 'innovation', 'creativity', 'adaptability', 'flexibility'
  ];
  
  // Extract essential vs preferred skills
  const essentialIndicators = ['required', 'must have', 'essential', 'mandatory', 'minimum'];
  const preferredIndicators = ['preferred', 'nice to have', 'plus', 'bonus', 'advantage'];
  
  const foundTechnicalSkills = technicalSkills.filter(skill => 
    lowerDesc.includes(skill) || lowerTitle.includes(skill)
  );
  
  const foundProfessionalSkills = professionalSkills.filter(skill => 
    lowerDesc.includes(skill) || lowerTitle.includes(skill)
  );
  
  // Determine if skills are essential or preferred based on context
  const essentialSkills: string[] = [];
  const preferredSkills: string[] = [];
  
  [...foundTechnicalSkills, ...foundProfessionalSkills].forEach(skill => {
    const skillContext = extractSkillContext(jobDescription, skill);
    const isEssential = essentialIndicators.some(indicator => 
      skillContext.toLowerCase().includes(indicator)
    );
    const isPreferred = preferredIndicators.some(indicator => 
      skillContext.toLowerCase().includes(indicator)
    );
    
    if (isEssential || (!isPreferred && foundTechnicalSkills.includes(skill))) {
      essentialSkills.push(skill);
    } else {
      preferredSkills.push(skill);
    }
  });
  
  // Extract experience level
  let experienceLevel = 'Mid-level';
  if (lowerDesc.includes('senior') || lowerDesc.includes('lead') || lowerDesc.includes('5+ years')) {
    experienceLevel = 'Senior';
  } else if (lowerDesc.includes('junior') || lowerDesc.includes('entry') || lowerDesc.includes('1-2 years')) {
    experienceLevel = 'Junior';
  } else if (lowerDesc.includes('principal') || lowerDesc.includes('architect') || lowerDesc.includes('10+ years')) {
    experienceLevel = 'Principal';
  }
  
  // Extract education requirements
  const education: string[] = [];
  const educationPatterns = [
    /(bachelor'?s?\s*degree)/gi,
    /(master'?s?\s*degree)/gi,
    /(phd|doctorate)/gi,
    /(certification)/gi
  ];
  
  educationPatterns.forEach(pattern => {
    const matches = jobDescription.match(pattern);
    if (matches) {
      education.push(...matches.slice(0, 2));
    }
  });
  
  // Extract key responsibilities
  const responsibilities = extractBulletPoints(jobDescription, [
    'responsibilities', 'duties', 'role involves', 'you will'
  ]);
  
  // Extract achievement indicators for tailoring
  const achievements = extractBulletPoints(jobDescription, [
    'deliver', 'achieve', 'improve', 'increase', 'reduce', 'optimize', 'build', 'develop'
  ]);
  
  // Combine all relevant keywords
  const keywords = [
    ...essentialSkills.slice(0, 8),
    ...preferredSkills.slice(0, 4),
    ...responsibilities.slice(0, 3),
    experienceLevel.toLowerCase()
  ].filter(Boolean);
  
  return {
    essentialSkills: essentialSkills.slice(0, 10),
    preferredSkills: preferredSkills.slice(0, 8),
    experienceLevel,
    education,
    responsibilities: responsibilities.slice(0, 6),
    achievements: achievements.slice(0, 4),
    keywords
  };
};

// Helper function to extract context around a skill mention
const extractSkillContext = (text: string, skill: string): string => {
  const regex = new RegExp(`.{0,50}${skill}.{0,50}`, 'gi');
  const matches = text.match(regex);
  return matches ? matches[0] : '';
};

// Helper function to extract bullet points from sections
const extractBulletPoints = (text: string, sectionIndicators: string[]): string[] => {
  const bullets: string[] = [];
  const lines = text.split('\n');
  
  let inRelevantSection = false;
  
  for (const line of lines) {
    const trimmedLine = line.trim().toLowerCase();
    
    // Check if we're entering a relevant section
    if (sectionIndicators.some(indicator => trimmedLine.includes(indicator))) {
      inRelevantSection = true;
      continue;
    }
    
    // Check if we're leaving the section
    if (inRelevantSection && (trimmedLine.includes(':') && !trimmedLine.includes('•') && !trimmedLine.includes('-'))) {
      inRelevantSection = false;
      continue;
    }
    
    // Extract bullet points
    if (inRelevantSection && (trimmedLine.startsWith('•') || trimmedLine.startsWith('-') || trimmedLine.startsWith('*'))) {
      const cleanedBullet = line.replace(/^[\s•\-\*]+/, '').trim();
      if (cleanedBullet.length > 10 && cleanedBullet.length < 200) {
        bullets.push(cleanedBullet);
      }
    }
  }
  
  return bullets.slice(0, 10);
};

// Analyze candidate's resume to extract experience, skills, and achievements
const analyzeResumeContent = (resumeContent: string, candidateData: any): {
  currentSkills: string[],
  experience: any[],
  achievements: string[],
  educationLevel: string,
  careerLevel: string
} => {
  const lowerContent = resumeContent.toLowerCase();
  
  // Extract skills more intelligently
  const skillPatterns = [
    /skills?[:\s]+([^.]+)/gi,
    /technical[:\s]+([^.]+)/gi,
    /technologies?[:\s]+([^.]+)/gi,
    /tools?[:\s]+([^.]+)/gi
  ];
  
  const allSkills: string[] = [];
  skillPatterns.forEach(pattern => {
    const matches = resumeContent.match(pattern);
    if (matches) {
      matches.forEach(match => {
        const skillsText = match.replace(/^[^:]+:/, '').trim();
        const skills = skillsText.split(/[,|•\n]/).map(s => s.trim().toLowerCase());
        allSkills.push(...skills.filter(s => s.length > 2 && s.length < 30));
      });
    }
  });
  
  // Extract quantifiable achievements
  const achievementPatterns = [
    /(\d+%\s+\w+)/g,
    /(increased|improved|reduced|optimized|delivered|built|developed|managed|led)\s+[^.]{10,100}/gi,
    /\$[\d,]+/g,
    /\d+\+?\s+(users|customers|projects|teams)/gi
  ];
  
  const achievements: string[] = [];
  achievementPatterns.forEach(pattern => {
    const matches = resumeContent.match(pattern);
    if (matches) {
      achievements.push(...matches.slice(0, 8));
    }
  });
  
  // Determine career level based on content
  let careerLevel = 'Mid-level';
  if (lowerContent.includes('senior') || lowerContent.includes('lead') || 
      achievements.length > 6 || lowerContent.includes('managed team')) {
    careerLevel = 'Senior';
  } else if (lowerContent.includes('junior') || lowerContent.includes('intern') || 
             achievements.length < 3) {
    careerLevel = 'Junior';
  } else if (lowerContent.includes('principal') || lowerContent.includes('director') || 
             lowerContent.includes('vp') || lowerContent.includes('architect')) {
    careerLevel = 'Executive';
  }
  
  // Extract education level
  let educationLevel = 'Bachelor\'s';
  if (lowerContent.includes('master') || lowerContent.includes('mba')) {
    educationLevel = 'Master\'s';
  } else if (lowerContent.includes('phd') || lowerContent.includes('doctorate')) {
    educationLevel = 'PhD';
  } else if (lowerContent.includes('associate') || lowerContent.includes('diploma')) {
    educationLevel = 'Associate';
  }
  
  // Process experience from candidate data
  const experience = candidateData?.experience || [];
  
  return {
    currentSkills: [...new Set(allSkills)].slice(0, 15),
    experience,
    achievements: [...new Set(achievements)].slice(0, 10),
    educationLevel,
    careerLevel
  };
};

// Enhanced function to format candidate information for AI processing
const formatCandidateInfo = (candidateData: any, resumeContent: string): string => {
  if (!candidateData && !resumeContent) return '';
  
  const candidateAnalysis = analyzeResumeContent(resumeContent, candidateData);
  
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
  if (candidateAnalysis.currentSkills.length > 0) {
    candidateSection += `\nCurrent Technical Skills: ${candidateAnalysis.currentSkills.join(', ')}\n`;
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

    // Analyze job requirements comprehensively
    const jobAnalysis = analyzeJobRequirements(jobDescription, jobTitle || '');
    console.log('🎯 Job analysis:', jobAnalysis);
    
    // Analyze candidate's resume
    const candidateAnalysis = analyzeResumeContent(resumeContent, candidateData);
    console.log('📊 Candidate analysis:', candidateAnalysis);
    
    // Identify skill alignment and gaps
    const skillAlignment = candidateAnalysis.currentSkills.filter(skill => 
      jobAnalysis.essentialSkills.includes(skill) || jobAnalysis.preferredSkills.includes(skill)
    );
    const criticalGaps = jobAnalysis.essentialSkills.filter(skill => 
      !candidateAnalysis.currentSkills.includes(skill)
    ).slice(0, 5);
    
    console.log('✅ Skill alignment:', skillAlignment);
    console.log('⚠️ Critical gaps:', criticalGaps);
    
    // Format candidate information
    const candidateInfo = formatCandidateInfo(candidateData, resumeContent);
    
    // Create professional AI prompt focused on natural language and structure
    const prompt = `You are a professional resume writer with expertise in ATS optimization and modern recruitment practices. Your goal is to create a polished, professional resume that naturally incorporates relevant keywords while prioritizing readability and impact.

CANDIDATE PROFILE:
${candidateInfo}

ORIGINAL RESUME:
${resumeContent.substring(0, 2500)}

TARGET POSITION:
Role: ${jobTitle || 'Not specified'}
Company: ${companyName || 'Not specified'}
Experience Level: ${jobAnalysis.experienceLevel}

JOB REQUIREMENTS ANALYSIS:
Essential Skills: ${jobAnalysis.essentialSkills.join(', ')}
Preferred Skills: ${jobAnalysis.preferredSkills.join(', ')}
Key Responsibilities: ${jobAnalysis.responsibilities.slice(0, 4).join('; ')}
Required Education: ${jobAnalysis.education.join(', ') || 'Not specified'}

CANDIDATE STRENGTHS:
Current Skill Set: ${candidateAnalysis.currentSkills.join(', ')}
Career Level: ${candidateAnalysis.careerLevel}
Key Achievements: ${candidateAnalysis.achievements.slice(0, 5).join('; ')}
Aligned Skills: ${skillAlignment.join(', ')}

PROFESSIONAL RESUME WRITING GUIDELINES:

1. **STRUCTURE & FORMATTING**:
   Create a clean, professional resume with these sections in order:
   - Contact Information (Name, Phone, Email, LinkedIn, Location)
   - Professional Summary (3 compelling sentences)
   - Core Competencies/Key Skills (organized in 2-3 columns)
   - Professional Experience (reverse chronological, 3-5 bullet points per role)
   - Education & Certifications
   - Additional relevant sections (Projects, Languages, etc.) if applicable

2. **PROFESSIONAL SUMMARY** (Critical):
   Write exactly 3 powerful sentences that:
   - Highlight ${candidateAnalysis.careerLevel} level expertise in relevant field
   - Showcase quantifiable achievements and impact
   - Naturally mention 3-4 essential skills from the job requirements
   - Convey value proposition for the target role

3. **EXPERIENCE SECTION**:
   For each role, create 3-5 bullet points that:
   - Start with strong action verbs (Led, Developed, Implemented, Achieved, etc.)
   - Include specific, quantifiable results where possible
   - Naturally incorporate relevant technical skills and methodologies
   - Demonstrate progression and increasing responsibility
   - Show impact on business outcomes

4. **SKILLS INTEGRATION**:
   - Prioritize skills that match job requirements: ${jobAnalysis.essentialSkills.slice(0, 6).join(', ')}
   - Naturally weave technical skills into experience descriptions
   - Create a dedicated "Core Competencies" section with organized skill categories
   - Include both technical and professional competencies

5. **ATS OPTIMIZATION** (Subtle):
   - Use standard section headings (Professional Experience, Education, etc.)
   - Include relevant keywords naturally within context
   - Use both acronyms and full forms when appropriate
   - Maintain consistent formatting and clear hierarchy

6. **PROFESSIONAL LANGUAGE**:
   - Use industry-standard terminology
   - Focus on achievements over responsibilities
   - Quantify impact with metrics, percentages, or dollar amounts
   - Maintain professional tone throughout

Job Context for Reference:
${jobDescription.substring(0, 1500)}

IMPORTANT: Create a complete, professional resume that reads naturally and showcases the candidate's qualifications effectively. Focus on professional presentation first, with keyword optimization as a natural byproduct of good resume writing.`;

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
            content: 'You are a professional resume writer with 15+ years of experience helping candidates land their dream jobs. You specialize in creating polished, ATS-friendly resumes that naturally incorporate relevant keywords while maintaining excellent readability and professional presentation. You focus on achievements, impact, and clear value proposition rather than keyword stuffing.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 3500,
        temperature: 0.3
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

    // Professional resume quality scoring
    const resumeText = tailoredResume.toLowerCase();
    
    // Evaluate essential skill coverage
    const essentialSkillMatches = jobAnalysis.essentialSkills.filter(skill => 
      resumeText.includes(skill.toLowerCase())
    ).length;
    
    // Evaluate preferred skill coverage
    const preferredSkillMatches = jobAnalysis.preferredSkills.filter(skill => 
      resumeText.includes(skill.toLowerCase())
    ).length;
    
    // Check for professional structure elements
    const hasContactInfo = resumeText.includes('email') && resumeText.includes('phone');
    const hasProfessionalSummary = resumeText.includes('summary') || resumeText.includes('profile');
    const hasQuantifiedAchievements = /\d+%|\$[\d,]+|\d+\+?\s+(users|customers|projects|team)/g.test(resumeText);
    const hasActionVerbs = /(led|developed|implemented|achieved|managed|created|improved|delivered|built|designed)/g.test(resumeText);
    const hasEducation = resumeText.includes('education') || resumeText.includes('degree');
    
    // Professional formatting check
    const hasProperSections = [
      'experience', 'education', 'skills'
    ].filter(section => resumeText.includes(section)).length;
    
    // Calculate comprehensive score
    const skillCoverageScore = Math.round(
      ((essentialSkillMatches / Math.max(jobAnalysis.essentialSkills.length, 1)) * 40) +
      ((preferredSkillMatches / Math.max(jobAnalysis.preferredSkills.length, 1)) * 20)
    );
    
    const structureScore = [
      hasContactInfo ? 8 : 0,
      hasProfessionalSummary ? 12 : 0,
      hasQuantifiedAchievements ? 10 : 0,
      hasActionVerbs ? 8 : 0,
      hasEducation ? 5 : 0,
      hasProperSections >= 3 ? 7 : hasProperSections * 2
    ].reduce((sum, score) => sum + score, 0);
    
    const finalScore = Math.min(95, Math.max(75, skillCoverageScore + structureScore + 10));

    console.log('✅ Professional resume created successfully. Quality Score:', finalScore);
    console.log('📊 Professional assessment:', {
      essentialSkills: `${essentialSkillMatches}/${jobAnalysis.essentialSkills.length}`,
      preferredSkills: `${preferredSkillMatches}/${jobAnalysis.preferredSkills.length}`,
      structureElements: structureScore
    });

    // Generate quality recommendations
    const recommendations: string[] = [
      `✅ Professional ${candidateAnalysis.careerLevel}-level resume structure`,
      `✅ ${essentialSkillMatches} essential skills from job requirements showcased`,
      `✅ ${preferredSkillMatches} preferred qualifications highlighted`,
    ];
    
    if (hasProfessionalSummary) {
      recommendations.push('✅ Compelling professional summary included');
    }
    if (hasQuantifiedAchievements) {
      recommendations.push('✅ Quantified achievements demonstrate impact');
    }
    if (hasActionVerbs) {
      recommendations.push('✅ Strong action verbs showcase leadership and results');
    }
    if (hasContactInfo) {
      recommendations.push('✅ Complete contact information properly formatted');
    }
    if (hasProperSections >= 3) {
      recommendations.push('✅ Professional section organization for ATS compatibility');
    }
    
    recommendations.push(`✅ Tailored for ${jobAnalysis.experienceLevel} ${jobTitle} role`);

    return new Response(
      JSON.stringify({
        tailoredResume,
        score: finalScore,
        analysis: {
          skillAlignment: {
            essentialSkillsMatched: essentialSkillMatches,
            preferredSkillsMatched: preferredSkillMatches,
            totalEssentialSkills: jobAnalysis.essentialSkills.length,
            totalPreferredSkills: jobAnalysis.preferredSkills.length,
            alignedSkills: skillAlignment
          },
          professionalElements: {
            hasContactInfo,
            hasProfessionalSummary,
            hasQuantifiedAchievements,
            hasActionVerbs,
            hasEducation,
            properSections: hasProperSections
          },
          candidateProfile: {
            careerLevel: candidateAnalysis.careerLevel,
            currentSkills: candidateAnalysis.currentSkills.slice(0, 10),
            achievements: candidateAnalysis.achievements.slice(0, 5)
          },
          jobAlignment: {
            targetLevel: jobAnalysis.experienceLevel,
            essentialSkills: jobAnalysis.essentialSkills,
            preferredSkills: jobAnalysis.preferredSkills,
            criticalGaps
          }
        },
        suggestions: {
          qualityScore: `${finalScore}% professional resume quality`,
          recommendations,
          improvementAreas: finalScore < 85 ? [
            !hasProfessionalSummary ? 'Consider strengthening the professional summary' : null,
            !hasQuantifiedAchievements ? 'Add more quantified achievements and metrics' : null,
            essentialSkillMatches < jobAnalysis.essentialSkills.length * 0.7 ? 'Highlight more essential skills from the job requirements' : null,
            !hasActionVerbs ? 'Use stronger action verbs to demonstrate impact' : null
          ].filter(Boolean) : []
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
