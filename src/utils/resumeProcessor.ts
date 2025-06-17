import { supabase } from '@/integrations/supabase/client';
import { extractCandidateData, type CandidateData } from './candidateDataExtractor';

export interface ResumeContent {
  text: string;
  candidateData: CandidateData;
  sections: {
    summary?: string;
    experience?: string[];
    skills?: string[];
    education?: string[];
  };
}

export const extractResumeContent = async (file: File): Promise<ResumeContent> => {
  try {
    console.log('🔄 Extracting content from resume file:', file.name);
    
    let text = '';
    
    // For PDF files, we'll use a simple text extraction for now
    // In production, this would integrate with a proper PDF parsing service
    if (file.type === 'application/pdf') {
      text = await extractPDFContent(file);
    } else if (file.type === 'text/plain') {
      text = await file.text();
    } else {
      // For other formats, return basic structure
      console.warn('⚠️ Unsupported file type, using filename as content');
      text = `Resume file: ${file.name}`;
    }

    // Extract structured candidate data
    const candidateData = extractCandidateData(text);
    
    return {
      text,
      candidateData,
      sections: parseResumeText(text)
    };
  } catch (error) {
    console.error('❌ Error extracting resume content:', error);
    throw new Error('Failed to process resume file');
  }
};

const extractPDFContent = async (file: File): Promise<string> => {
  // Placeholder for PDF extraction - in production would use PDF.js or server-side processing
  console.log('📄 Processing PDF file:', file.name);
  
  // Simulate PDF processing
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Return mock content that would be extracted from PDF
  return `John Doe
john.doe@email.com
(555) 123-4567
123 Main St, City, State 12345

PROFESSIONAL SUMMARY
Experienced software developer with 5+ years of experience in web development and project management. Skilled in JavaScript, React, Node.js, and cloud technologies.

EXPERIENCE

Senior Software Developer
Tech Solutions Inc. - 2021 to Present
• Led development of client-facing web applications using React and Node.js
• Improved application performance by 40% through code optimization
• Mentored junior developers and conducted code reviews

Software Developer
StartupCorp - 2019 to 2021
• Developed REST APIs and microservices using Node.js and Express
• Collaborated with cross-functional teams to deliver features on time
• Implemented automated testing procedures

EDUCATION

Bachelor of Science in Computer Science
University of Technology - 2019
GPA: 3.8/4.0

SKILLS
JavaScript, React, Node.js, Python, AWS, Docker, Git, PostgreSQL, MongoDB, REST APIs, GraphQL, Agile Development

CERTIFICATIONS
AWS Certified Developer Associate - 2022
React Developer Certification - 2021`;
};

const parseResumeText = (text: string) => {
  // Basic text parsing logic
  const lines = text.split('\n').filter(line => line.trim());
  
  const sections = {
    summary: '',
    experience: [] as string[],
    skills: [] as string[],
    education: [] as string[]
  };
  
  let currentSection = '';
  
  for (const line of lines) {
    const lowerLine = line.toLowerCase().trim();
    
    if (lowerLine.includes('summary') || lowerLine.includes('objective')) {
      currentSection = 'summary';
      continue;
    } else if (lowerLine.includes('experience') || lowerLine.includes('work')) {
      currentSection = 'experience';
      continue;
    } else if (lowerLine.includes('skills') || lowerLine.includes('technical')) {
      currentSection = 'skills';
      continue;
    } else if (lowerLine.includes('education') || lowerLine.includes('degree')) {
      currentSection = 'education';
      continue;
    }
    
    if (line.trim()) {
      switch (currentSection) {
        case 'summary':
          sections.summary += line + ' ';
          break;
        case 'experience':
          sections.experience.push(line.trim());
          break;
        case 'skills':
          sections.skills.push(line.trim());
          break;
        case 'education':
          sections.education.push(line.trim());
          break;
      }
    }
  }
  
  return sections;
};

export const uploadResumeToStorage = async (file: File, userId: string): Promise<string> => {
  try {
    const fileName = `${Date.now()}-${file.name}`;
    const filePath = `${userId}/${fileName}`;
    
    console.log('📤 Uploading resume to storage:', filePath);
    
    const { error: uploadError } = await supabase.storage
      .from('documents')
      .upload(filePath, file);
    
    if (uploadError) {
      console.error('❌ Upload error:', uploadError);
      throw new Error(`Upload failed: ${uploadError.message}`);
    }
    
    const { data: { publicUrl } } = supabase.storage
      .from('documents')
      .getPublicUrl(filePath);
    
    console.log('✅ Resume uploaded successfully');
    return publicUrl;
  } catch (error) {
    console.error('❌ Error uploading resume:', error);
    throw error;
  }
};

export const downloadTailoredResume = async (filePath: string): Promise<Blob> => {
  try {
    console.log('⬇️ Downloading tailored resume:', filePath);
    
    const { data, error } = await supabase.storage
      .from('documents')
      .download(filePath);
    
    if (error) {
      console.error('❌ Download error:', error);
      throw new Error(`Download failed: ${error.message}`);
    }
    
    console.log('✅ Resume downloaded successfully');
    return data;
  } catch (error) {
    console.error('❌ Error downloading resume:', error);
    throw error;
  }
};
