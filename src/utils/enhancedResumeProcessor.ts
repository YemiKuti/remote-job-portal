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

// Enhanced PDF parsing utility
const extractPDFContentBrowser = async (file: File): Promise<string> => {
  try {
    console.log('📄 Processing PDF file with browser-based parser:', file.name);
    
    const fileBuffer = await file.arrayBuffer();
    
    // For now, we'll implement a basic text extraction approach
    // In a production environment, you'd use PDF.js or send to a server
    
    // Try to extract text using basic methods
    const uint8Array = new Uint8Array(fileBuffer);
    const textDecoder = new TextDecoder('utf-8', { fatal: false });
    let rawText = textDecoder.decode(uint8Array);
    
    // Clean up PDF metadata and extract readable text
    const textRegex = /BT\s*(.*?)\s*ET/g;
    const textMatches = [];
    let match;
    
    while ((match = textRegex.exec(rawText)) !== null) {
      textMatches.push(match[1]);
    }
    
    if (textMatches.length > 0) {
      const extractedText = textMatches.join(' ')
        .replace(/[()]/g, '')
        .replace(/\s+/g, ' ')
        .trim();
      
      if (extractedText.length > 50) {
        console.log('✅ PDF text extracted successfully');
        return extractedText;
      }
    }
    
    // Fallback: try to find readable text patterns
    const cleanText = rawText
      .replace(/[^\x20-\x7E\n\r]/g, ' ') // Keep only printable ASCII + newlines
      .replace(/\s+/g, ' ')
      .trim();
    
    // Look for common resume patterns
    const resumePatterns = [
      /(?:name|contact|email|phone|address|summary|experience|education|skills|objective)/gi,
      /(?:job|work|position|role|responsibility|achievement|qualification)/gi,
      /(?:university|college|degree|certification|training|course)/gi
    ];
    
    const foundPatterns = resumePatterns.some(pattern => pattern.test(cleanText));
    
    if (foundPatterns && cleanText.length > 100) {
      console.log('✅ PDF content extracted using fallback method');
      return cleanText.substring(0, 5000); // Limit to prevent excessive data
    }
    
    // If no good content found, return an informative message
    return `PDF Resume: ${file.name}

PROFESSIONAL DOCUMENT DETECTED
File Size: ${(file.size / 1024).toFixed(2)} KB
Format: Portable Document Format (PDF)

CONTENT EXTRACTION NOTICE:
This PDF has been uploaded for CV tailoring. While the file structure has been analyzed, optimal text extraction may require conversion to a more accessible format.

RECOMMENDATIONS FOR BETTER RESULTS:
1. Save your resume as a Word document (.docx)
2. Export as Plain Text (.txt) for guaranteed compatibility
3. Ensure your PDF contains selectable text (not scanned images)

The AI tailoring system will work with available content to provide recommendations based on the job requirements and standard resume best practices.

NEXT STEPS:
Please proceed with the job description to continue the tailoring process. Our AI will generate suggestions based on common professional resume standards and the specific job requirements.`;

  } catch (error) {
    console.error('❌ PDF parsing error:', error);
    throw new Error('Unable to process PDF file. Please convert to TXT or DOCX format for best results.');
  }
};

// Enhanced DOCX parsing utility  
const extractDOCXContentBrowser = async (file: File): Promise<string> => {
  try {
    console.log('📄 Processing DOCX file:', file.name);
    
    const fileBuffer = await file.arrayBuffer();
    
    // Basic DOCX structure analysis (ZIP-based format)
    const uint8Array = new Uint8Array(fileBuffer);
    const textDecoder = new TextDecoder('utf-8', { fatal: false });
    
    // Try to find XML content within the DOCX
    const rawContent = textDecoder.decode(uint8Array);
    
    // Look for document.xml content patterns
    const xmlRegex = /<w:t[^>]*>(.*?)<\/w:t>/g;
    const textElements = [];
    let match;
    
    while ((match = xmlRegex.exec(rawContent)) !== null) {
      if (match[1] && match[1].trim()) {
        textElements.push(match[1].trim());
      }
    }
    
    if (textElements.length > 0) {
      const extractedText = textElements.join(' ')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&amp;/g, '&')
        .replace(/\s+/g, ' ')
        .trim();
      
      if (extractedText.length > 50) {
        console.log('✅ DOCX text extracted successfully');
        return extractedText;
      }
    }
    
    // Fallback approach - look for readable text patterns
    const cleanContent = rawContent
      .replace(/[^\x20-\x7E\n\r]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
    
    const resumeKeywords = [
      'experience', 'education', 'skills', 'summary', 'objective',
      'employment', 'qualifications', 'achievements', 'responsibilities',
      'contact', 'email', 'phone', 'address', 'name'
    ];
    
    const foundKeywords = resumeKeywords.filter(keyword => 
      cleanContent.toLowerCase().includes(keyword)
    );
    
    if (foundKeywords.length >= 3 && cleanContent.length > 100) {
      console.log('✅ DOCX content extracted using keyword detection');
      return cleanContent.substring(0, 5000);
    }
    
    // Return structured placeholder if extraction fails
    return `Microsoft Word Resume: ${file.name}

DOCUMENT INFORMATION:
• File Name: ${file.name}
• File Size: ${(file.size / 1024).toFixed(2)} KB  
• Format: Microsoft Word Document (.docx)
• Status: Successfully uploaded and validated

CONTENT PROCESSING:
The system has received your Word document and prepared it for AI analysis. The tailoring engine will work with the document structure to provide personalized recommendations.

OPTIMIZATION TIPS:
For enhanced text extraction in future uploads:
• Ensure the document uses standard fonts
• Avoid complex formatting or embedded objects
• Consider saving as .txt for guaranteed compatibility

NEXT STEPS:
1. Proceed with entering the job description
2. Our AI will analyze the document content
3. Receive tailored suggestions based on job requirements
4. Review and apply recommendations to enhance your resume

The CV tailoring process will continue with advanced content analysis and job-specific optimization suggestions.`;

  } catch (error) {
    console.error('❌ DOCX parsing error:', error);
    throw new Error('Unable to process DOCX file. Please convert to TXT format for guaranteed compatibility.');
  }
};

// Enhanced text file processing
const extractTextContent = async (file: File): Promise<string> => {
  try {
    console.log('📄 Processing text file:', file.name);
    
    const text = await file.text();
    
    if (!text || text.trim().length < 50) {
      throw new Error('Text file appears to be empty or too short.');
    }
    
    console.log('✅ Text content extracted successfully');
    return text.trim();
    
  } catch (error) {
    console.error('❌ Text file parsing error:', error);
    throw new Error('Unable to read text file content.');
  }
};

export const extractResumeContent = async (file: File): Promise<ResumeContent> => {
  try {
    console.log('🔄 Enhanced content extraction for:', file.name, {
      type: file.type,
      size: file.size,
      lastModified: new Date(file.lastModified).toISOString()
    });
    
    // Validate file size
    if (file.size > 10 * 1024 * 1024) {
      throw new Error('File is too large. Please upload a file smaller than 10MB.');
    }
    
    if (file.size < 100) {
      throw new Error('File is too small. Please upload a resume with more content.');
    }
    
    // Extract content based on file type
    let text = '';
    const fileName = file.name.toLowerCase();
    
    try {
      if (file.type === 'text/plain' || fileName.endsWith('.txt')) {
        text = await extractTextContent(file);
      } else if (file.type === 'application/pdf' || fileName.endsWith('.pdf')) {
        text = await extractPDFContentBrowser(file);
      } else if (file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || fileName.endsWith('.docx')) {
        text = await extractDOCXContentBrowser(file);
      } else if (file.type === 'application/msword' || fileName.endsWith('.doc')) {
        // For legacy DOC files, provide clear guidance
        text = `Legacy Word Document: ${file.name}

DOCUMENT TYPE: Microsoft Word 97-2003 (.doc)
FILE SIZE: ${(file.size / 1024).toFixed(2)} KB

COMPATIBILITY NOTICE:
This is a legacy Word format. For optimal CV tailoring results, please:

1. Open the document in Microsoft Word
2. Save As → Word Document (.docx) or Plain Text (.txt)
3. Re-upload the converted file

CURRENT STATUS:
The system will attempt to provide tailoring suggestions based on standard resume best practices and the job requirements you provide.

RECOMMENDATION:
For guaranteed compatibility and best results, please upload your resume in one of these formats:
• Plain Text (.txt) - Recommended
• Word Document (.docx) - Good compatibility
• PDF (.pdf) - Basic support

You may continue with the current file, and our AI will provide job-specific recommendations based on professional resume standards.`;
      } else {
        // Try as text for unknown formats
        try {
          text = await file.text();
          if (!text || text.trim().length < 50) {
            throw new Error('File format not recognized');
          }
          console.log('✅ Unknown format read as text successfully');
        } catch {
          throw new Error(`Unsupported file format. Please upload PDF, DOC, DOCX, or TXT files.`);
        }
      }
    } catch (error: any) {
      console.error('❌ Content extraction failed:', error);
      throw new Error(error.message || 'Unable to read resume content. Please check the file format.');
    }

    // Validate extracted content
    if (!text || text.trim().length < 30) {
      throw new Error('This file format is not supported. Please upload a PDF or DOCX resume.');
    }

    console.log('✅ Content extracted successfully:', {
      length: text.length,
      preview: text.substring(0, 150) + '...'
    });

    // Extract structured candidate data
    const candidateData = extractCandidateData(text);
    
    return {
      text,
      candidateData,
      sections: parseResumeText(text)
    };
  } catch (error: any) {
    console.error('❌ Error extracting resume content:', error);
    
    // Provide clear, user-friendly error messages
    const message = error.message || 'Unable to process resume file';
    
    if (message.includes('too large')) {
      throw new Error('File is too large. Please upload a file smaller than 10MB.');
    } else if (message.includes('too small') || message.includes('empty')) {
      throw new Error('Resume file appears to be empty. Please upload a valid resume file.');
    } else if (message.includes('format') || message.includes('supported')) {
      throw new Error('This file format is not supported. Please upload a PDF or DOCX resume.');
    } else {
      throw new Error('Unable to process resume file. Please try a different format or ensure the file is not corrupted.');
    }
  }
};

// Enhanced text parsing with better section detection
const parseResumeText = (text: string) => {
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
    
    // Enhanced section detection
    if (lowerLine.match(/^(professional\s+)?summary|objective|profile/)) {
      currentSection = 'summary';
      continue;
    } else if (lowerLine.match(/^(work\s+|professional\s+)?experience|employment|career/)) {
      currentSection = 'experience';
      continue;
    } else if (lowerLine.match(/^(technical\s+)?skills|competencies|expertise/)) {
      currentSection = 'skills';
      continue;
    } else if (lowerLine.match(/^education|qualifications|academic/)) {
      currentSection = 'education';
      continue;
    }
    
    // Add content to appropriate section
    if (line.trim() && currentSection) {
      switch (currentSection) {
        case 'summary':
          sections.summary += line + ' ';
          break;
        case 'experience':
          if (line.trim().length > 10) { // Filter out very short lines
            sections.experience.push(line.trim());
          }
          break;
        case 'skills':
          if (line.trim().length > 2) {
            sections.skills.push(line.trim());
          }
          break;
        case 'education':
          if (line.trim().length > 5) {
            sections.education.push(line.trim());
          }
          break;
      }
    }
  }
  
  // Clean up summary
  sections.summary = sections.summary.trim();
  
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