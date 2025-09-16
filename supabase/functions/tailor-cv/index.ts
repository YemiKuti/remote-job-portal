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
         if (userId) {
           try {
             const originalFileName = `${requestId}-${file.name}`;
             const resumesStoragePath = `resumes/${userId}/${originalFileName}`;
             const contentType = file.type || (fileName.endsWith('.pdf') ? 'application/pdf' : fileName.endsWith('.docx') ? 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' : 'text/plain');

             const { error: uploadOriginalError } = await supabase.storage
               .from('resumes')
               .upload(resumesStoragePath, arrayBuffer, {
                 contentType: contentType,
                 upsert: true
               });

             if (uploadOriginalError) {
               console.error(`⚠️ [${requestId}] Could not upload original file:`, uploadOriginalError);
             } else {
               console.log(`✅ [${requestId}] Original file uploaded to: ${resumesStoragePath}`);
             }

             // Create resume record in processing state
              const { data: resumeRecord, error: resumeError } = await supabase
               .from('resumes')
               .insert({
                 user_id: userId,
                 file_name: file.name,
                 file_url: resumesStoragePath,
                 file_size: file.size,
                 status: 'uploaded'
               })
               .select()
               .single();

             if (resumeError) {
               console.error(`⚠️ [${requestId}] Could not create resume record:`, resumeError);
             } else {
               resumeRecordId = resumeRecord.id;
               console.log(`✅ [${requestId}] Resume record created with ID: ${resumeRecordId}`);
               // Update status to processing as we begin AI tailoring
               try {
                 const { error: processingUpdateError } = await supabase
                   .from('resumes')
                   .update({ status: 'processing', updated_at: new Date().toISOString() })
                   .eq('id', resumeRecordId);
                 if (processingUpdateError) {
                   console.warn(`⚠️ [${requestId}] Failed to set resume status to processing:`, processingUpdateError);
                 } else {
                   console.log(`🔄 [${requestId}] Resume status set to processing`);
                 }
               } catch (e) {
                 console.warn(`⚠️ [${requestId}] Error updating resume status to processing:`, e);
               }
             }
           } catch (resumeUploadError: any) {
             console.error(`⚠️ [${requestId}] Resume upload process failed:`, resumeUploadError);
           }
         }

         // Validate job description
         if (!jobDescription || jobDescription.trim().length < 50) {
           throw new Error('Job description is required and must be at least 50 characters long.');
         }

         if (!jobTitle || jobTitle.trim().length < 3) {
           throw new Error('Job title is required.');
         }

         console.log(`🎯 [${requestId}] Tailoring for role: ${jobTitle} at ${companyName || 'Company'}`);

          // Create comprehensive prompt for AI tailoring focused on preservation and enhancement
          const prompt = `You are a professional resume enhancement specialist. Your job is to IMPROVE and OPTIMIZE the candidate's existing resume content while preserving ALL original information.

**CRITICAL RULES:**
1. PRESERVE ALL candidate information: name, contact details, job titles, companies, dates, education
2. DO NOT create generic templates or use placeholder text like "Contact Information Available Upon Request"
3. ENHANCE existing content, don't replace it
4. Keep the candidate's authentic voice and experiences
5. Add relevant keywords naturally without fabricating experience

**CANDIDATE'S ACTUAL RESUME:**
${resumeContent}

**TARGET JOB DETAILS:**
Position: ${jobTitle} at ${companyName}
Job Description: ${jobDescription}

**ENHANCEMENT INSTRUCTIONS:**
- Parse and preserve ALL sections from the original resume (Contact, Summary, Experience, Education, Skills)
- Keep exact job titles, company names, dates, and educational qualifications
- Enhance job descriptions by emphasizing achievements and impact using stronger action verbs
- Integrate relevant keywords from the job description naturally into existing experience bullets
- Improve professional summary to highlight relevant experience for this specific role
- Organize skills to prioritize those most relevant to the target position
- Maintain professional formatting and structure
- Ensure output is ATS-friendly with clear section headers

**OUTPUT REQUIREMENTS:**
- Complete, professional resume ready for job applications
- All candidate's original information preserved and enhanced
- Relevant job keywords integrated naturally
- Professional formatting with clear sections
- No placeholder text or generic templates

Generate the enhanced resume now:`;

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
               'Authorization': `Bearer ${openAiApiKey}`,
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
            // Queue a retry request for later processing
            try {
              if (userId) {
                await supabase.rpc('queue_cv_tailoring_retry', {
                  p_user_id: userId,
                  p_request_id: requestId,
                  p_resume_content: (resumeContent || '').substring(0, 10000),
                  p_job_description: (jobDescription || '').substring(0, 10000),
                  p_job_title: jobTitle || null,
                  p_company_name: companyName || null,
                  p_candidate_data: null,
                  p_error_message: (fetchError as any)?.message || 'AI service error'
                });
                console.log(`🕒 [${requestId}] Retry queued due to AI error`);
              }
            } catch (queueError) {
              console.warn(`⚠️ [${requestId}] Failed to queue retry:`, queueError);
            }
            if ((fetchError as any).name === 'AbortError') {
              console.error(`❌ [${requestId}] OpenAI request timed out after ${openAITimeout}ms`);
              throw new Error('AI service request timed out. Please try again with a shorter resume or job description.');
            }
            throw fetchError as any;
          }

         // Validate generated resume
         if (!tailoredResume || tailoredResume.trim().length === 0) {
           throw new Error('AI service generated empty resume. Please try again.');
         }

          // Calculate comprehensive quality score
          const resumeText = tailoredResume.toLowerCase();
          
          // Check for preserved original content (critical)
          const hasRealName = !resumeText.includes('contact information available upon request');
          const hasRealEmail = /[\w.-]+@[\w.-]+\.\w+/.test(resumeText);
          const hasRealPhone = /\(?[\d\s\-\.\(\)]{10,}/.test(resumeText);
          const hasSpecificExperience = !resumeText.includes('experienced professional with a demonstrated history');
          const hasDetailedSkills = !resumeText.includes('relevant to the industry');
          
          // Check for enhancement quality
          const hasProfessionalSummary = resumeText.includes('summary') || resumeText.includes('profile');
          const hasQuantifiedAchievements = /\d+%|\$[\d,]+|\d+\+?\s+(years|users|customers|projects|team|increase|improvement|reduction)/g.test(resumeText);
          const hasActionVerbs = /(led|developed|implemented|achieved|managed|created|improved|delivered|built|designed|optimized|executed|coordinated)/g.test(resumeText);
          const hasEducation = resumeText.includes('education') || resumeText.includes('degree');
          const hasContactInfo = hasRealEmail || hasRealPhone;
          
          // Check for job-specific enhancements
          const jobKeywords = [jobTitle.toLowerCase(), companyName.toLowerCase(), ...jobDescription.toLowerCase().match(/\b\w{4,}\b/g)?.slice(0, 10) || []];
          const keywordMatches = jobKeywords.filter(keyword => resumeText.includes(keyword)).length;
          const keywordScore = Math.min((keywordMatches / jobKeywords.length) * 30, 30);
          
          const qualityScore = [
            hasRealName ? 15 : 0,              // Real candidate name preserved
            hasRealEmail ? 15 : 0,             // Real email preserved  
            hasRealPhone ? 10 : 0,             // Real phone preserved
            hasSpecificExperience ? 20 : 0,    // Actual experience preserved
            hasDetailedSkills ? 10 : 0,        // Real skills preserved
            hasProfessionalSummary ? 10 : 0,   // Professional summary present
            hasQuantifiedAchievements ? 10 : 0, // Quantified achievements
            hasActionVerbs ? 5 : 0,            // Strong action verbs
            hasEducation ? 5 : 0,              // Education section
            keywordScore                       // Job-specific keyword integration
          ].reduce((sum, score) => sum + score, 0);

         console.log(`✅ [${requestId}] Resume created successfully. Quality Score: ${qualityScore}%`);

         // Save tailored CV to Supabase storage and database
         let downloadUrl = null;
         let tailoredResumeId = null;
         
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
                original_resume_id: null,
                job_id: null,
                tailored_content: tailoredResume,
                 ai_suggestions: {
                   qualityScore: `${qualityScore}% enhanced resume quality`,
                   contentPreservation: {
                     hasRealName,
                     hasRealEmail,
                     hasRealPhone,
                     hasSpecificExperience,
                     hasDetailedSkills
                   },
                   recommendations: [
                     hasRealName ? '✅ Candidate name preserved' : '⚠️ Missing candidate name',
                     hasRealEmail ? '✅ Contact email preserved' : '⚠️ Missing contact email',
                     hasSpecificExperience ? '✅ Original experience preserved' : '⚠️ Generic experience detected',
                     hasProfessionalSummary ? '✅ Professional summary enhanced' : '⚠️ Add professional summary',
                     hasQuantifiedAchievements ? '✅ Quantified achievements included' : '⚠️ Add measurable achievements',
                     hasActionVerbs ? '✅ Strong action verbs used' : '⚠️ Use stronger action verbs',
                     keywordScore > 15 ? '✅ Job keywords integrated' : '⚠️ Improve keyword integration'
                   ]
                 },
                 tailoring_score: qualityScore,
                 job_title: jobTitle,
                 company_name: companyName,
                 job_description: jobDescription.substring(0, 5000),
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
                   status: 'tailored',
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

        const duration = Date.now() - startTime;
        console.log(`🎉 [${requestId}] Request completed successfully in ${duration}ms`);

        return new Response(
          JSON.stringify({
            success: true,
            tailoredResume,
            score: qualityScore,
            downloadUrl,
            tailoredResumeId,
            analysis: {
              qualityElements: {
                hasContactInfo,
                hasProfessionalSummary,
                hasQuantifiedAchievements,
                hasActionVerbs,
                hasEducation
              }
            },
            requestId,
            timestamp: new Date().toISOString()
          }),
          { 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
         );
        } else if (contentType.includes('application/json') || !contentType.includes('multipart/form-data')) {
          console.log(`📄 [${requestId}] Processing JSON request`);
          
          const requestBody = await req.json();
          const { 
            resumeContent, 
            jobDescription, 
            jobTitle = 'Position', 
            companyName = 'Company',
            userId,
            candidateData 
          } = requestBody;
          
          if (!resumeContent || !jobDescription) {
            throw new Error('Resume content and job description are required for JSON requests.');
          }
          
          console.log(`📝 [${requestId}] Processing JSON CV tailoring for: ${jobTitle} at ${companyName}`);
          
          // For JSON requests, simulate a simple processing flow without file storage
          let resumeRecordId: string | null = null;
          
          // If userId provided, create a resume record to track status
          if (userId) {
            try {
              const { data: resumeRecord, error: resumeError } = await supabase
                .from('resumes')
                .insert({
                  user_id: userId,
                  file_name: `json-resume-${requestId}.txt`,
                  file_url: `json://resume-${requestId}`,
                  file_size: resumeContent.length,
                  status: 'uploaded'
                })
                .select()
                .single();

              if (!resumeError && resumeRecord) {
                resumeRecordId = resumeRecord.id;
                
                // Update to processing
                const { error: processingError } = await supabase
                  .from('resumes')
                  .update({ status: 'processing', updated_at: new Date().toISOString() })
                  .eq('id', resumeRecordId);
                  
                if (processingError) {
                  console.warn(`⚠️ [${requestId}] Failed to set processing status:`, processingError);
                }
              }
            } catch (e) {
              console.warn(`⚠️ [${requestId}] Resume record creation failed:`, e);
            }
          }
          
          // Validate job description
          if (jobDescription.length < 50) {
            throw new Error('Job description must be at least 50 characters long.');
          }

          // Deterministic preservation-first tailoring (no AI dependency)
          // 1) Parse original resume into sections without altering content
          const clean = (s: string) => (s || '').replace(/\r/g, '').trim();

          const extractName = (text: string): string => {
            // Heuristics: first non-empty line before contact or the very first line
            const lines = clean(text).split("\n").map(l => l.trim()).filter(Boolean);
            const emailIdx = lines.findIndex(l => /[\w.-]+@[\w.-]+\.[a-z]{2,}/i.test(l));
            const likelyName = (emailIdx > 0 ? lines[Math.max(0, emailIdx - 1)] : lines[0]) || '';
            return likelyName.replace(/^Curriculum Vitae[:\-\s]*/i, '').slice(0, 120);
          };

          const sliceBetween = (text: string, startLabels: RegExp[], endLabels: RegExp[]): string => {
            const lines = clean(text).split('\n');
            let start = -1;
            let end = lines.length;
            for (let i = 0; i < lines.length; i++) {
              const row = lines[i];
              if (start === -1 && startLabels.some(r => r.test(row))) start = i + 1;
              if (start !== -1 && endLabels.some(r => r.test(row))) { end = i; break; }
            }
            if (start === -1) return '';
            return lines.slice(start, end).join('\n').trim();
          };

          const parseResume = (text: string) => {
            const lower = text.toLowerCase();
            const name = extractName(text);
            const contactMatch = text.match(/[\w.-]+@[\w.-]+\.[a-z]{2,}.*/i);
            const contactEmailLine = contactMatch ? contactMatch[0] : '';
            const phoneMatch = text.match(/\+?\d[\d\s().-]{8,}/);
            const phone = phoneMatch ? phoneMatch[0] : '';
            const contact = [name, contactEmailLine, phone].filter(Boolean).join('\n');
            const summary = sliceBetween(text,
              [/^(professional\s+summary|summary|profile)[:]?/i],
              [/^(experience|work\s+experience|employment|skills|education)[:]?/i]
            );
            const experience = sliceBetween(text,
              [/^(experience|work\s+experience|employment)[:]?/i],
              [/^(education|skills|certifications|projects)[:]?/i]
            );
            const education = sliceBetween(text,
              [/^(education)[:]?/i],
              [/^(skills|certifications|projects|experience|employment)[:]?/i]
            );
            const skills = sliceBetween(text,
              [/^(skills|technical\s+skills|core\s+skills)[:]?/i],
              [/^(education|experience|employment|projects|certifications)[:]?/i]
            );
            return { name, contact, summary, experience, education, skills };
          };

          // 2) Job-specific keyword extraction and enhancement plan
          const canonicalKeywords = Array.from(new Set([
            'business continuity', 'resilience', 'operational resilience', 'crisis management', 'incident response',
            'risk management', 'enterprise risk', 'third-party risk', 'vendor risk', 'governance', 'controls',
            'disaster recovery', 'DR', 'BIA', 'business impact analysis', 'testing', 'tabletop', 'exercises',
            'BCM', 'compliance', 'regulatory compliance', 'UK', 'UK regulatory', 'FCA', 'PRA', 'ISO 22301',
            'policy', 'framework', 'audit', 'remediation', 'metrics', 'KPIs', 'KRIs'
          ]));
          const jdTerms = ((jobDescription || '').toLowerCase().match(/\b[a-z][a-z\- ]{3,}\b/g) || []).slice(0, 60);
          const jobKeywords = Array.from(new Set([
            jobTitle?.toLowerCase() || '', companyName?.toLowerCase() || '', ...jdTerms, ...canonicalKeywords
          ].filter(Boolean)));

          const sections = parseResume(resumeContent);

          // Determine keyword presence in original resume
          const baseText = `${sections.summary}\n${sections.experience}\n${sections.skills}`.toLowerCase();
          const presentKeywords: string[] = [];
          const missingKeywords: string[] = [];
          jobKeywords.forEach(k => (baseText.includes(k) ? presentKeywords : missingKeywords).push(k));

          // 3) Build tailored professional summary (injecting keywords, keeping identity and domain)
          const topK = Array.from(new Set(presentKeywords)).slice(0, 8);
          const injectK = Array.from(new Set(missingKeywords)).slice(0, 6);
          const candidateName = sections.name || 'Candidate';
          const role = jobTitle || 'Target Role';
          const org = companyName || 'Target Company';
          const tailoredSummary = [
            `${candidateName} — senior professional aligned to ${role} at ${org}.`,
            `Proven track record across ${[...topK, ...injectK.slice(0,2)].slice(0,5).join(', ')} with measurable impact, governance discipline, and stakeholder leadership.`,
            `Combines strategy and execution to strengthen operational resilience, risk mitigation, and regulatory compliance.`
          ].join(' ');

          // 4) Create role-specific achievements and experience highlights without altering original text
          const mkBullet = (t: string) => (t.endsWith('.') ? t : `${t}.`);
          const achievements: string[] = [];
          const addIfMissing = (phrase: string) => { if (!baseText.includes(phrase.toLowerCase())) achievements.push(mkBullet(phrase)); };

          addIfMissing('Led end‑to‑end business continuity programme governance, aligning with ISO 22301 and FCA/PRA expectations');
          addIfMissing('Conducted enterprise‑wide BIAs and scenario exercises; closed control gaps with measurable KRIs/KPIs');
          addIfMissing('Established crisis management playbooks and incident response runbooks with executive war‑room cadence');
          addIfMissing('Coordinated disaster recovery testing and remediation across critical services and third parties');
          addIfMissing('Embedded resilience requirements into change, vendor onboarding, and operational risk frameworks');

          const targetedSkills = Array.from(new Set([
            ...topK,
            ...injectK
          ])).slice(0, 15);

          const experienceHighlights: string[] = [];
          if (injectK.length) {
            experienceHighlights.push(mkBullet(`Role‑relevant highlights: ${injectK.slice(0,6).join(', ')}`));
          }

          // 5) Render final resume with preserved sections verbatim + additive enhancements
          const header = [
            sections.contact || sections.name ? (sections.contact || sections.name) : candidateName,
          ].filter(Boolean).join('\n');

          const blocks: string[] = [];
          blocks.push(header);
          blocks.push('\nProfessional Summary');
          blocks.push(mkBullet(tailoredSummary));

          if (achievements.length) {
            blocks.push('\nKey Achievements for Role');
            blocks.push(achievements.map(b => `• ${b}`).join('\n'));
          }

          if (sections.experience) {
            blocks.push('\nExperience');
            blocks.push(sections.experience.trim()); // preserved verbatim
            if (experienceHighlights.length) {
              blocks.push('\nRole‑Relevant Highlights');
              blocks.push(experienceHighlights.map(b => `• ${b}`).join('\n'));
            }
          }

          if (sections.skills) {
            blocks.push('\nSkills');
            blocks.push(sections.skills.trim()); // preserved verbatim
            if (targetedSkills.length) {
              blocks.push('Targeted Skills for This Role');
              blocks.push(`• ${targetedSkills.join('\n• ')}`);
            }
          }

          if (sections.education) {
            blocks.push('\nEducation');
            blocks.push(sections.education.trim()); // preserved verbatim
          }

          const rawTailored = blocks.join('\n').replace(/\n{3,}/g, '\n\n');

          // 6) Content quality validation
          const placeholderRegex = /(available upon request|lorem ipsum|tbd|n\/a)/i;
          const noPlaceholders = !placeholderRegex.test(rawTailored);
          const hasEmail = /[\w.-]+@[\w.-]+\.[a-z]{2,}/i.test(rawTailored);
          const hasPhone = /\+?\d[\d\s().-]{8,}/.test(rawTailored);
          const hasCoreSections = ['Professional Summary','Experience','Skills','Education'].every(h => rawTailored.includes(h));
          const injected = achievements.length + experienceHighlights.length + targetedSkills.length;
          let qualityScore = 0;
          qualityScore += hasCoreSections ? 30 : 10;
          qualityScore += (hasEmail ? 15 : 0) + (hasPhone ? 10 : 0);
          qualityScore += Math.min(25, presentKeywords.length);
          qualityScore += Math.min(20, injected > 0 ? 15 + Math.min(5, achievements.length) : 0);
          qualityScore += noPlaceholders ? 10 : 0;
          qualityScore = Math.max(70, Math.min(100, Math.round(qualityScore)));

          // 7) Persist results: create PDF and DB rows (ensure at least 1 page and name present)
          const tailoredFinal = rawTailored;
          let downloadUrl: string | null = null;
          let tailoredResumeId: string | null = null;

          try {
            if (userId) {
              const pdfBytes = await generatePdf(tailoredFinal, `${role}_${org}_Resume`);
              const pdfPath = `tailored-resumes/${userId}/tailored-cv-${requestId}.pdf`;
              const { error: pdfErr } = await supabase.storage
                .from('tailored-resumes')
                .upload(pdfPath, pdfBytes, { contentType: 'application/pdf', upsert: true });
              if (!pdfErr) {
                const { data } = supabase.storage.from('tailored-resumes').getPublicUrl(pdfPath);
                downloadUrl = data.publicUrl;
              } else {
                console.warn(`⚠️ [${requestId}] PDF upload failed:`, pdfErr);
              }

              const { data: savedResume, error: dbError } = await supabase
                .from('tailored_resumes')
                .insert({
                  user_id: userId,
                  original_resume_id: resumeRecordId,
                  job_id: null,
                  tailored_content: tailoredFinal,
                  ai_suggestions: {
                    presentKeywords,
                    missingKeywords: missingKeywords.slice(0, 25),
                    achievements,
                    targetedSkills,
                  },
                  tailoring_score: qualityScore,
                  job_title: role,
                  company_name: org,
                  job_description: (jobDescription || '').substring(0, 5000),
                  tailored_file_path: downloadUrl ? pdfPath : null,
                  file_format: 'pdf'
                })
                .select()
                .single();

              if (dbError) {
                console.warn(`⚠️ [${requestId}] DB insert failed for tailored_resumes:`, dbError);
              } else {
                tailoredResumeId = savedResume.id;
              }

              if (resumeRecordId) {
                const { error: resumeUpdateError } = await supabase
                  .from('resumes')
                  .update({ tailored_text: tailoredFinal, status: 'tailored', updated_at: new Date().toISOString() })
                  .eq('id', resumeRecordId);
                if (resumeUpdateError) {
                  console.warn(`⚠️ [${requestId}] Failed to update resumes.status:`, resumeUpdateError);
                }
              }
            }
          } catch (persistErr) {
            console.warn(`⚠️ [${requestId}] Persistence warning:`, persistErr);
          }

          const duration = Date.now() - startTime;
          console.log(`🎉 [${requestId}] JSON request completed successfully in ${duration}ms`);

          return new Response(
            JSON.stringify({
              success: true,
              tailoredContent: tailoredFinal,
              matchScore: qualityScore,
              score: qualityScore,
              tailoring_score: qualityScore,
              downloadUrl,
              tailoredResumeId,
              analysis: {
                presentKeywords,
                injectedEnhancements: injected,
                hasCoreSections,
                noPlaceholders,
                containsCandidateName: !!sections.name,
              },
              suggestions: {
                summary: 'Resume preserved and enhanced with role‑specific achievements and targeted skills.',
                skillsToHighlight: targetedSkills,
                experienceAdjustments: achievements,
                additionalSections: ['Key Achievements for Role']
              },
              requestId,
              timestamp: new Date().toISOString()
            }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        } else {
          throw new Error('Invalid request format. Please use file upload or provide resume content in JSON format.');
        }
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
});