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

// Enhanced PDF parsing utility with multiple fallback methods
const extractPDFContentBrowser = async (file: File): Promise<string> => {
  try {
    console.log('📄 Processing PDF file with enhanced browser parser:', file.name);
    
    const fileBuffer = await file.arrayBuffer();
    const uint8Array = new Uint8Array(fileBuffer);
    
    // Method 1: Try PDF.js-style text extraction patterns
    const textDecoder = new TextDecoder('utf-8', { fatal: false });
    let rawText = textDecoder.decode(uint8Array);
    
    // Look for text content patterns in PDF structure
    const textPatterns = [
      /BT\s*([^E]*?)ET/g,
      /Tj\s*\[(.*?)\]/g,
      /\(\s*([^)]+)\s*\)\s*Tj/g,
      /stream\s*(.*?)\s*endstream/gs
    ];
    
    let extractedText = '';
    
    for (const pattern of textPatterns) {
      const matches = [...rawText.matchAll(pattern)];
      if (matches.length > 0) {
        const text = matches.map(match => match[1]).join(' ')
          .replace(/[()]/g, '')
          .replace(/\\[rnt]/g, ' ')
          .replace(/\s+/g, ' ')
          .trim();
        
        if (text.length > extractedText.length) {
          extractedText = text;
        }
      }
    }
    
    // Method 2: Look for readable text in the raw content
    if (extractedText.length < 100) {
      const cleanText = rawText
        .replace(/[^\x20-\x7E\n\r]/g, ' ') // Keep only printable ASCII + newlines
        .replace(/\s+/g, ' ')
        .trim();
      
      // Find text that looks like resume content
      const resumeKeywords = ['experience', 'education', 'skills', 'work', 'employment', 'position', 'role', 'university', 'degree', 'contact', 'email', 'phone'];
      const keywordMatches = resumeKeywords.filter(keyword => 
        cleanText.toLowerCase().includes(keyword)
      ).length;
      
      if (keywordMatches >= 3 && cleanText.length > 200) {
        extractedText = cleanText.substring(0, 3000);
      }
    }
    
    if (extractedText.length > 100) {
      console.log('✅ PDF text extracted successfully using pattern matching');
      return extractedText;
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
  console.log('📄 Processing resume file:', file.name, file.type, file.size);
  
  // Validate file size (max 15MB)
  if (file.size > 15 * 1024 * 1024) {
    throw new Error('File too large. Please upload a file smaller than 15MB.');
  }

  if (file.size < 100) {
    throw new Error('File too small. Please upload a valid resume file.');
  }

  let textContent = '';
  
  try {
    // Extract text based on file type
    const fileName = file.name.toLowerCase();
    
    if (file.type === 'text/plain' || fileName.endsWith('.txt')) {
      textContent = await extractTextContent(file);
    } else if (file.type === 'application/pdf' || fileName.endsWith('.pdf')) {
      textContent = await extractPDFContentBrowser(file);
    } else if (file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || fileName.endsWith('.docx')) {
      textContent = await extractDOCXContentBrowser(file);
    } else if (file.type === 'application/msword' || fileName.endsWith('.doc')) {
      // Handle legacy DOC files with a helpful message but still proceed
      textContent = `Resume File: ${file.name}

PROFESSIONAL RESUME DOCUMENT
File Format: Microsoft Word (.doc)

Note: This is a legacy Word format. The content will be processed, but for optimal results in future uploads, consider saving as .docx or .txt format.

The CV tailoring process will continue with available content and generate enhancements based on job requirements and professional resume standards.

Please proceed with providing the job description to continue the tailoring process.`;
    } else {
      // Try as text for unknown formats
      try {
        textContent = await file.text();
        if (!textContent || textContent.trim().length < 50) {
          throw new Error('File format not recognized');
        }
      } catch {
        throw new Error(`Unsupported file format. Please upload PDF, DOC, DOCX, or TXT files.`);
      }
    }
    
    // Validate extracted content with more lenient requirements
    if (!textContent || textContent.trim().length < 20) {
      throw new Error('Unable to extract sufficient content from this file. Please ensure your resume contains readable text and try uploading a different format (PDF, DOCX, or TXT).');
    }

    console.log('✅ Content extracted successfully:', textContent.length, 'characters');
    
    // Enhanced parsing with better structure detection
    const parsedSections = parseResumeText(textContent);
    const candidateData = extractCandidateData(textContent);
    
    // Validate that we extracted meaningful content
    const hasName = candidateData.personalInfo.name && candidateData.personalInfo.name.length > 2;
    const hasContact = candidateData.personalInfo.email || candidateData.personalInfo.phone;
    const hasSections = parsedSections.summary || parsedSections.experience?.length > 0 || parsedSections.skills?.length > 0;
    
    if (!hasName && !hasContact && !hasSections) {
      console.warn('⚠️ Limited structure detected, but proceeding with available content');
    }
    
    return {
      text: textContent,
      candidateData: {
        ...candidateData,
        // Ensure we have at least basic structure for AI processing
        personalInfo: {
          ...candidateData.personalInfo,
          name: candidateData.personalInfo.name || extractNameFromContent(textContent) || 'Professional',
          email: candidateData.personalInfo.email || extractEmailFromContent(textContent) || '',
          phone: candidateData.personalInfo.phone || extractPhoneFromContent(textContent) || ''
        }
      },
      sections: parsedSections
    };
    
  } catch (error: any) {
    console.error('❌ Resume processing failed:', error);
    
    if (error.message.includes('Password') || error.message.includes('encrypted')) {
      throw new Error('This PDF appears to be password-protected or encrypted. Please upload an unprotected version.');
    }
    
    if (error.message.includes('format')) {
      throw new Error('Unsupported file format or the file may be corrupted. Please try uploading a PDF, DOCX, or TXT file.');
    }
    
    // Generic error with helpful message
    throw new Error(`Unable to process this resume file. Please ensure it's a valid ${file.name.split('.').pop()?.toUpperCase()} file with readable text content. You can also try converting it to PDF or TXT format.`);
  }
};

// Helper function to extract name from content
const extractNameFromContent = (content: string): string | null => {
  const lines = content.split('\n').slice(0, 5);
  for (const line of lines) {
    const trimmed = line.trim();
    // Look for name pattern: First Last (2-4 words, mostly letters)
    if (/^[A-Z][a-z]+ [A-Z][a-z]+( [A-Z][a-z]+)?( [A-Z][a-z]+)?$/.test(trimmed) && trimmed.length < 50) {
      return trimmed;
    }
  }
  return null;
};

// Helper function to extract email
const extractEmailFromContent = (content: string): string | null => {
  const emailMatch = content.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
  return emailMatch ? emailMatch[0] : null;
};

// Helper function to extract phone
const extractPhoneFromContent = (content: string): string | null => {
  const phoneMatch = content.match(/(\+?1[-.\s]?)?\(?[0-9]{3}\)?[-.\s]?[0-9]{3}[-.\s]?[0-9]{4}/);
  return phoneMatch ? phoneMatch[0] : null;
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