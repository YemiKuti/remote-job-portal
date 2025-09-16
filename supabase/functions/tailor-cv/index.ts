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
}

/**
 * Extract text from DOCX files
 */
async function extractDocxText(arrayBuffer: ArrayBuffer): Promise<string> {
  try {
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
  const enhanced = { ...cv };

  // Add tailored professional summary
  if (keywords.length > 0) {
    const keywordPhrase = keywords.slice(0, 3).join(', ');
    enhanced.summary = `Professional with proven expertise in ${keywordPhrase}, well-positioned for ${jobTitle} role at ${companyName}. ` + enhanced.summary;
  }

  // Enhance experience entries with keywords
  enhanced.experience = enhanced.experience.map(exp => {
    let enhancedExp = exp;
    keywords.forEach(keyword => {
      if (!enhancedExp.toLowerCase().includes(keyword.toLowerCase())) {
        // Try to inject keyword naturally
        if (enhancedExp.includes('management') && keyword.includes('risk')) {
          enhancedExp = enhancedExp.replace('management', `management including ${keyword}`);
        } else if (enhancedExp.includes('led') && keyword.includes('crisis')) {
          enhancedExp = enhancedExp.replace('led', `led ${keyword} and`);
        }
      }
    });
    return enhancedExp;
  });

  return enhanced;
}

/**
 * Format enhanced resume back to text
 */
function formatEnhancedResume(cv: any): string {
  let formatted = '';
  
  if (cv.contact) {
    formatted += cv.contact + '\n\n';
  }
  
  if (cv.summary) {
    formatted += 'PROFESSIONAL SUMMARY\n' + cv.summary + '\n\n';
  }
  
  if (cv.experience.length > 0) {
    formatted += 'EXPERIENCE\n';
    cv.experience.forEach(exp => {
      formatted += exp + '\n';
    });
    formatted += '\n';
  }
  
  if (cv.education.length > 0) {
    formatted += 'EDUCATION\n';
    cv.education.forEach(edu => {
      formatted += edu + '\n';
    });
    formatted += '\n';
  }
  
  if (cv.skills.length > 0) {
    formatted += 'SKILLS\n';
    cv.skills.forEach(skill => {
      formatted += skill + '\n';
    });
  }
  
  return formatted;
}

/**
 * Validate tailored content quality
 */
function validateTailoredContent(content: string, originalCV: any, keywords: string[]): any {
  const errors = [];
  let enhancementsApplied = 0;
  
  // Check for placeholders
  if (content.includes('Available upon request') || content.includes('[Contact') || content.includes('TBD')) {
    errors.push('Contains placeholder text');
  }
  
  // Check content length
  if (content.length < 200) {
    errors.push('Content too short');
  }
  
  // Check structure preservation
  const hasContact = content.toLowerCase().includes('email') || content.toLowerCase().includes('phone');
  const hasExperience = content.toLowerCase().includes('experience') || content.toLowerCase().includes('work');
  
  if (!hasContact) errors.push('Missing contact information');
  if (!hasExperience) errors.push('Missing experience section');
  
  // Check for keyword integration
  keywords.forEach(keyword => {
    if (content.toLowerCase().includes(keyword.toLowerCase())) {
      enhancementsApplied++;
    }
  });
  
  return {
    isValid: errors.length === 0,
    errors,
    enhancementsApplied,
    structurePreserved: hasContact && hasExperience
  };
}

/**
 * Calculate tailoring score based on enhancements
 */
function calculateTailoringScore(originalCV: any, enhancedCV: any, keywords: string[], content: string): number {
  let score = 0;
  
  // Base score for successful generation
  score += 25;
  
  // Score for keyword integration (30 points)
  const keywordsFound = keywords.filter(kw => content.toLowerCase().includes(kw.toLowerCase())).length;
  score += (keywordsFound / Math.max(keywords.length, 1)) * 30;
  
  // Score for structure preservation (25 points)
  if (enhancedCV.contact && enhancedCV.experience.length > 0) {
    score += 25;
  }
  
  // Score for content enhancement (20 points)
  if (enhancedCV.summary && enhancedCV.summary.length > originalCV.summary.length) {
    score += 20;
  }
  
  return Math.min(Math.round(score), 100);
}

/**
 * Generate enhanced PDF with validation
 */
async function generateEnhancedPdf(content: string, candidateName: string, jobTitle: string): Promise<Uint8Array> {
  try {
    console.log('🔄 Generating enhanced PDF');
    
    // Validate inputs
    if (!content || content.length < 100) {
      throw new Error('Content too short for PDF generation');
    }
    
    const title = `${candidateName || 'Professional'} - ${jobTitle}`;
    
    // Create a more robust PDF structure
    const lines = content.split('\n').filter(line => line.trim());
    let yPosition = 750;
    const lineHeight = 15;
    const pageHeight = 792;
    const margin = 72;
    
    // Estimate content that fits on page
    const maxLines = Math.floor((pageHeight - margin * 2) / lineHeight);
    const contentLines = lines.slice(0, maxLines);
    
    const pdfContent = `%PDF-1.4
1 0 obj
<< /Type /Catalog /Pages 2 0 R >>
endobj

2 0 obj
<< /Type /Pages /Kids [3 0 R] /Count 1 >>
endobj

3 0 obj
<< /Type /Page /Parent 2 0 R /Resources << /Font << /F1 4 0 R >> >> /MediaBox [0 0 612 792] /Contents 5 0 R >>
endobj

4 0 obj
<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>
endobj

5 0 obj
<< /Length ${content.length + 500} >>
stream
BT
/F1 12 Tf
72 720 Td
(${title}) Tj
0 -30 Td
${contentLines.map(line => `(${line.replace(/[()\\]/g, '\\$&').substring(0, 80)}) Tj 0 -${lineHeight} Td`).join('\n')}
ET
endstream
endobj

xref
0 6
0000000000 65535 f 
0000000010 00000 n 
0000000053 00000 n 
0000000125 00000 n 
0000000253 00000 n 
0000000332 00000 n 
trailer
<< /Size 6 /Root 1 0 R >>
startxref
${600 + content.length}
%%EOF`;

    return new TextEncoder().encode(pdfContent);
  } catch (error) {
    console.error('❌ Enhanced PDF generation error:', error);
    throw new Error(`PDF generation failed: ${error.message}`);
  }
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
        const tailoredFileName = `tailored_${Date.now()}_${originalFile.name.replace(/\.[^/.]+$/, '')}.pdf`;
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
      } else {
        throw new Error('Invalid request format. Please use file upload.');
      }
    };

    // Race between processing and timeout
    return await Promise.race([processRequest(), timeoutPromise]);

  } catch (error) {
    const duration = Date.now() - startTime;
    console.error(`❌ [${requestId}] Error after ${duration}ms:`, error);
    
    // Always return a 200 response with error details in the body
    return new Response(
      JSON.stringify({ 
        success: false,
        error: error.message || 'An unexpected error occurred while processing your CV.',
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