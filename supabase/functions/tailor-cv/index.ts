
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import "https://deno.land/x/xhr@0.1.0/mod.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Helper function to truncate text while preserving important sections
const smartTruncate = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;
  
  const lines = text.split('\n');
  const importantSections = [];
  let currentLength = 0;
  
  for (const line of lines) {
    const trimmedLine = line.trim();
    if (trimmedLine.length === 0) continue;
    
    const isImportant = /^(summary|objective|experience|education|skills|work|employment|achievements?|projects?|certifications?)/i.test(trimmedLine) ||
                       trimmedLine.length < 100;
    
    if (isImportant || currentLength + line.length < maxLength) {
      importantSections.push(line);
      currentLength += line.length + 1;
    }
    
    if (currentLength >= maxLength) break;
  }
  
  return importantSections.join('\n');
};

const formatCandidateInfo = (candidateData: any): string => {
  if (!candidateData) return '';
  
  let candidateSection = '\n\nCANDIDATE INFORMATION (USE THIS EXACT INFORMATION):\n';
  
  // Personal Information
  if (candidateData.personalInfo) {
    if (candidateData.personalInfo.name) {
      candidateSection += `Full Name: ${candidateData.personalInfo.name}\n`;
    }
    if (candidateData.personalInfo.email) {
      candidateSection += `Email: ${candidateData.personalInfo.email}\n`;
    }
    if (candidateData.personalInfo.phone) {
      candidateSection += `Phone: ${candidateData.personalInfo.phone}\n`;
    }
    if (candidateData.personalInfo.address) {
      candidateSection += `Address: ${candidateData.personalInfo.address}\n`;
    }
    if (candidateData.personalInfo.linkedin) {
      candidateSection += `LinkedIn: ${candidateData.personalInfo.linkedin}\n`;
    }
  }
  
  // Summary
  if (candidateData.summary) {
    candidateSection += `\nProfessional Summary: ${candidateData.summary}\n`;
  }
  
  // Experience
  if (candidateData.experience && candidateData.experience.length > 0) {
    candidateSection += '\nWork Experience:\n';
    candidateData.experience.forEach((exp: any, index: number) => {
      candidateSection += `${index + 1}. ${exp.title || 'Position'} at ${exp.company || 'Company'}\n`;
      if (exp.duration) candidateSection += `   Duration: ${exp.duration}\n`;
      if (exp.description) candidateSection += `   Description: ${exp.description}\n`;
    });
  }
  
  // Education
  if (candidateData.education && candidateData.education.length > 0) {
    candidateSection += '\nEducation:\n';
    candidateData.education.forEach((edu: any) => {
      candidateSection += `- ${edu.degree || 'Degree'} from ${edu.institution || 'Institution'}`;
      if (edu.year) candidateSection += ` (${edu.year})`;
      candidateSection += '\n';
    });
  }
  
  // Skills
  if (candidateData.skills && candidateData.skills.length > 0) {
    candidateSection += `\nSkills: ${candidateData.skills.join(', ')}\n`;
  }
  
  // Certifications
  if (candidateData.certifications && candidateData.certifications.length > 0) {
    candidateSection += `\nCertifications: ${candidateData.certifications.join(', ')}\n`;
  }
  
  return candidateSection;
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { resumeContent, jobDescription, jobTitle, companyName, candidateData } = await req.json()

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

    // Truncate content to fit within token limits
    const truncatedResume = smartTruncate(resumeContent, 2500);
    const truncatedJobDescription = smartTruncate(jobDescription, 2000);
    const candidateInfo = formatCandidateInfo(candidateData);

    const prompt = `You are a professional resume writer and ATS optimization specialist. Create a tailored, professional resume using the EXACT candidate information provided below.

${candidateInfo}

ORIGINAL RESUME CONTENT:
${truncatedResume}

JOB POSTING:
Position: ${jobTitle || 'Not specified'}
Company: ${companyName || 'Not specified'}
Description: ${truncatedJobDescription}

CRITICAL INSTRUCTIONS:
1. YOU MUST use the EXACT candidate information provided above - DO NOT use placeholders like [Your Name], [Your Email], etc.
2. Start with a professional header containing the candidate's actual contact information
3. Use the candidate's real name, email, phone, and address from the candidate information section
4. Write a compelling professional summary tailored to this specific role using the candidate's actual experience
5. Include the candidate's actual work experience, education, and skills
6. Enhance and tailor the content to match the job requirements while keeping all information truthful
7. Use keywords from the job description naturally throughout
8. Ensure all sections are complete and professional
9. Format for ATS compatibility with clear section headers
10. DO NOT include any placeholders, brackets, or instructions for the user to fill in information

REQUIRED SECTIONS:
- Professional header with actual contact information (name, email, phone, address, LinkedIn if available)
- Professional summary tailored to the specific role
- Work experience with actual companies, dates, and achievements
- Education with actual degrees and institutions
- Skills relevant to the role
- Certifications if applicable

Generate a complete, ready-to-use resume with all actual candidate information filled in:`;

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
            content: 'You are an expert resume writer. You MUST use the exact candidate information provided in the prompt. Never use placeholders like [Your Name] or [Your Email]. Always use the actual candidate data provided. Create professional, complete resumes with real information that are ready to use immediately.'
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
      console.error('OpenAI API error:', error)
      
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

    // Generate a simple score based on keyword matching
    const jobKeywords = truncatedJobDescription.toLowerCase().match(/\b\w{3,}\b/g) || []
    const resumeKeywords = tailoredResume.toLowerCase().match(/\b\w{3,}\b/g) || []
    const matchedKeywords = jobKeywords.filter(keyword => 
      resumeKeywords.includes(keyword)
    )
    const score = Math.min(95, Math.max(75, Math.round((matchedKeywords.length / jobKeywords.length) * 100)))

    return new Response(
      JSON.stringify({
        tailoredResume,
        score,
        suggestions: {
          keywordsMatched: matchedKeywords.length,
          totalKeywords: jobKeywords.length,
          recommendations: [
            'Resume includes actual candidate contact information',
            'Professional summary tailored to the specific role',
            'Keywords from job description naturally integrated',
            'Content structured for ATS compatibility',
            'All candidate information properly included'
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
