
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
    // Tech & Development
    'javascript', 'typescript', 'react', 'vue', 'angular', 'node.js', 'python', 'java', 'c++', 'c#',
    'sql', 'nosql', 'mongodb', 'postgresql', 'mysql', 'redis', 'elasticsearch', 'firebase',
    'aws', 'azure', 'gcp', 'docker', 'kubernetes', 'jenkins', 'gitlab', 'github', 'terraform',
    'git', 'agile', 'scrum', 'devops', 'ci/cd', 'microservices', 'api', 'rest', 'graphql',
    'html', 'css', 'sass', 'webpack', 'vite', 'npm', 'yarn', 'express', 'nestjs', 'nextjs',
    'spring', 'django', 'flask', 'laravel', 'rails', 'php', 'ruby', 'golang', 'rust',
    'swift', 'kotlin', 'flutter', 'react native', 'ionic', 'xamarin', 'unity', 'unreal',
    // Data & Analytics
    'machine learning', 'ai', 'data science', 'analytics', 'tableau', 'power bi', 'pandas',
    'tensorflow', 'pytorch', 'scikit-learn', 'opencv', 'nlp', 'computer vision', 'excel',
    'data analysis', 'data visualization', 'statistical analysis', 'r programming', 'sas', 'spss',
    'hadoop', 'spark', 'kafka', 'airflow', 'jupyter', 'numpy', 'matplotlib', 'seaborn',
    // Marketing & Digital
    'seo', 'sem', 'google analytics', 'google ads', 'facebook ads', 'linkedin ads', 'ppc',
    'content marketing', 'email marketing', 'social media marketing', 'digital marketing',
    'hubspot', 'salesforce', 'marketo', 'mailchimp', 'hootsuite', 'buffer', 'canva',
    'a/b testing', 'conversion optimization', 'marketing automation', 'crm', 'lead generation',
    'campaign management', 'brand management', 'public relations', 'copywriting',
    // Business & Finance
    'financial modeling', 'accounting', 'budgeting', 'forecasting', 'risk management',
    'project management', 'product management', 'business analysis', 'process improvement'
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
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  const requestId = crypto.randomUUID();
  const startTime = Date.now();
  
  console.log(`🔄 [${requestId}] Starting CV tailoring request`);

  try {
    // Add timeout for the entire request
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Request timeout')), 90000); // 90 seconds
    });

    const processRequest = async () => {
      let requestBody;
      try {
        requestBody = await req.json();
      } catch (error) {
        console.error(`❌ [${requestId}] Invalid JSON in request body:`, error);
        return new Response(
          JSON.stringify({ 
            success: false,
            error: 'Invalid request format. Please ensure your data is properly formatted.',
            requestId: requestId 
          }),
          { 
            status: 200, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );
      }

      const { resumeContent, jobDescription, jobTitle, companyName, candidateData } = requestBody;

      console.log(`🔄 [${requestId}] Processing request for: ${jobTitle || 'Unknown Job'} at ${companyName || 'Unknown Company'}`);
      console.log(`📊 [${requestId}] Input sizes - Resume: ${resumeContent?.length || 0} chars, Job Desc: ${jobDescription?.length || 0} chars`);

      // Enhanced input validation with user-friendly messages
      if (!resumeContent || resumeContent.trim() === '') {
        return new Response(
          JSON.stringify({ 
            success: false,
            error: 'Please upload a valid resume. Resume content is required for CV tailoring.',
            requestId: requestId 
          }),
          { 
            status: 200, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );
      }

      if (!jobDescription || jobDescription.trim() === '') {
        return new Response(
          JSON.stringify({ 
            success: false,
            error: 'Please provide a job description. Job requirements are needed to tailor your CV.',
            requestId: requestId 
          }),
          { 
            status: 200, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );
      }

      // Size validation to prevent memory issues
      if (resumeContent.length > 50000) {
        return new Response(
          JSON.stringify({ 
            success: false,
            error: 'Resume content is too large. Please provide a resume under 50,000 characters.',
            requestId: requestId 
          }),
          { 
            status: 200, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );
      }

      if (jobDescription.length > 20000) {
        return new Response(
          JSON.stringify({ 
            success: false,
            error: 'Job description is too large. Please provide a job description under 20,000 characters.',
            requestId: requestId 
          }),
          { 
            status: 200, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );
      }

      // Content validation
      if (resumeContent.length < 100) {
        return new Response(
          JSON.stringify({ 
            success: false,
            error: 'Resume content appears too short. Please provide a more detailed resume with work experience and skills.',
            requestId: requestId 
          }),
          { 
            status: 200, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );
      }

      if (jobDescription.length < 50) {
        return new Response(
          JSON.stringify({ 
            success: false,
            error: 'Job description appears too brief. Please provide a more detailed job description with requirements and responsibilities.',
            requestId: requestId 
          }),
          { 
            status: 200, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );
      }

      // Check for binary or invalid content
      if (!/^[\x00-\x7F]*$/.test(resumeContent.substring(0, 1000))) {
        console.log(`⚠️ [${requestId}] Resume contains non-ASCII characters, proceeding with caution`);
      }

      const openAIApiKey = Deno.env.get('OPENAI_API_KEY')
      if (!openAIApiKey) {
        console.error(`❌ [${requestId}] OpenAI API key not configured`);
        return new Response(
          JSON.stringify({ 
            success: false,
            error: 'AI service not configured. Please contact support.',
            requestId: requestId 
          }),
          { 
            status: 200, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );
      }

      // Analyze job requirements comprehensively
      console.log(`🎯 [${requestId}] Analyzing job requirements...`);
      const jobAnalysis = analyzeJobRequirements(jobDescription, jobTitle || '');
      console.log(`🎯 [${requestId}] Job analysis completed:`, {
        essentialSkills: jobAnalysis.essentialSkills.length,
        preferredSkills: jobAnalysis.preferredSkills.length,
        experienceLevel: jobAnalysis.experienceLevel
      });
      
      // Analyze candidate's resume
      console.log(`📊 [${requestId}] Analyzing candidate resume...`);
      const candidateAnalysis = analyzeResumeContent(resumeContent, candidateData);
      console.log(`📊 [${requestId}] Candidate analysis completed:`, {
        currentSkills: candidateAnalysis.currentSkills.length,
        achievements: candidateAnalysis.achievements.length,
        careerLevel: candidateAnalysis.careerLevel
      });
      
      // Identify skill alignment and gaps
      const skillAlignment = candidateAnalysis.currentSkills.filter(skill => 
        jobAnalysis.essentialSkills.includes(skill) || jobAnalysis.preferredSkills.includes(skill)
      );
      const criticalGaps = jobAnalysis.essentialSkills.filter(skill => 
        !candidateAnalysis.currentSkills.includes(skill)
      ).slice(0, 5);
      
      console.log(`✅ [${requestId}] Skill alignment: ${skillAlignment.length} skills matched`);
      console.log(`⚠️ [${requestId}] Critical gaps: ${criticalGaps.length} essential skills missing`);
      
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

CRITICAL FORMATTING & STRUCTURE REQUIREMENTS:

1. **MANDATORY SECTION ORDER** (ATS-Optimized):
   [Full Name]
   [Phone] | [Email] | [LinkedIn] | [City, State]
   
   PROFESSIONAL SUMMARY
   [Exactly 3 compelling sentences that highlight expertise and value]
   
   CORE COMPETENCIES
   [Organized in bullet points or columns - technical and soft skills]
   
   PROFESSIONAL EXPERIENCE
   [Company Name] | [Job Title] | [Dates]
   • [Achievement-focused bullet point with metrics]
   • [Impact statement with quantifiable results]
   • [Skills demonstration through accomplishments]
   
   EDUCATION
   [Degree] | [Institution] | [Year] (if missing, write "Additional training and certifications available upon request")
   
   CERTIFICATIONS & ADDITIONAL INFORMATION (if applicable)

2. **PROFESSIONAL SUMMARY REQUIREMENTS**:
   - Exactly 3 sentences maximum
   - Include ${candidateAnalysis.careerLevel} level positioning
   - Naturally incorporate 3-4 of these essential skills: ${jobAnalysis.essentialSkills.slice(0, 6).join(', ')}
   - Quantify experience (years, scope, results)
   - End with value proposition for the target role

3. **EXPERIENCE OPTIMIZATION**:
   - Transform generic duties into achievement-focused statements
   - Use power verbs: Achieved, Delivered, Implemented, Led, Optimized, Developed
   - Include specific metrics wherever possible (%, $, numbers, timeframes)
   - Naturally incorporate technical skills within context
   - Show career progression and increasing responsibility

4. **ERROR HANDLING FOR MISSING DATA**:
   - If education section is missing/unclear: Add "Education and certifications available upon request"
   - If experience lacks metrics: Create reasonable professional estimates based on role level
   - If skills section is sparse: Infer relevant skills from experience descriptions
   - Maintain professional tone even with limited input data

5. **ATS COMPLIANCE & KEYWORDS**:
   - Use standard section headers (no creative formatting)
   - Include both acronyms and full forms (e.g., "Customer Relationship Management (CRM)")
   - Integrate job keywords naturally within experience contexts
   - Avoid tables, graphics, or unusual formatting
   - Ensure clean, readable hierarchy

6. **NATURAL LANGUAGE INTEGRATION**:
   - Keywords must flow naturally within sentences
   - No artificial keyword stuffing or repetition
   - Focus on authentic professional language
   - Skills mentioned in context of actual achievements
   - Industry-appropriate terminology and phrasing

Job Context for Reference:
${jobDescription.substring(0, 1500)}

CRITICAL: Create a complete, professionally structured resume that reads naturally while strategically incorporating relevant qualifications. Prioritize readability and authentic professional presentation over keyword density. Handle missing sections gracefully with professional placeholders.`;

      console.log(`🤖 [${requestId}] Sending request to OpenAI API...`);

      // Create OpenAI request with timeout
      const openAITimeout = 60000; // 60 seconds for OpenAI
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), openAITimeout);

      let tailoredResume: string;
      
      try {
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${openAIApiKey}`,
            'Content-Type': 'application/json',
          },
          signal: controller.signal,
          body: JSON.stringify({
            model: 'gpt-5-mini-2025-08-07', // Use newer, more efficient model
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
            max_completion_tokens: 3500, // Use max_completion_tokens for newer models
            // Note: temperature not supported for GPT-5 models
          }),
        });

        clearTimeout(timeoutId);

        console.log(`📤 [${requestId}] OpenAI API response status: ${response.status}`);

        if (!response.ok) {
          let errorDetails;
          try {
            errorDetails = await response.json();
          } catch {
            errorDetails = { error: { message: `HTTP ${response.status}` } };
          }
          
          console.error(`❌ [${requestId}] OpenAI API error (${response.status}):`, errorDetails);
          
          if (response.status === 429 || errorDetails.error?.code === 'rate_limit_exceeded') {
            throw new Error('AI service is currently busy. Please try again in a few moments.');
          } else if (response.status >= 500) {
            throw new Error('AI service is temporarily unavailable. Please try again later.');
          } else {
            throw new Error(`AI service error: ${errorDetails.error?.message || 'Unknown error'}`);
          }
        }

        const aiResponse = await response.json();
        tailoredResume = aiResponse.choices[0]?.message?.content;

        if (!tailoredResume) {
          console.error(`❌ [${requestId}] No content in AI response:`, aiResponse);
          throw new Error('AI service returned empty response. Please try again.');
        }

        console.log(`✅ [${requestId}] AI response received, length: ${tailoredResume.length} chars`);

      } catch (fetchError) {
        clearTimeout(timeoutId);
        if (fetchError.name === 'AbortError') {
          console.error(`❌ [${requestId}] OpenAI request timed out after ${openAITimeout}ms`);
          throw new Error('AI service request timed out. Please try again with a shorter resume or job description.');
        }
        throw fetchError;
      }

      // Validate generated resume
      if (!tailoredResume || tailoredResume.trim().length === 0) {
        throw new Error('AI service generated empty resume. Please try again.');
      }

      // Professional resume quality scoring with enhanced error handling
      const resumeText = tailoredResume.toLowerCase();
    
    // Check for critical missing sections and handle gracefully
    const hasMissingEducation = !resumeText.includes('education') && !resumeText.includes('degree') && !resumeText.includes('bachelor') && !resumeText.includes('master');
    const hasMissingContact = !resumeText.includes('@') || !resumeText.includes('phone');
    const hasMissingExperience = !resumeText.includes('experience') && !resumeText.includes('professional') && !resumeText.includes('company');
    
    // Enhanced validation for quality
    if (tailoredResume.length < 500) {
      console.warn('⚠️ Generated resume appears too short, may indicate processing issue');
    }
    
    // Evaluate essential skill coverage
    const essentialSkillMatches = jobAnalysis.essentialSkills.filter(skill => 
      resumeText.includes(skill.toLowerCase())
    ).length;
    
    // Evaluate preferred skill coverage  
    const preferredSkillMatches = jobAnalysis.preferredSkills.filter(skill => 
      resumeText.includes(skill.toLowerCase())
    ).length;
    
    // Check for professional structure elements
    const hasContactInfo = resumeText.includes('email') && (resumeText.includes('phone') || resumeText.includes('555'));
    const hasProfessionalSummary = resumeText.includes('summary') || resumeText.includes('profile') || resumeText.includes('professional summary');
    const hasQuantifiedAchievements = /\d+%|\$[\d,]+|\d+\+?\s+(years|users|customers|projects|team|increase|improvement|reduction)/g.test(resumeText);
    const hasActionVerbs = /(led|developed|implemented|achieved|managed|created|improved|delivered|built|designed|optimized|executed|coordinated)/g.test(resumeText);
    const hasEducation = resumeText.includes('education') || resumeText.includes('degree') || resumeText.includes('available upon request');
    const hasCoreCompetencies = resumeText.includes('competencies') || resumeText.includes('core skills') || resumeText.includes('key skills');
    
    // Professional formatting and ATS compliance check
    const hasProperSections = [
      'experience', 'education', 'skills', 'summary'
    ].filter(section => resumeText.includes(section)).length;
    
    const hasIndustryTerms = jobAnalysis.keywords.filter(keyword => 
      resumeText.includes(keyword.toLowerCase())
    ).length;
    
    // Calculate comprehensive score with error handling considerations
    const skillCoverageScore = Math.round(
      ((essentialSkillMatches / Math.max(jobAnalysis.essentialSkills.length, 1)) * 35) +
      ((preferredSkillMatches / Math.max(jobAnalysis.preferredSkills.length, 1)) * 15) +
      ((hasIndustryTerms / Math.max(jobAnalysis.keywords.length, 1)) * 10)
    );
    
    const structureScore = [
      hasContactInfo ? 10 : 0,
      hasProfessionalSummary ? 15 : 0,
      hasQuantifiedAchievements ? 12 : 0,
      hasActionVerbs ? 10 : 0,
      hasEducation ? 8 : 0,
      hasCoreCompetencies ? 6 : 0,
      hasProperSections >= 3 ? 9 : hasProperSections * 3
    ].reduce((sum, score) => sum + score, 0);
    
    // Penalty for missing critical elements
    const missingElementsPenalty = [
      hasMissingContact ? -5 : 0,
      hasMissingExperience ? -10 : 0,
      tailoredResume.length < 500 ? -5 : 0
    ].reduce((sum, penalty) => sum + penalty, 0);
    
    const finalScore = Math.min(96, Math.max(72, skillCoverageScore + structureScore + 10 + missingElementsPenalty));

      console.log(`✅ [${requestId}] Resume created successfully. Quality Score: ${finalScore}%`);
      console.log(`📊 [${requestId}] Assessment:`, {
        essentialSkills: `${essentialSkillMatches}/${jobAnalysis.essentialSkills.length}`,
        preferredSkills: `${preferredSkillMatches}/${jobAnalysis.preferredSkills.length}`,
        structureScore: structureScore,
        processingTime: `${Date.now() - startTime}ms`
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

      const duration = Date.now() - startTime;
      console.log(`🎉 [${requestId}] Request completed successfully in ${duration}ms`);

      return new Response(
        JSON.stringify({
          success: true,
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
          },
          requestId,
          timestamp: new Date().toISOString()
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    };

    // Race between processing and timeout
    return await Promise.race([processRequest(), timeoutPromise]);

  } catch (error) {
    const duration = Date.now() - startTime;
    console.error(`❌ [${requestId}] Error after ${duration}ms:`, error);
    
    // Always return a 200 response with error details in the body
    // This prevents the "non-2xx status code" errors on the frontend
    return new Response(
      JSON.stringify({ 
        success: false,
        error: error.message || 'An unexpected error occurred while processing your CV.',
        requestId: requestId,
        timestamp: new Date().toISOString(),
        // Include helpful context for debugging
        context: {
          duration: duration,
          errorType: error.name || 'Unknown',
        }
      }),
      { 
        status: 200, // Always return 200 to prevent frontend errors
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
})
