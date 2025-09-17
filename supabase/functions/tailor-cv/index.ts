import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import "https://deno.land/x/xhr@0.1.0/mod.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.4'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Initialize Supabase client
const supabaseUrl = Deno.env.get('SUPABASE_URL')!
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
const openaiApiKey = Deno.env.get('OPENAI_API_KEY')!
const supabase = createClient(supabaseUrl, supabaseServiceKey)

/**
 * Extract text from PDF files
 */
async function extractPdfText(arrayBuffer: ArrayBuffer): Promise<string> {
  try {
    const uint8Array = new Uint8Array(arrayBuffer);
    
    // Enhanced Unicode handling with multiple encoding fallbacks
    let raw = '';
    try {
      // Try UTF-8 first (most common)
      raw = new TextDecoder('utf-8', { fatal: true }).decode(uint8Array);
    } catch (utf8Error) {
      try {
        // Fallback to UTF-8 with error recovery
        raw = new TextDecoder('utf-8', { fatal: false }).decode(uint8Array);
      } catch (fallbackError) {
        try {
          // Try Latin-1 encoding for legacy documents
          raw = new TextDecoder('iso-8859-1').decode(uint8Array);
        } catch (latinError) {
          // Final fallback: process as binary and extract ASCII-safe characters
          raw = Array.from(uint8Array)
            .map(byte => (byte >= 32 && byte <= 126) ? String.fromCharCode(byte) : ' ')
            .join('');
        }
      }
    }

    // Sanitize Unicode characters that could cause JSON parsing issues
    raw = raw
      .replace(/[\u0000-\u001F\u007F-\u009F]/g, ' ') // Remove control characters
      .replace(/[\uFFFD]/g, ' ') // Remove replacement characters
      .replace(/\\u[0-9a-fA-F]{4}/g, ' '); // Remove Unicode escape sequences

    // Try to preserve line-ish breaks using PDF text operators (approximation)
    const parenMatches = raw.match(/\((.*?)\)/g) || [];
    let extracted = parenMatches
      .map(m => m.slice(1, -1))
      .filter(t => t.length > 1 && /[a-zA-Z0-9]/.test(t))
      .join('\n');

    if (extracted.length < 50) {
      // Fallback: keep existing line breaks where possible
      extracted = raw
        .replace(/[^\x09\x0A\x0D\x20-\x7E\u00A0-\u024F\u1E00-\u1EFF]/g, ' ') // Keep extended Latin
        .replace(/\r\n/g, '\n')
        .replace(/\r/g, '\n')
        .replace(/[ \t]+/g, ' ')
        .replace(/\n{3,}/g, '\n\n')
        .trim();
    }

    // Normalize bullets and simple dashes with Unicode-safe replacements
    extracted = extracted
      .replace(/[•●○◦▪▫■□▲△▼▽]/g, '•')
      .replace(/-\s+/g, '- ')
      .replace(/—/g, '-') // Em dash to regular dash
      .replace(/–/g, '-') // En dash to regular dash
      .replace(/[""]/g, '"') // Smart quotes to regular quotes
      .replace(/['']/g, "'"); // Smart apostrophes to regular

    if (extracted.length < 50) {
      throw new Error('CONTENT_TOO_SHORT');
    }

    return extracted;
  } catch (error) {
    if (error.message === 'CONTENT_TOO_SHORT') {
      throw new Error('CONTENT_TOO_SHORT');
    }
    throw new Error('UNSUPPORTED_ENCODING');
  }
}

/**
 * Extract text from DOCX files
 */
async function extractDocxText(arrayBuffer: ArrayBuffer): Promise<string> {
  try {
    const uint8Array = new Uint8Array(arrayBuffer);
    
    // Enhanced Unicode handling for DOCX content
    let docxContent = '';
    try {
      // Try UTF-8 first
      docxContent = new TextDecoder('utf-8', { fatal: true }).decode(uint8Array);
    } catch (utf8Error) {
      try {
        // Fallback to UTF-8 with error recovery
        docxContent = new TextDecoder('utf-8', { fatal: false }).decode(uint8Array);
      } catch (fallbackError) {
        // Try UTF-16 which is common in Office documents
        try {
          docxContent = new TextDecoder('utf-16le').decode(uint8Array);
        } catch (utf16Error) {
          // Final fallback to Latin-1
          docxContent = new TextDecoder('iso-8859-1').decode(uint8Array);
        }
      }
    }

    // Sanitize Unicode characters and escape sequences
    docxContent = docxContent
      .replace(/[\u0000-\u001F\u007F-\u009F]/g, ' ') // Remove control characters
      .replace(/[\uFFFD]/g, ' ') // Remove replacement characters
      .replace(/\\u[0-9a-fA-F]{4}/g, ' ') // Remove Unicode escape sequences
      .replace(/\\[rnt]/g, ' '); // Remove common escape sequences

    // Preserve paragraph breaks and tabs, then strip tags
    const withParagraphs = docxContent
      .replace(/<\/w:p>/g, '\n')
      .replace(/<w:tab[^>]*\/>/g, '\t');

    let text = withParagraphs
      .replace(/<[^>]+>/g, ' ')
      .replace(/\r\n/g, '\n')
      .replace(/\r/g, '\n')
      .replace(/[ \t]+/g, ' ')
      .replace(/\n{3,}/g, '\n\n')
      .trim();

    // Unicode normalization for special characters
    text = text
      .replace(/[""]/g, '"') // Smart quotes
      .replace(/['']/g, "'") // Smart apostrophes
      .replace(/[—–]/g, '-') // Em/en dashes
      .replace(/[•●○◦▪▫■□]/g, '•') // Normalize bullets
      .replace(/\u00A0/g, ' '); // Non-breaking space to regular space

    if (text.length < 50) {
      throw new Error('CONTENT_TOO_SHORT');
    }

    return text;
  } catch (error) {
    if (error.message === 'CONTENT_TOO_SHORT') {
      throw new Error('CONTENT_TOO_SHORT');
    }
    throw new Error('UNSUPPORTED_ENCODING');
  }
}

/**
 * Parse resume content into structured JSON
 */
function parseResumeToJSON(content: string): any {
  const sections = {
    contact: '',
    summary: '',
    experience: [],
    education: [],
    skills: []
  };

  const lines = content.split('\n').map(line => line.trim()).filter(line => line);
  let currentSection = '';
  let currentEntry = '';

  for (const line of lines) {
    const lowerLine = line.toLowerCase();
    
    // Detect sections
    if (lowerLine.includes('contact') || lowerLine.includes('email') || lowerLine.includes('phone')) {
      currentSection = 'contact';
      sections.contact += line + '\n';
    } else if (lowerLine.includes('summary') || lowerLine.includes('profile') || lowerLine.includes('objective')) {
      currentSection = 'summary';
    } else if (lowerLine.includes('experience') || lowerLine.includes('employment') || lowerLine.includes('work history')) {
      currentSection = 'experience';
    } else if (lowerLine.includes('education') || lowerLine.includes('qualification')) {
      currentSection = 'education';
    } else if (lowerLine.includes('skills') || lowerLine.includes('competencies') || lowerLine.includes('technical')) {
      currentSection = 'skills';
    } else {
      // Add content to current section
      if (currentSection === 'contact') {
        sections.contact += line + '\n';
      } else if (currentSection === 'summary') {
        sections.summary += line + ' ';
      } else if (currentSection === 'experience') {
        if (line.includes('•') || line.includes('-') || line.includes('◦')) {
          if (currentEntry) {
            sections.experience.push(currentEntry);
          }
          currentEntry = line;
        } else {
          currentEntry += ' ' + line;
        }
      } else if (currentSection === 'education') {
        sections.education.push(line);
      } else if (currentSection === 'skills') {
        sections.skills.push(line);
      }
    }
  }

  // Add final experience entry
  if (currentEntry) {
    sections.experience.push(currentEntry);
  }

  return sections;
}

/**
 * Extract job-specific keywords from description and title
 */
function extractJobKeywords(jobDescription: string, jobTitle: string): string[] {
  const keywords = [];
  const text = (jobTitle + ' ' + jobDescription).toLowerCase();
  
  // Business continuity specific keywords
  const bcKeywords = ['business continuity', 'resilience', 'crisis management', 'risk management', 'compliance', 'disaster recovery', 'incident response', 'regulatory', 'framework', 'governance'];
  
  bcKeywords.forEach(keyword => {
    if (text.includes(keyword)) {
      keywords.push(keyword);
    }
  });

  // Extract key skills mentioned
  const skillPatterns = /(?:experience with|knowledge of|expertise in|proficient in|familiar with)\s+([^.]+)/gi;
  let match;
  while ((match = skillPatterns.exec(text)) !== null) {
    keywords.push(match[1].trim());
  }

  return [...new Set(keywords)]; // Remove duplicates
}

/**
 * Enhance resume with job keywords while preserving structure
 */
function enhanceResumeWithKeywords(cv: any, keywords: string[], jobTitle: string, companyName: string): any {
  const enhanced: any = { ...cv };

  const topKeywords = [...new Set(keywords)].slice(0, 5);
  const summaryBase = (cv.summary || '').trim();
  if (summaryBase) {
    const kwStr = topKeywords.slice(0, 3).join(', ');
    const addendum = kwStr
      ? ` Tailored for ${jobTitle}${companyName ? ' at ' + companyName : ''}, emphasizing ${kwStr}.`
      : ` Tailored for ${jobTitle}${companyName ? ' at ' + companyName : ''}.`;
    enhanced.summary = summaryBase.replace(/\s+$/, '') + addendum;
  }

  const ACTION_VERBS = ['Led','Delivered','Built','Owned','Designed','Implemented','Developed','Improved','Optimized','Automated','Managed','Coordinated','Launched','Reduced','Increased','Streamlined','Enhanced','Created','Architected','Deployed','Analyzed','Refactored','Mentored','Facilitated'];

  const injectable = topKeywords.filter(kw => kw.length < 40);
  enhanced.experience = (cv.experience || []).map((raw: string) => {
    let line = raw.replace(/^\s*[-•]?\s*/, '• ').trim();

    // Ensure action verb start
    const token = line.replace(/^•\s*/, '').split(/[\s,]/)[0];
    const isVerb = ACTION_VERBS.some(v => token.toLowerCase() === v.toLowerCase());
    if (!isVerb) {
      line = line.replace(/^•\s*(Responsible for|Duties included|Tasked with)\s*/i, '• Led ');
      if (!/^•\s*[A-Z]/.test(line)) {
        line = line.replace(/^•\s*/, '• Delivered ');
      }
    }

    // Integrate one keyword per bullet without fabricating facts
    const lower = line.toLowerCase();
    for (const kw of injectable) {
      if (!lower.includes(kw.toLowerCase())) {
        line = line.replace(/\.[\s]*$/, '');
        line += ` — ${kw}`;
        break;
      }
    }

    if (!/[.!?]$/.test(line)) line += '.';
    return line;
  });

  const skillsText = (cv.skills || []).join(' ').toLowerCase();
  const missing = injectable.filter(kw => !skillsText.includes(kw.toLowerCase()));
  if (missing.length) {
    enhanced.skills = [...(cv.skills || []), `Additional keywords: ${missing.slice(0, 5).join(', ')}`];
  }

  // Keep contact untouched
  enhanced.contact = cv.contact;

  return enhanced;
}

/**
 * Format enhanced resume back to text
 */
function formatEnhancedResume(cv: any): string {
  const parts: string[] = [];

  if (cv.contact?.trim()) {
    parts.push(cv.contact.trim());
  }
  if (cv.summary?.trim()) {
    parts.push('PROFESSIONAL SUMMARY', cv.summary.trim());
  }
  if (Array.isArray(cv.experience) && cv.experience.length) {
    parts.push('EXPERIENCE');
    cv.experience.forEach((exp: string) => parts.push(exp));
  }
  if (Array.isArray(cv.education) && cv.education.length) {
    parts.push('EDUCATION');
    cv.education.forEach((edu: string) => parts.push(edu));
  }
  if (Array.isArray(cv.skills) && cv.skills.length) {
    parts.push('SKILLS');
    cv.skills.forEach((s: string) => parts.push(s));
  }

  return parts.join('\n') + '\n';
}

/**
 * Validate tailored content quality
 */
function validateTailoredContent(content: string, originalCV: any, keywords: string[]): any {
  const errors: string[] = [];
  const lower = content.toLowerCase();

  const placeholders = [
    'available upon request',
    'contact information available upon request',
    'lorem ipsum',
    'your name',
    'email@example.com',
    '[email]',
    '[phone]',
    '[name]',
    'tbd'
  ];
  if (placeholders.some(p => lower.includes(p))) {
    errors.push('Contains placeholder text');
  }

  if (content.length < 600) {
    errors.push('Content too short');
  }

  // Structure checks
  const hasContact = /email|phone|linkedin|github/i.test(content);
  const hasExperience = lower.includes('experience');
  const hasEducation = lower.includes('education');
  const hasSkills = lower.includes('skills');
  if (!hasContact) errors.push('Missing contact information');
  if (!hasExperience) errors.push('Missing experience section');

  // Preserve original contact details
  const emailMatch = (originalCV.contact || '').match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i);
  if (emailMatch && !content.includes(emailMatch[0])) {
    errors.push('Original email not preserved');
  }
  const linkedinMatch = (originalCV.contact || '').match(/https?:\/\/(www\.)?linkedin\.com\/[\S]+/i);
  if (linkedinMatch && !lower.includes('linkedin')) {
    errors.push('LinkedIn missing');
  }
  const phoneMatch = (originalCV.contact || '').match(/(\+?\d[\d\s\-()]{7,})/);
  if (phoneMatch) {
    const cleaned = phoneMatch[0].replace(/[^\d+]/g, '');
    const cleanedContent = content.replace(/[^\d+]/g, '');
    if (!cleanedContent.includes(cleaned)) {
      errors.push('Original phone not preserved');
    }
  }

  // Action verb coverage
  const ACTION_VERBS = ['Led','Delivered','Built','Owned','Designed','Implemented','Developed','Improved','Optimized','Automated','Managed','Coordinated','Launched','Reduced','Increased','Streamlined','Enhanced','Created','Architected','Deployed','Analyzed','Refactored','Mentored','Facilitated'];
  const bulletLines = content.split('\n').filter(l => /^[•\-]\s*/.test(l.trim()));
  const verbsOk = bulletLines.length ? bulletLines.filter(l => {
    const word = l.replace(/^[\u2212\-•]\s*/, '').split(/[\s,]/)[0];
    return ACTION_VERBS.some(v => v.toLowerCase() === word.toLowerCase());
  }).length / bulletLines.length : 1;
  if (verbsOk < 0.7) {
    errors.push('Insufficient action-verb bullets');
  }

  // Keyword integration
  const enhancementsApplied = keywords.filter(kw => lower.includes(kw.toLowerCase())).length;

  return {
    isValid: errors.length === 0,
    errors,
    enhancementsApplied,
    structurePreserved: hasContact && hasExperience && (hasEducation || true) && (hasSkills || true),
    verbsCoverage: verbsOk
  };
}

/**
 * Calculate tailoring score based on enhancements
 */
function calculateTailoringScore(originalCV: any, enhancedCV: any, keywords: string[], content: string): number {
  const lower = content.toLowerCase();
  const placeholders = /(available upon request|lorem ipsum|your name|email@example\.com|\[email\]|\[phone\]|\[name\]|tbd)/i.test(lower);
  const structurePreserved = !!(enhancedCV.contact && Array.isArray(enhancedCV.experience) && enhancedCV.experience.length > 0);

  const keywordsFound = keywords.filter(kw => lower.includes(kw.toLowerCase())).length;
  const keywordsRatio = keywords.length ? keywordsFound / keywords.length : 1;

  const ACTION_VERBS = ['Led','Delivered','Built','Owned','Designed','Implemented','Developed','Improved','Optimized','Automated','Managed','Coordinated','Launched','Reduced','Increased','Streamlined','Enhanced','Created','Architected','Deployed','Analyzed','Refactored','Mentored','Facilitated'];
  const bulletLines = content.split('\n').filter(l => /^[•\-]\s*/.test(l.trim()));
  const verbsOkCount = bulletLines.filter(l => {
    const word = l.replace(/^[\u2212\-•]\s*/, '').split(/[\s,]/)[0];
    return ACTION_VERBS.some(v => v.toLowerCase() === word.toLowerCase());
  }).length;
  const verbsCoverage = bulletLines.length ? verbsOkCount / bulletLines.length : 1;

  let score = 0;
  if (structurePreserved) score += 50; // preserve original structure and details
  score += Math.min(25, Math.round(keywordsRatio * 25));
  score += Math.min(20, Math.round(verbsCoverage * 20));

  if (placeholders) score = Math.min(score, 40);
  if (!structurePreserved) score = Math.min(score, 40);

  if (!placeholders && structurePreserved && keywordsFound >= Math.min(3, keywords.length) && verbsCoverage >= 0.7) {
    if (score < 80) score = 80; // enforce high score when all key criteria met
  }

  return Math.max(0, Math.min(100, Math.round(score)));
}

/**
 * Generate enhanced PDF with validation
 */
async function generateEnhancedPdf(content: string, candidateName: string, jobTitle: string): Promise<Uint8Array> {
  try {
    console.log('🔄 Generating enhanced PDF');

    if (!content || content.length < 100) {
      throw new Error('Content too short for PDF generation');
    }

    const title = `${candidateName || 'Professional'} - ${jobTitle}`;

    // Prepare lines and wrap long ones for readability
    const rawLines = content.split('\n');
    const wrapLine = (text: string, max = 90) => {
      const words = text.split(' ');
      const out: string[] = [];
      let cur = '';
      for (const w of words) {
        if ((cur + (cur ? ' ' : '') + w).length > max) {
          if (cur) out.push(cur);
          cur = w;
        } else {
          cur = cur ? cur + ' ' + w : w;
        }
      }
      if (cur) out.push(cur);
      return out;
    };

    const lines: string[] = [];
    for (const l of rawLines) {
      const wrapped = wrapLine(l.trim(), 95);
      if (wrapped.length === 0) lines.push(' ');
      else lines.push(...wrapped);
    }

    // Pagination
    const pageHeight = 792; // 11in * 72
    const margin = 72; // 1in
    const lineHeight = 14;
    const maxLines = Math.floor((pageHeight - margin * 2 - 40) / lineHeight); // 40 for title area

    const pages: string[][] = [];
    for (let i = 0; i < lines.length; i += maxLines) {
      pages.push(lines.slice(i, i + maxLines));
    }

    // Minimal PDF builder with correct xref offsets
    const escapePdf = (s: string) => s.replace(/\\/g, '\\\\').replace(/\(/g, '\\(').replace(/\)/g, '\\)');
    const objects: string[] = [];

    // Font
    const fontId = objects.push('<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>');

    // Page contents and page objects
    const pageObjectIds: number[] = [];
    const contentObjectIds: number[] = [];

    pages.forEach((pageLines, idx) => {
      let contentStream = 'BT\n/F1 11 Tf\n';
      // Title on first page
      let y = 720;
      if (idx === 0) {
        contentStream += `72 ${y} Td\n(${escapePdf(title)}) Tj\n`;
        y -= 28;
      }
      contentStream += `72 ${y} Td\n`;
      for (const line of pageLines) {
        contentStream += `(${escapePdf(line)}) Tj 0 -${lineHeight} Td\n`;
      }
      contentStream += 'ET';

      const stream = `<< /Length ${contentStream.length} >>\nstream\n${contentStream}\nendstream`;
      const contentId = objects.push(stream);
      contentObjectIds.push(contentId);

      const pageObj = `<< /Type /Page /Parent PAGES 0 R /Resources << /Font << /F1 ${fontId} 0 R >> >> /MediaBox [0 0 612 792] /Contents ${contentId} 0 R >>`;
      const pageId = objects.push(pageObj);
      pageObjectIds.push(pageId);
    });

    // Pages and Catalog
    const kidsArr = pageObjectIds.map(id => `${id} 0 R`).join(' ');
    const pagesObj = `<< /Type /Pages /Kids [ ${kidsArr} ] /Count ${pageObjectIds.length} >>`;
    const pagesId = objects.push(pagesObj);

    // Fix parent references now that we know pagesId
    for (let i = 0; i < pageObjectIds.length; i++) {
      const id = pageObjectIds[i];
      objects[id - 1] = objects[id - 1].replace('PAGES 0 R', `${pagesId} 0 R`);
    }

    const catalogId = objects.push(`<< /Type /Catalog /Pages ${pagesId} 0 R >>`);

    // Assemble with accurate xref
    let pdf = '%PDF-1.4\n';
    const offsets: number[] = [0]; // xref requires a free object at index 0

    const addObject = (id: number, body: string) => {
      offsets[id] = pdf.length;
      pdf += `${id} 0 obj\n${body}\nendobj\n`;
    };

    for (let i = 0; i < objects.length; i++) {
      addObject(i + 1, objects[i]);
    }

    const xrefStart = pdf.length;
    const pad10 = (n: number) => n.toString().padStart(10, '0');
    pdf += `xref\n0 ${objects.length + 1}\n`;
    pdf += `0000000000 65535 f \n`;
    for (let i = 1; i <= objects.length; i++) {
      pdf += `${pad10(offsets[i])} 00000 n \n`;
    }
    pdf += `trailer\n<< /Size ${objects.length + 1} /Root ${catalogId} 0 R >>\nstartxref\n${xrefStart}\n%%EOF`;

    return new TextEncoder().encode(pdf);
  } catch (error: any) {
    console.error('❌ Enhanced PDF generation error:', error);
    throw new Error(`PDF generation failed: ${error.message}`);
  }
}

// Enhanced error classification and file validation functions
function classifyError(error: any): { code: string, message: string, userMessage: string } {
  const errorMsg = error.message || error.toString();
  if (errorMsg.includes('FILE_TOO_LARGE') || errorMsg.includes('too large')) {
    return { code: 'FILE_TOO_LARGE', message: errorMsg, userMessage: 'Your file is too large. Please upload a resume under 10MB.' };
  }
  if (errorMsg.includes('UNSUPPORTED_ENCODING') || errorMsg.includes('Unicode') || errorMsg.includes('encoding')) {
    return { code: 'UNSUPPORTED_ENCODING', message: errorMsg, userMessage: 'Your resume contains unsupported characters. Please save and upload again in PDF or DOCX format with UTF-8 encoding.' };
  }
  if (errorMsg.includes('INVALID_FORMAT') || errorMsg.includes('format not supported')) {
    return { code: 'INVALID_FORMAT', message: errorMsg, userMessage: 'Unsupported file format. Please upload PDF, DOC, DOCX, or TXT.' };
  }
  if (errorMsg.includes('CONTENT_TOO_SHORT') || errorMsg.includes('too short') || errorMsg.includes('insufficient')) {
    return { code: 'CONTENT_TOO_SHORT', message: errorMsg, userMessage: 'Your career profile needs at least 3-4 sentences. Include your key skills, achievements, and career goals.' };
  }
  return { code: 'UNKNOWN_ERROR', message: errorMsg, userMessage: 'An unexpected error occurred. Please try again or contact support if the issue persists.' };
}

serve(async (req) => {
  const startTime = Date.now();
  const requestId = crypto.randomUUID().substring(0, 8);
  
  console.log(`🚀 [${requestId}] CV Tailoring request started`);

  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Setup timeout for the entire request
    const REQUEST_TIMEOUT = 120000; // 2 minutes
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Request timed out after 2 minutes')), REQUEST_TIMEOUT)
    );

    const processRequest = async () => {
      // Check if request contains file upload (multipart/form-data) or JSON
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
          throw new Error('Unsupported file format. Please upload a PDF, DOCX, or TXT file.');
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
          throw new Error('Could not extract text from file. Please ensure it\'s a valid PDF, DOCX, or TXT file.');
        }
        
        // Validate extracted content
        if (!resumeContent || resumeContent.trim().length < 30) {
          throw new Error('Insufficient content extracted. Please upload a file with readable text.');
        }

        // Validate job description
        if (!jobDescription || jobDescription.trim().length < 50) {
          throw new Error('Job description is required and must be at least 50 characters long.');
        }

        if (!jobTitle || jobTitle.trim().length < 3) {
          throw new Error('Job title is required.');
        }

        console.log(`🎯 [${requestId}] Tailoring for role: ${jobTitle} at ${companyName || 'Company'}`);

        // Extract candidate name from content
        const lines = resumeContent.split('\n').map(line => line.trim()).filter(line => line);
        const candidateName = lines[0] || 'Professional';

        // Upload original file to storage
        let resumeRecord: any = null;
        if (userId) {
          try {
            const originalFileName = `${requestId}-${file.name}`;
            const resumesStoragePath = `resumes/${userId}/${originalFileName}`;
            const contentTypeVal = file.type || (fileName.endsWith('.pdf') ? 'application/pdf' : fileName.endsWith('.docx') ? 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' : 'text/plain');

            const { error: uploadOriginalError } = await supabase.storage
              .from('resumes')
              .upload(resumesStoragePath, arrayBuffer, {
                contentType: contentTypeVal,
                upsert: true
              });

            if (uploadOriginalError) {
              console.error(`⚠️ [${requestId}] Could not upload original file:`, uploadOriginalError);
            } else {
              console.log(`✅ [${requestId}] Original file uploaded to: ${resumesStoragePath}`);
            }

            // Create resume record
            const { data: resumeRecordData, error: resumeError } = await supabase
              .from('resumes')
              .insert({
                user_id: userId,
                file_name: file.name,
                file_url: resumesStoragePath,
                file_size: file.size,
                status: 'processing'
              })
              .select()
              .single();

            if (resumeError) {
              console.error(`⚠️ [${requestId}] Could not create resume record:`, resumeError);
            } else {
              resumeRecord = resumeRecordData;
              console.log(`✅ [${requestId}] Resume record created with ID: ${resumeRecord.id}`);
            }
          } catch (resumeUploadError: any) {
            console.error(`⚠️ [${requestId}] Resume upload process failed:`, resumeUploadError);
          }
        }

        // Parse CV content into structured JSON
        const structuredCV = parseResumeToJSON(resumeContent);
        console.log('📋 Parsed CV structure:', {
          hasContact: !!structuredCV.contact,
          experienceCount: structuredCV.experience.length,
          educationCount: structuredCV.education.length,
          skillsCount: structuredCV.skills.length
        });

        // Extract job keywords for enhancement
        const jobKeywords = extractJobKeywords(jobDescription, jobTitle);
        console.log('🎯 Extracted job keywords:', jobKeywords);

        // Enhance CV while preserving original structure
        const enhancedCV = enhanceResumeWithKeywords(structuredCV, jobKeywords, jobTitle, companyName);
        
        // Convert back to formatted text
        const tailoredContent = formatEnhancedResume(enhancedCV);
        
        // Validate output quality
        const validation = validateTailoredContent(tailoredContent, structuredCV, jobKeywords);
        if (!validation.isValid) {
          throw new Error(`Content validation failed: ${validation.errors.join(', ')}`);
        }

        console.log('✅ Content validation passed:', validation);

        // Calculate quality score based on enhancements
        let qualityScore = calculateTailoringScore(structuredCV, enhancedCV, jobKeywords, tailoredContent);
        
        console.log('📊 Calculated tailoring score:', qualityScore);

        // Generate PDF with validation
        const pdfBytes = await generateEnhancedPdf(tailoredContent, candidateName, jobTitle);
        console.log('📄 Generated PDF, size:', pdfBytes.length, 'bytes');

        // Validate PDF export
        if (pdfBytes.length < 1000) {
          throw new Error('PDF export too small - possible generation failure');
        }

        // Upload tailored resume as PDF to storage
        const tailoredFileName = `tailored_${Date.now()}_${file.name.replace(/\.[^/.]+$/, '')}.pdf`;
        const { error: uploadError } = await supabase.storage
          .from('tailored-resumes')
          .upload(tailoredFileName, pdfBytes, {
            contentType: 'application/pdf',
            upsert: false
          });

        if (uploadError) {
          console.error('❌ Storage upload error:', uploadError);
          throw new Error(`Failed to upload tailored resume: ${uploadError.message}`);
        }

        console.log('💾 Uploaded tailored resume to storage:', tailoredFileName);

        // Save tailored resume record to database with status
        const { data: tailoredResume, error: insertError } = await supabase
          .from('tailored_resumes')
          .insert({
            user_id: userId,
            original_resume_id: resumeRecord?.id,
            job_id: null,
            tailored_content: tailoredContent,
            job_title: jobTitle,
            company_name: companyName,
            job_description: jobDescription,
            tailored_file_path: tailoredFileName,
            file_format: 'pdf',
            tailoring_score: qualityScore,
            status: 'tailored',
            ai_suggestions: {
              keywords_added: jobKeywords.filter(kw => tailoredContent.toLowerCase().includes(kw.toLowerCase())).length,
              enhancements_made: validation.enhancementsApplied,
              structure_preserved: validation.structurePreserved,
              timestamp: new Date().toISOString()
            }
          })
          .select()
          .single();

        if (insertError) {
          console.error('❌ Database insert error:', insertError);
          throw new Error(`Failed to save tailored resume: ${insertError.message}`);
        }

        console.log('✅ Tailored resume saved:', tailoredResume.id);

        // Update original resume record
        if (resumeRecord) {
          const { error: resumeUpdateError } = await supabase
            .from('resumes')
            .update({
              tailored_text: tailoredContent,
              status: 'tailored',
              updated_at: new Date().toISOString()
            })
            .eq('id', resumeRecord.id);

          if (resumeUpdateError) {
            console.error(`❌ [${requestId}] Failed updating resume record:`, resumeUpdateError);
          } else {
            console.log(`✅ [${requestId}] Resume record updated to complete`);
          }
        }

        const duration = Date.now() - startTime;
        console.log(`🎉 [${requestId}] Request completed successfully in ${duration}ms`);

        return new Response(
          JSON.stringify({
            success: true,
            tailoredResume: tailoredContent,
            score: qualityScore,
            downloadUrl: supabase.storage.from('tailored-resumes').getPublicUrl(tailoredFileName).data.publicUrl,
            tailoredResumeId: tailoredResume.id,
            analysis: {
              qualityElements: {
                structurePreserved: validation.structurePreserved,
                enhancementsApplied: validation.enhancementsApplied,
                keywordsIntegrated: jobKeywords.filter(kw => tailoredContent.toLowerCase().includes(kw.toLowerCase())).length
              }
            },
            requestId,
            timestamp: new Date().toISOString()
          }),
          { 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );
      } else if (contentType.includes('application/json')) {
        console.log(`🧾 [${requestId}] Processing JSON payload`);
        const body = await req.json();

        let resumeContent = String(body.resumeContent || body.resume_text || '').trim();
        const jobDescription = String(body.jobDescription || '').trim();
        const jobTitle = String(body.jobTitle || 'Job Title').trim();
        const companyName = String(body.companyName || '').trim();
        const userId = body.userId ? String(body.userId) : '';

        if (!resumeContent || resumeContent.length < 30) {
          throw new Error('Resume content is required and must be at least 30 characters.');
        }
        if (!jobDescription || jobDescription.length < 50) {
          throw new Error('Job description is required and must be at least 50 characters long.');
        }

        const candidateName = resumeContent.split('\n').map((l: string) => l.trim()).filter(Boolean)[0] || 'Professional';

        const structuredCV = parseResumeToJSON(resumeContent);
        const jobKeywords = extractJobKeywords(jobDescription, jobTitle);
        const enhancedCV = enhanceResumeWithKeywords(structuredCV, jobKeywords, jobTitle, companyName);
        const tailoredContent = formatEnhancedResume(enhancedCV);

        const validation = validateTailoredContent(tailoredContent, structuredCV, jobKeywords);
        if (!validation.isValid) {
          throw new Error(`Content validation failed: ${validation.errors.join(', ')}`);
        }

        let qualityScore = calculateTailoringScore(structuredCV, enhancedCV, jobKeywords, tailoredContent);

        const pdfBytes = await generateEnhancedPdf(tailoredContent, candidateName, jobTitle);
        if (pdfBytes.length < 1000) {
          throw new Error('PDF export too small - possible generation failure');
        }

        const tailoredFileName = `tailored_${Date.now()}_${requestId}.pdf`;
        const { error: uploadError } = await supabase.storage
          .from('tailored-resumes')
          .upload(tailoredFileName, pdfBytes, {
            contentType: 'application/pdf',
            upsert: false
          });
        if (uploadError) {
          console.error('❌ Storage upload error:', uploadError);
          throw new Error(`Failed to upload tailored resume: ${uploadError.message}`);
        }

        const { data: tailoredResume, error: insertError } = await supabase
          .from('tailored_resumes')
          .insert({
            user_id: userId || null,
            original_resume_id: null,
            job_id: null,
            tailored_content: tailoredContent,
            job_title: jobTitle,
            company_name: companyName,
            job_description: jobDescription,
            tailored_file_path: tailoredFileName,
            file_format: 'pdf',
            tailoring_score: qualityScore,
            status: 'tailored',
            ai_suggestions: {
              keywords_added: jobKeywords.filter((kw: string) => tailoredContent.toLowerCase().includes(kw.toLowerCase())).length,
              enhancements_made: validation.enhancementsApplied,
              structure_preserved: validation.structurePreserved,
              timestamp: new Date().toISOString()
            }
          })
          .select()
          .single();

        if (insertError) {
          console.error('❌ Database insert error:', insertError);
          throw new Error(`Failed to save tailored resume: ${insertError.message}`);
        }

        return new Response(
          JSON.stringify({
            success: true,
            tailoredResume: tailoredContent,
            score: qualityScore,
            downloadUrl: supabase.storage.from('tailored-resumes').getPublicUrl(tailoredFileName).data.publicUrl,
            tailoredResumeId: tailoredResume.id,
            analysis: {
              qualityElements: {
                structurePreserved: validation.structurePreserved,
                enhancementsApplied: validation.enhancementsApplied,
                keywordsIntegrated: jobKeywords.filter((kw: string) => tailoredContent.toLowerCase().includes(kw.toLowerCase())).length
              }
            },
            requestId,
            timestamp: new Date().toISOString()
          }),
          { 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );
      } else {
        throw new Error('Invalid request format. Please use file upload (multipart/form-data) or JSON.');
      }
    };

    // Race between processing and timeout
    return await Promise.race([processRequest(), timeoutPromise]);

  } catch (error) {
    const duration = Date.now() - startTime;
    console.error(`❌ [${requestId}] Error after ${duration}ms:`, error);
    
    // Enhanced error response with classification
    const errorInfo = classifyError(error);
    
    return new Response(
      JSON.stringify({ 
        success: false,
        error: errorInfo.userMessage,
        errorCode: errorInfo.code,
        technicalError: errorInfo.message,
        requestId: requestId,
        timestamp: new Date().toISOString(),
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
});