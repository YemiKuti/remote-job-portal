
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import "https://deno.land/x/xhr@0.1.0/mod.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.4'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Initialize Supabase client for storage and database operations
const supabaseUrl = Deno.env.get('SUPABASE_URL')!
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
const openAiApiKey = Deno.env.get('OPENAI_API_KEY')!
const supabase = createClient(supabaseUrl, supabaseServiceKey)

// Enhanced PDF/DOCX content extraction functions
const extractPdfText = async (arrayBuffer: ArrayBuffer): Promise<string> => {
  try {
    // Simple PDF text extraction - look for text objects
    const uint8Array = new Uint8Array(arrayBuffer);
    const textDecoder = new TextDecoder('utf-8', { fatal: false });
    let pdfText = textDecoder.decode(uint8Array);
    
    // Extract text between common PDF text markers
    const textMatches = pdfText.match(/\((.*?)\)/g) || [];
    const extractedText = textMatches
      .map(match => match.slice(1, -1))
      .filter(text => text.length > 2 && /[a-zA-Z]/.test(text))
      .join(' ');
    
    if (extractedText.length < 50) {
      // Fallback: try to decode entire content and clean it
      const cleanedText = pdfText
        .replace(/[^\x20-\x7E\n\r]/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
      
      const words = cleanedText.split(' ').filter(word => 
        word.length > 1 && /^[a-zA-Z0-9@.-]+$/.test(word)
      );
      
      if (words.length < 10) {
        throw new Error('Could not extract sufficient text from PDF');
      }
      
      return words.join(' ');
    }
    
    return extractedText;
  } catch (error) {
    throw new Error('PDF format not supported or file is corrupted. Please upload a text-based PDF or DOCX file.');
  }
};

const extractDocxText = async (arrayBuffer: ArrayBuffer): Promise<string> => {
  try {
    // Simple DOCX text extraction by looking for XML content
    const uint8Array = new Uint8Array(arrayBuffer);
    const textDecoder = new TextDecoder('utf-8', { fatal: false });
    const docxContent = textDecoder.decode(uint8Array);
    
    // Look for word/document.xml content patterns
    const textMatches = docxContent.match(/<w:t[^>]*>(.*?)<\/w:t>/g) || [];
    const extractedText = textMatches
      .map(match => match.replace(/<[^>]*>/g, '').trim())
      .filter(text => text.length > 0)
      .join(' ');
    
    if (extractedText.length < 50) {
      // Fallback: extract any readable text
      const cleanedText = docxContent
        .replace(/<[^>]*>/g, ' ')
        .replace(/[^\x20-\x7E\n\r]/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
      
      const words = cleanedText.split(' ').filter(word => 
        word.length > 1 && /^[a-zA-Z0-9@.-]+$/.test(word)
      );
      
      if (words.length < 10) {
        throw new Error('Could not extract sufficient text from DOCX');
      }
      
      return words.join(' ');
    }
    
    return extractedText;
  } catch (error) {
    throw new Error('DOCX format not supported or file is corrupted. Please upload a valid DOCX file.');
  }
};

// Generate PDF from text content
const generatePdf = async (content: string, title: string): Promise<Uint8Array> => {
  // Simple PDF generation - create basic PDF structure
  const pdfHeader = '%PDF-1.4\n';
  const pdfBody = `1 0 obj
<<
/Type /Catalog
/Pages 2 0 R
>>
endobj

2 0 obj
<<
/Type /Pages
/Kids [3 0 R]
/Count 1
>>
endobj

3 0 obj
<<
/Type /Page
/Parent 2 0 R
/MediaBox [0 0 612 792]
/Contents 4 0 R
/Resources <<
/Font <<
/F1 5 0 R
>>
>>
>>
endobj

4 0 obj
<<
/Length ${content.length + 100}
>>
stream
BT
/F1 12 Tf
50 750 Td
`;

  const pdfContent = content
    .split('\n')
    .map(line => `(${line.replace(/[()\\]/g, '\\$&')}) Tj\n0 -15 Td\n`)
    .join('');

  const pdfFooter = `ET
endstream
endobj

5 0 obj
<<
/Type /Font
/Subtype /Type1
/BaseFont /Helvetica
>>
endobj

xref
0 6
0000000000 65535 f 
0000000010 00000 n 
0000000079 00000 n 
0000000173 00000 n 
0000000301 00000 n 
0000000${(pdfBody.length + pdfContent.length + 50).toString().padStart(6, '0')} 00000 n 
trailer
<<
/Size 6
/Root 1 0 R
>>
startxref
${(pdfBody.length + pdfContent.length + 150)}
%%EOF`;

  const fullPdf = pdfHeader + pdfBody + pdfContent + pdfFooter;
  return new TextEncoder().encode(fullPdf);
};

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

// Calculate match score between candidate skills and job requirements
const calculateMatchScore = (candidateSkills: string[], essentialSkills: string[], preferredSkills: string[]): number => {
  const normalizeSkill = (skill: string) => skill.toLowerCase().trim();
  const normalizedCandidateSkills = candidateSkills.map(normalizeSkill);
  
  let score = 0;
  let totalPossible = 0;
  
  // Essential skills are worth more (60% of total score)
  const essentialMatches = essentialSkills.filter(skill => 
    normalizedCandidateSkills.some(candidateSkill => 
      candidateSkill.includes(normalizeSkill(skill)) || normalizeSkill(skill).includes(candidateSkill)
    )
  ).length;
  
  const essentialWeight = 60;
  const essentialScore = essentialSkills.length > 0 ? (essentialMatches / essentialSkills.length) * essentialWeight : 0;
  score += essentialScore;
  totalPossible += essentialWeight;
  
  // Preferred skills are worth less (40% of total score)
  const preferredMatches = preferredSkills.filter(skill => 
    normalizedCandidateSkills.some(candidateSkill => 
      candidateSkill.includes(normalizeSkill(skill)) || normalizeSkill(skill).includes(candidateSkill)
    )
  ).length;
  
  const preferredWeight = 40;
  const preferredScore = preferredSkills.length > 0 ? (preferredMatches / preferredSkills.length) * preferredWeight : 0;
  score += preferredScore;
  totalPossible += preferredWeight;
  
  return Math.round((score / totalPossible) * 100);
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
    const requestData = await req.json();
    const { fileUrl, fileName, jobId, jobDescription, candidateData } = requestData;

    console.log(`📁 Processing file: ${fileName}`);
    console.log(`💼 Job ID: ${jobId}`);

    // Validate required fields
    if (!fileUrl || !fileName || !jobDescription) {
      throw new Error('Missing required fields: fileUrl, fileName, or jobDescription');
    }

    // Download file from storage
    const { data: fileData, error: downloadError } = await supabase.storage
      .from('cvs')
      .download(fileUrl);

    if (downloadError || !fileData) {
      console.error('❌ Error downloading file:', downloadError);
      throw new Error('Unable to download CV file. Please try again.');
    }

    console.log(`📄 File downloaded successfully: ${fileData.size} bytes`);

    // Extract text based on file type
    let resumeContent = '';
    const fileExtension = fileName.toLowerCase().split('.').pop();
    const arrayBuffer = await fileData.arrayBuffer();

    console.log(`🔍 Extracting text from ${fileExtension?.toUpperCase()} file...`);

    try {
      if (fileExtension === 'pdf') {
        resumeContent = await extractPdfText(arrayBuffer);
      } else if (fileExtension === 'docx') {
        resumeContent = await extractDocxText(arrayBuffer);
      } else if (fileExtension === 'txt') {
        const decoder = new TextDecoder();
        resumeContent = decoder.decode(arrayBuffer);
      } else {
        throw new Error(`Unsupported file format: ${fileExtension}. Please upload PDF, DOCX, or TXT files only.`);
      }

      if (!resumeContent || resumeContent.trim().length < 50) {
        throw new Error('Please upload a valid CV in PDF, DOCX, or TXT format.');
      }
    } catch (error: any) {
      console.error('❌ Text extraction failed:', error.message);
      return new Response(JSON.stringify({ 
        error: error.message.includes('format') || error.message.includes('corrupted') 
          ? error.message 
          : 'Please upload a valid CV in PDF, DOCX, or TXT format.' 
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    console.log(`✅ Text extracted successfully: ${resumeContent.length} characters`);

    // Analyze job requirements
    const jobAnalysis = analyzeJobRequirements(jobDescription, jobId);
    const candidateAnalysis = analyzeResumeContent(resumeContent, candidateData);

    console.log(`🎯 Job analysis complete - Essential skills: ${jobAnalysis.essentialSkills.length}, Experience level: ${jobAnalysis.experienceLevel}`);
    console.log(`👤 Candidate analysis complete - Current skills: ${candidateAnalysis.currentSkills.length}, Career level: ${candidateAnalysis.careerLevel}`);

    // Generate AI-tailored CV using OpenAI
    const aiPrompt = `As an expert career coach and resume writer, tailor this resume for the specific job position.

JOB DETAILS:
- Title: ${jobId}
- Experience Level Required: ${jobAnalysis.experienceLevel}
- Essential Skills: ${jobAnalysis.essentialSkills.join(', ')}
- Preferred Skills: ${jobAnalysis.preferredSkills.join(', ')}
- Key Responsibilities: ${jobAnalysis.responsibilities.join(', ')}

CANDIDATE PROFILE:
- Current Career Level: ${candidateAnalysis.careerLevel}
- Current Skills: ${candidateAnalysis.currentSkills.join(', ')}
- Education Level: ${candidateAnalysis.educationLevel}
${formatCandidateInfo(candidateData, resumeContent)}

ORIGINAL RESUME:
${resumeContent}

JOB DESCRIPTION:
${jobDescription}

INSTRUCTIONS:
1. Rewrite the resume to maximize alignment with this specific job
2. Emphasize relevant skills and experience that match job requirements
3. Use keywords from the job description naturally throughout
4. Quantify achievements where possible
5. Adjust the professional summary to target this role specifically
6. Reorganize sections to highlight most relevant information first
7. Maintain professional formatting and readability
8. Keep the same factual information but present it strategically

Please return a well-formatted, tailored resume that significantly improves the candidate's chances for this specific position.`;

    console.log(`🤖 Sending request to OpenAI...`);

    const openAiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-5-2025-08-07',
        messages: [
          {
            role: 'system',
            content: 'You are an expert career coach and resume writer. Create compelling, ATS-optimized resumes that maximize job match scores.'
          },
          {
            role: 'user',
            content: aiPrompt
          }
        ],
        max_completion_tokens: 4000,
        temperature: 0.7
      })
    });

    if (!openAiResponse.ok) {
      const errorData = await openAiResponse.json();
      console.error('❌ OpenAI API error:', errorData);
      throw new Error('Unable to generate tailored CV. Please try again.');
    }

    const aiResult = await openAiResponse.json();
    const tailoredContent = aiResult.choices[0]?.message?.content;
    
    if (!tailoredContent) {
      throw new Error('Unable to generate tailored CV. Please try again.');
    }

    console.log(`✅ AI tailoring complete: ${tailoredContent.length} characters`);

    // Calculate match score
    const matchScore = calculateMatchScore(candidateAnalysis.currentSkills, jobAnalysis.essentialSkills, jobAnalysis.preferredSkills);

    const processingTime = Date.now() - startTime;
    console.log(`🎉 [${requestId}] CV tailoring completed in ${processingTime}ms`);

    return new Response(JSON.stringify({
      success: true,
      tailoredContent,
      analysis: {
        matchScore,
        jobAnalysis,
        candidateAnalysis,
        processingTime: `${processingTime}ms`
      },
      metadata: {
        originalLength: resumeContent.length,
        tailoredLength: tailoredContent.length,
        fileName,
        fileType: fileExtension?.toUpperCase(),
        requestId
      }
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error: any) {
    const processingTime = Date.now() - startTime;
    console.error(`❌ [${requestId}] CV tailoring failed after ${processingTime}ms:`, error.message);
    
    return new Response(JSON.stringify({ 
      error: error.message || 'Unable to generate tailored CV. Please try again.',
      requestId,
      processingTime: `${processingTime}ms`
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
    });

    const processRequest = async () => {
      let requestData: any = {};
      
      try {
        // Check if request contains file upload (multipart/form-data)
        const contentType = req.headers.get('content-type') || '';
        
        if (contentType.includes('multipart/form-data')) {
          console.log(`📁 [${requestId}] Processing file upload`);
          
          const formData = await req.formData();
          const file = formData.get('file') as File;
          const jobDescription = formData.get('jobDescription') as string;
          const jobTitle = formData.get('jobTitle') as string;
          const companyName = formData.get('companyName') as string;
          const userId = formData.get('userId') as string;
          
          if (!file) {
            throw new Error('No file uploaded. Please select a resume file.');
          }
          
          console.log(`📄 [${requestId}] File uploaded: ${file.name} (${file.size} bytes)`);
          
          // Validate file format
          const fileName = file.name.toLowerCase();
          const supportedFormats = ['.pdf', '.docx', '.doc', '.txt'];
          const isSupported = supportedFormats.some(format => fileName.endsWith(format));
          
          if (!isSupported) {
            throw new Error('Unsupported or corrupted file. Please upload a valid PDF or DOCX.');
          }
          
          // Validate file size
          if (file.size > 15 * 1024 * 1024) { // 15MB limit
            throw new Error('File too large. Please upload a file smaller than 15MB.');
          }
          
          if (file.size < 100) {
            throw new Error('File too small. Please upload a valid resume file.');
          }
          
           // Extract content from uploaded file
           const arrayBuffer = await file.arrayBuffer();
           let resumeContent = '';
           
           try {
             if (fileName.endsWith('.pdf')) {
               resumeContent = await extractPdfText(arrayBuffer);
             } else if (fileName.endsWith('.docx')) {
               resumeContent = await extractDocxText(arrayBuffer);
             } else if (fileName.endsWith('.txt')) {
               resumeContent = new TextDecoder().decode(arrayBuffer);
             } else {
               // Try different extraction methods as fallback
               try {
                 resumeContent = await extractDocxText(arrayBuffer);
               } catch {
                 try {
                   resumeContent = await extractPdfText(arrayBuffer);
                 } catch {
                   resumeContent = new TextDecoder().decode(arrayBuffer);
                 }
               }
             }
             
             console.log(`✅ [${requestId}] Content extracted: ${resumeContent.length} characters`);
             
           } catch (extractError: any) {
             console.error(`❌ [${requestId}] Content extraction failed:`, extractError);
             throw new Error('Unsupported or corrupted file. Please upload a valid PDF or DOCX.');
           }
           
           // Validate extracted content
           if (!resumeContent || resumeContent.trim().length < 30) {
             throw new Error('Unsupported or corrupted file. Please upload a valid PDF or DOCX.');
           }

           // Upload original file to private resumes bucket and create resume record (processing)
           let resumeRecordId: string | null = null;
           let resumesStoragePath: string | null = null;
           try {
             const originalFileName = `${requestId}-${file.name}`;
             resumesStoragePath = `resumes/${userId}/${originalFileName}`;
             const contentType = file.type || (fileName.endsWith('.pdf') ? 'application/pdf' : fileName.endsWith('.docx') ? 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' : 'text/plain');

             const { error: uploadOriginalError } = await supabase.storage
               .from('resumes')
               .upload(resumesStoragePath, arrayBuffer, {
                 contentType,
                 upsert: true
               });

             if (uploadOriginalError) {
               console.error(`❌ [${requestId}] Error uploading original resume:`, uploadOriginalError);
             } else {
               // Insert resume DB record with processing status
               const { data: resumeInsert, error: resumeDbError } = await supabase
                 .from('resumes')
                 .insert({
                   user_id: userId,
                   file_url: resumesStoragePath,
                   file_name: file.name,
                   file_size: file.size,
                   status: 'processing'
                 })
                 .select('id')
                 .single();

               if (resumeDbError) {
                 console.error(`❌ [${requestId}] Error inserting resume record:`, resumeDbError);
               } else {
                 resumeRecordId = resumeInsert.id;
                 console.log(`✅ [${requestId}] Resume record created: ${resumeRecordId}`);
               }
             }
           } catch (resUploadErr) {
             console.error(`❌ [${requestId}] Failed to store original resume:`, resUploadErr);
           }
           
           requestData = {
             resumeContent: resumeContent.trim(),
             jobDescription: jobDescription || '',
             jobTitle: jobTitle || 'Position',
             companyName: companyName || 'Company',
             userId,
             fileName: file.name,
             candidateData: null, // File upload doesn't include structured candidate data
             resumeRecordId,
             resumesStoragePath
           };
          
        } else {
          // Handle JSON request (existing flow)
          requestData = await req.json();
        }
        
      } catch (error: any) {
        console.error(`❌ [${requestId}] Request parsing error:`, error);
        
        if (error.message.includes('upload') || error.message.includes('file')) {
          throw error; // Re-throw file-specific errors
        }
        
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

      const { resumeContent, jobDescription, jobTitle, companyName, candidateData, userId, fileName } = requestData;

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
            error: '⚠️ Please provide a valid CV and Job Description.',
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
        experienceLevel: jobAnalysis.experienceLevel,
        keywords: jobAnalysis.keywords.length
      });

      // Analyze resume content
      console.log(`📋 [${requestId}] Analyzing resume content...`);
      const resumeAnalysis = analyzeResumeContent(resumeContent, candidateData);
      console.log(`📋 [${requestId}] Resume analysis completed:`, {
        currentSkills: resumeAnalysis.currentSkills.length,
        achievements: resumeAnalysis.achievements.length,
        careerLevel: resumeAnalysis.careerLevel,
        educationLevel: resumeAnalysis.educationLevel
      });

      // Calculate skill alignment
      const skillAlignment = resumeAnalysis.currentSkills.filter(skill => 
        jobAnalysis.essentialSkills.some(essentialSkill => 
          skill.toLowerCase().includes(essentialSkill.toLowerCase()) || 
          essentialSkill.toLowerCase().includes(skill.toLowerCase())
        )
      );
      
      // Calculate critical gaps - essential skills missing from candidate's resume
      const criticalGaps = jobAnalysis.essentialSkills.filter(essentialSkill =>
        !resumeAnalysis.currentSkills.some(skill =>
          skill.toLowerCase().includes(essentialSkill.toLowerCase()) || 
          essentialSkill.toLowerCase().includes(skill.toLowerCase())
        )
      );
      
      // Calculate initial match score
      const skillsMatched = skillAlignment.length;
      const matchScore = jobAnalysis.essentialSkills.length > 0 
        ? Math.round((skillsMatched / jobAnalysis.essentialSkills.length) * 100)
        : 85;

      console.log(`📊 [${requestId}] Match analysis:`, {
        skillsMatched,
        totalEssentialSkills: jobAnalysis.essentialSkills.length,
        matchScore,
        alignedSkills: skillAlignment.slice(0, 5),
        criticalGaps: criticalGaps.slice(0, 3)
      });
      
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
Current Skill Set: ${resumeAnalysis.currentSkills.join(', ')}
Career Level: ${resumeAnalysis.careerLevel}
Key Achievements: ${resumeAnalysis.achievements.slice(0, 5).join('; ')}
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
   - Include ${resumeAnalysis.careerLevel} level positioning
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
      `✅ Professional ${resumeAnalysis.careerLevel}-level resume structure`,
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

      // Save tailored CV to Supabase storage and database
       let downloadUrl = null;
       let tailoredResumeId = null;
       const resumeRecordId = (requestData && requestData.resumeRecordId) || null;
       
       if (userId) {
         try {
          console.log(`💾 [${requestId}] Saving tailored CV to storage...`);
          
          // Generate PDF from tailored resume
          const pdfContent = await generatePdf(tailoredResume, `${jobTitle}_${companyName}_Resume`);
          const pdfFileName = `tailored-cv-${requestId}.pdf`;
          const storagePath = `tailored-resumes/${userId}/${pdfFileName}`;
          
          // Upload PDF to storage
          const { error: storageError } = await supabase.storage
            .from('tailored-resumes')
            .upload(storagePath, pdfContent, {
              contentType: 'application/pdf',
              upsert: true
            });
          
          if (storageError) {
            console.error(`❌ [${requestId}] Storage error:`, storageError);
          } else {
            // Get public URL for download
            const { data } = supabase.storage
              .from('tailored-resumes')
              .getPublicUrl(storagePath);
            
            downloadUrl = data.publicUrl;
            console.log(`✅ [${requestId}] PDF saved to storage: ${storagePath}`);
          }
          
          // Save record to database
          const { data: savedResume, error: dbError } = await supabase
            .from('tailored_resumes')
            .insert({
              user_id: userId,
              original_resume_id: null, // Will be updated from frontend if available
              job_id: null, // Will be updated from frontend if available
              tailored_content: tailoredResume,
              ai_suggestions: {
                qualityScore: `${finalScore}% professional resume quality`,
                recommendations,
                improvementAreas: finalScore < 85 ? [
                  !hasProfessionalSummary ? 'Consider strengthening the professional summary' : null,
                  !hasQuantifiedAchievements ? 'Add more quantified achievements and metrics' : null,
                  essentialSkillMatches < jobAnalysis.essentialSkills.length * 0.7 ? 'Highlight more essential skills from the job requirements' : null,
                  !hasActionVerbs ? 'Use stronger action verbs to demonstrate impact' : null
                ].filter(Boolean) : []
              },
              tailoring_score: finalScore,
              job_title: jobTitle,
              company_name: companyName,
              job_description: jobDescription.substring(0, 5000), // Limit length for DB
              tailored_file_path: storagePath,
              file_format: 'pdf'
            })
            .select()
            .single();
          
          if (dbError) {
             console.error(`❌ [${requestId}] Database error:`, dbError);
           } else {
             tailoredResumeId = savedResume.id;
             console.log(`✅ [${requestId}] Record saved with ID: ${tailoredResumeId}`);
           }

           // Update resumes table record with tailored text and completion status
           if (resumeRecordId) {
             const { error: resumeUpdateError } = await supabase
               .from('resumes')
               .update({
                 tailored_text: tailoredResume,
                 status: 'complete',
                 updated_at: new Date().toISOString()
               })
               .eq('id', resumeRecordId);

             if (resumeUpdateError) {
               console.error(`❌ [${requestId}] Failed updating resume record:`, resumeUpdateError);
             } else {
               console.log(`✅ [${requestId}] Resume record updated to complete`);
             }
           }
           
         } catch (storageError: any) {
          console.error(`❌ [${requestId}] Error saving to storage:`, storageError);
          // Continue without storage - user still gets the tailored resume text
        }
      }

      return new Response(
        JSON.stringify({
          success: true,
          tailoredResume,
          score: finalScore,
          downloadUrl,
          tailoredResumeId,
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
              careerLevel: resumeAnalysis.careerLevel,
              currentSkills: resumeAnalysis.currentSkills.slice(0, 10),
              achievements: resumeAnalysis.achievements.slice(0, 5)
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
