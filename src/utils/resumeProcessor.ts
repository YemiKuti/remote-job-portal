
import { supabase } from '@/integrations/supabase/client';

export interface ResumeContent {
  text: string;
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
    
    // For PDF files, we'll use a simple text extraction for now
    // In production, this would integrate with a proper PDF parsing service
    if (file.type === 'application/pdf') {
      return await extractPDFContent(file);
    }
    
    // For text files
    if (file.type === 'text/plain') {
      const text = await file.text();
      return parseResumeText(text);
    }
    
    // For other formats, return basic structure
    console.warn('⚠️ Unsupported file type, using filename as content');
    return {
      text: `Resume file: ${file.name}`,
      sections: {
        summary: `Professional resume - ${file.name}`,
        experience: [],
        skills: [],
        education: []
      }
    };
  } catch (error) {
    console.error('❌ Error extracting resume content:', error);
    throw new Error('Failed to process resume file');
  }
};

const extractPDFContent = async (file: File): Promise<ResumeContent> => {
  // Placeholder for PDF extraction - in production would use PDF.js or server-side processing
  console.log('📄 Processing PDF file:', file.name);
  
  // Simulate PDF processing
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  return {
    text: `Resume content from ${file.name} (PDF processing would happen here)`,
    sections: {
      summary: "Experienced professional with strong background in technology",
      experience: [
        "Software Developer - 3 years",
        "Project Manager - 2 years"
      ],
      skills: ["JavaScript", "React", "Node.js", "Project Management"],
      education: ["Bachelor's in Computer Science"]
    }
  };
};

const parseResumeText = (text: string): ResumeContent => {
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
  
  return {
    text,
    sections
  };
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
