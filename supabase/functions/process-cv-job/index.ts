import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { createWorker } from "https://esm.sh/tesseract.js@5";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface CVJob {
  id: string;
  job_id: string;
  file_path: string;
  file_name: string;
  job_title?: string;
  company_name?: string;
  job_description?: string;
}

// Text extraction with OCR fallback
async function extractTextWithOCR(fileBuffer: Uint8Array, fileName: string): Promise<string> {
  console.log(`Extracting text from ${fileName}`);
  
  try {
    const fileType = fileName.toLowerCase();
    
    // For PDF files
    if (fileType.endsWith('.pdf')) {
      // Try basic text extraction first
      const textDecoder = new TextDecoder();
      const text = textDecoder.decode(fileBuffer);
      
      // Check if there's readable text
      if (text.length > 100) {
        console.log('PDF has readable text, extracting...');
        return text;
      }
      
      // If minimal text, use OCR
      console.log('PDF has minimal text, using OCR...');
      const worker = await createWorker('eng');
      const { data: { text: ocrText } } = await worker.recognize(fileBuffer);
      await worker.terminate();
      return ocrText;
    }
    
    // For text-based files
    const textDecoder = new TextDecoder();
    return textDecoder.decode(fileBuffer);
  } catch (error) {
    console.error('Text extraction error:', error);
    throw new Error('Failed to extract text from file');
  }
}

// AI Tailoring using Lovable AI
async function tailorResume(resumeText: string, jobTitle?: string, companyName?: string, jobDescription?: string): Promise<string> {
  const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
  if (!LOVABLE_API_KEY) {
    throw new Error("LOVABLE_API_KEY not configured");
  }

  const systemPrompt = `You are an expert resume tailoring assistant. Your task is to optimize resumes for ATS (Applicant Tracking Systems) compliance and job matching.

Create a professional, well-structured resume with these sections:
1. Career Profile (3-4 sentence professional summary)
2. Key Skills (bullet points)
3. Professional Experience (with achievements)
4. Education
5. Certifications (if any)

Focus on:
- ATS keyword optimization
- Clear, measurable achievements
- Professional formatting
- Industry-standard language`;

  const userPrompt = `Tailor this resume${jobTitle ? ` for the ${jobTitle} position` : ''}${companyName ? ` at ${companyName}` : ''}.

Original Resume:
${resumeText}

${jobDescription ? `\nJob Description:\n${jobDescription}` : ''}

Provide a complete, tailored resume with all sections properly formatted.`;

  try {
    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
        temperature: 0.7,
        max_tokens: 2000
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI API error:", response.status, errorText);
      throw new Error(`AI API error: ${response.status}`);
    }

    const data = await response.json();
    return data.choices[0]?.message?.content || "";
  } catch (error) {
    console.error("AI tailoring error:", error);
    throw error;
  }
}

// Process a single job
async function processJob(job: CVJob, supabase: any) {
  console.log(`Processing job ${job.job_id}`);
  
  try {
    // Update status to processing
    await supabase
      .from('cv_jobs')
      .update({ 
        status: 'processing',
        progress: 10,
        processing_started_at: new Date().toISOString()
      })
      .eq('id', job.id);

    // Download file from storage
    const { data: fileData, error: downloadError } = await supabase.storage
      .from('resumes')
      .download(job.file_path);

    if (downloadError) throw downloadError;

    // Update progress
    await supabase
      .from('cv_jobs')
      .update({ progress: 30 })
      .eq('id', job.id);

    // Extract text
    const fileBuffer = await fileData.arrayBuffer();
    const extractedText = await extractTextWithOCR(new Uint8Array(fileBuffer), job.file_name);

    if (!extractedText || extractedText.trim().length < 100) {
      throw new Error('Could not extract readable text from resume');
    }

    // Update progress
    await supabase
      .from('cv_jobs')
      .update({ 
        progress: 50,
        extracted_text: extractedText 
      })
      .eq('id', job.id);

    // Tailor resume
    const tailoredContent = await tailorResume(
      extractedText,
      job.job_title,
      job.company_name,
      job.job_description
    );

    // Update progress
    await supabase
      .from('cv_jobs')
      .update({ progress: 80 })
      .eq('id', job.id);

    // Save tailored content and mark as complete
    await supabase
      .from('cv_jobs')
      .update({
        status: 'completed',
        progress: 100,
        tailored_content: tailoredContent,
        processing_completed_at: new Date().toISOString(),
        error_message: null
      })
      .eq('id', job.id);

    console.log(`Job ${job.job_id} completed successfully`);
    return { success: true };

  } catch (error: any) {
    console.error(`Job ${job.job_id} failed:`, error);
    
    // Update job with error
    const { data: currentJob } = await supabase
      .from('cv_jobs')
      .select('retry_count, max_retries')
      .eq('id', job.id)
      .single();

    const shouldRetry = currentJob && currentJob.retry_count < currentJob.max_retries;

    await supabase
      .from('cv_jobs')
      .update({
        status: shouldRetry ? 'queued' : 'failed',
        error_message: error.message,
        retry_count: (currentJob?.retry_count || 0) + 1,
        processing_completed_at: new Date().toISOString()
      })
      .eq('id', job.id);

    return { success: false, error: error.message };
  }
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { action, job_id } = await req.json();

    if (action === "process_next") {
      // Get next queued job
      const { data: jobs, error } = await supabase
        .from('cv_jobs')
        .select('*')
        .eq('status', 'queued')
        .order('created_at', { ascending: true })
        .limit(1);

      if (error) throw error;

      if (!jobs || jobs.length === 0) {
        return new Response(
          JSON.stringify({ message: "No jobs in queue" }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Process job in background
      EdgeRuntime.waitUntil(processJob(jobs[0], supabase));

      return new Response(
        JSON.stringify({ message: "Processing started", job_id: jobs[0].job_id }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (action === "process_specific" && job_id) {
      // Process specific job
      const { data: job, error } = await supabase
        .from('cv_jobs')
        .select('*')
        .eq('job_id', job_id)
        .single();

      if (error || !job) {
        throw new Error("Job not found");
      }

      // Process job in background
      EdgeRuntime.waitUntil(processJob(job, supabase));

      return new Response(
        JSON.stringify({ message: "Processing started", job_id: job.job_id }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ error: "Invalid action" }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error: any) {
    console.error("Edge function error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
