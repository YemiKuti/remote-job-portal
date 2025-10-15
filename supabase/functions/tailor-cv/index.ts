import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import "https://deno.land/x/xhr@0.1.0/mod.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.4'
import { PDFDocument, StandardFonts, rgb } from 'https://esm.sh/pdf-lib@1.17.1'

// CORS -----------------------------------------------------------------------
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Max-Age': '86400',
}

// Environment ----------------------------------------------------------------
const supabaseUrl = Deno.env.get('SUPABASE_URL')!
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
const openaiApiKey = Deno.env.get('OPENAI_API_KEY')!

const supabase = createClient(supabaseUrl, supabaseServiceKey)

// Storage + DB helpers --------------------------------------------------------
function cleanPath(p: string): string { return p.replace(/^\/+/, '').replace(/\/+$/, '') }

function stripQuery(u: string): string { try { const i = u.indexOf('?'); return i >= 0 ? u.substring(0, i) : u } catch { return u } }

function parseStoragePublicUrl(url: string): { bucket: string, objectPath: string } | null {
  try {
    const noQ = stripQuery(url)
    const m = noQ.match(/\/object(?:\/public)?\/(\w+)\/(.+)$/)
    if (m && m[1] && m[2]) return { bucket: m[1], objectPath: decodeURIComponent(m[2]) }
    const alt = noQ.match(/\/(resumes|documents)\/(.+)$/)
    if (alt && alt[1] && alt[2]) return { bucket: alt[1], objectPath: decodeURIComponent(alt[2]) }
    // relative object key (no leading slash)
    if (noQ.startsWith('resumes/')) return { bucket: 'resumes', objectPath: noQ.replace(/^resumes\//, '') }
    if (noQ.startsWith('documents/')) return { bucket: 'documents', objectPath: noQ.replace(/^documents\//, '') }
  } catch (_) {}
  return null
}

// Removed OpenAI PDF rendering (unavailable 'format' param). Using local renderer only.

// Local PDF renderer as reliable fallback (simple, styled, no content mutation)
async function generatePdfFromMarkdown(md: string, title: string): Promise<Uint8Array> {
  const doc = await PDFDocument.create()
  const font = await doc.embedFont(StandardFonts.Helvetica)
  const bold = await doc.embedFont(StandardFonts.HelveticaBold)
  const italic = await doc.embedFont(StandardFonts.HelveticaOblique)
  const [w, h] = [612, 792]
  const margin = 56
  let page = doc.addPage([w, h])
  let y = h - margin
  const lineGap = 5
  const lineAdvance = (size: number) => {
    y -= size + lineGap
    if (y < margin) { page = doc.addPage([w, h]); y = h - margin }
  }
  // Draw rich text with **bold** and *italic* support and wrapping
  const drawRich = (text: string, size = 11) => {
    const max = w - margin * 2
    let x = margin
    const tokens: { t: string, f: any }[] = []
    const re = /(\*\*[^*]+\*\*|\*[^*]+\*)/g
    let last = 0
    let m: RegExpExecArray | null
    while ((m = re.exec(text)) !== null) {
      if (m.index > last) tokens.push({ t: text.slice(last, m.index), f: font })
      const seg = m[0]
      if (seg.startsWith('**')) tokens.push({ t: seg.slice(2, -2), f: bold })
      else tokens.push({ t: seg.slice(1, -1), f: italic })
      last = m.index + seg.length
    }
    if (last < text.length) tokens.push({ t: text.slice(last), f: font })

    for (const seg of tokens) {
      const parts = seg.t.split(/(\s+)/)
      for (const part of parts) {
        const f = seg.f
        const partWidth = f.widthOfTextAtSize(part, size)
        if (part === '') continue
        if (part.match(/^\s+$/)) {
          // space: if at line start, skip drawing but keep width if next word fits
          if (x === margin) continue
          if (x - margin + partWidth > max) { lineAdvance(size); x = margin; continue }
          page.drawText(part, { x, y, size, font: f }); x += partWidth; continue
        }
        if (x - margin + partWidth > max) { lineAdvance(size); x = margin }
        page.drawText(part, { x, y, size, font: f }); x += partWidth
      }
    }
    lineAdvance(size)
  }
  const drawRule = () => {
    if (y < margin + 24) { page = doc.addPage([w, h]); y = h - margin }
    y -= 8
    page.drawLine({ start: { x: margin, y }, end: { x: w - margin, y }, thickness: 0.8, color: rgb(0.5,0.5,0.5) })
    y -= 14
  }
  // Identify name/contact block from top of markdown
  const rawLines = md.replace(/\r\n/g, '\n').split('\n')
  let i = 0
  while (i < rawLines.length && rawLines[i].trim() === '') i++
  const nameLine = (rawLines[i] || '').replace(/^\*\*|\*\*$/g, '').replace(/\*\*/g, '')
  const contacts: string[] = []
  let j = i + 1
  while (j < rawLines.length && rawLines[j].trim() && !rawLines[j].startsWith('##') && !rawLines[j].startsWith('###')) {
    contacts.push(rawLines[j].trim())
    j++
  }
  // Render name big
  if (nameLine) {
    page.drawText(nameLine, { x: margin, y, size: 22, font: bold, color: rgb(0.1,0.1,0.15) })
    y -= 24
  }
  // Subtitle: title (job/company)
  page.drawText(title, { x: margin, y, size: 12, font: bold, color: rgb(0.15,0.15,0.2) })
  y -= 14
  // Contact line
  if (contacts.length) {
    drawRich(contacts.join(' • '), 10)
  }
  drawRule()
  // Continue from the rest of the document
  const lines = rawLines.slice(j)
  const headingTitles = new Set(['PROFESSIONAL SUMMARY','SUMMARY','KEY SKILLS','SKILLS','PROFESSIONAL EXPERIENCE','EXPERIENCE','EDUCATION','CERTIFICATIONS','PROJECTS','REFERENCES'])
  for (let i = 0; i < lines.length; i++) {
    const ln = lines[i].trim()
    if (!ln) { y -= 6; if (y < margin) { page = doc.addPage([w, h]); y = h - margin } continue }
    if (ln === '---') { drawRule(); continue }
    const h3 = ln.match(/^###\s+\*\*(.+)\*\*$/) || ln.match(/^###\s+(.+)$/)
    const h2 = ln.match(/^##\s+(.+)$/)
    const bullet = ln.match(/^[-*]\s+(.*)$/) || ln.match(/^•\s+(.*)$/)
    if (!h2 && !h3 && headingTitles.has(ln.toUpperCase())) {
      page.drawText(ln.toUpperCase(), { x: margin, y, size: 13, font: bold, color: rgb(0.15,0.15,0.2) })
      y -= 16
      drawRule()
      continue
    }
    if (h2) {
      y -= 4
      page.drawText(h2[1].toUpperCase(), { x: margin, y, size: 13, font: bold, color: rgb(0.15,0.15,0.2) })
      y -= 16
      drawRule()
      continue
    }
    if (h3) {
      page.drawText(h3[1], { x: margin, y, size: 12, font: bold })
      y -= 16
      continue
    }
    if (bullet) {
      page.drawText('•', { x: margin + 2, y, size: 11, font: bold })
      const saveX = margin + 12
      const max = w - margin - saveX
      const words = bullet[1].split(' ')
      let cur = ''
      const flush = () => {
        if (!cur) return
        page.drawText(cur, { x: saveX, y, size: 11, font })
        lineAdvance(11)
        cur = ''
      }
      for (const word of words) {
        const t = cur ? cur + ' ' + word : word
        if (font.widthOfTextAtSize(t, 11) > max) { flush(); cur = word } else { cur = t }
      }
      flush()
      continue
    }
    drawRich(ln)
  }
  return await doc.save()
}

// Template style (static) -----------------------------------------------------
const TEMPLATE_MD = `**James Walker**
London, UK
+44 7912 345678 | james.walker@email.com | linkedin.com/in/jameswalker


### **Professional Summary**

Results-driven Web Developer with 6+ years of experience building responsive and scalable web applications. Skilled in modern JavaScript frameworks, API integrations, and performance optimization. Adept at transforming business needs into user-friendly digital experiences.



### **Key Skills**

* HTML5, CSS3, JavaScript (ES6+)
* React.js, Next.js, Node.js, Express
* RESTful APIs, GraphQL
* TypeScript, Tailwind CSS, Redux
* Git, GitHub Actions, Docker
* MongoDB, PostgreSQL
* Responsive and Accessible Design
* Agile / Scrum



### **Professional Experience**

**Senior Front-End Developer**
**BrightWave Digital, London** — *Jan 2021 – Present*

* Led the front-end rebuild of the company’s SaaS dashboard using Next.js and Tailwind, improving load time by 35%.
* Built reusable UI components and improved accessibility across all products.
* Collaborated with backend teams to design GraphQL APIs for faster data fetching.
* Mentored 3 junior developers through code reviews and pair programming.

**Web Developer**
**PixelForge Studios, Manchester** — *Aug 2017 – Dec 2020*

* Developed over 20 client websites using React, Node.js, and WordPress.
* Automated deployment pipelines via GitHub Actions and Docker.
* Optimized website SEO and Core Web Vitals scores for improved performance.
* Coordinated with design teams to ensure consistent brand identity.



### **Education**

**BSc (Hons) Computer Science**
University of Manchester — *2014 – 2017*



### **Certifications**

* Google Professional Cloud Developer – 2020
* Meta Front-End Developer Certificate – 2022



### **Projects**

**Portfolio Builder App** – Built a React-based portfolio generator that lets freelancers deploy personal sites via GitHub Pages.
**E-Commerce Dashboard** – Developed an admin dashboard with Next.js and Chart.js to visualize live sales analytics.`

// OpenAI helpers --------------------------------------------------------------
async function openaiUploadFile(fileBytes: ArrayBuffer | Uint8Array, fileName: string, mime: string): Promise<string> {
  const uint8 = fileBytes instanceof ArrayBuffer ? new Uint8Array(fileBytes) : fileBytes
  const form = new FormData()
  // Convert to ArrayBuffer for Blob to avoid SAB typing complaints in some runtimes
  const arrBuf = new Uint8Array(uint8).slice().buffer as ArrayBuffer
  form.append('file', new Blob([arrBuf], { type: mime || 'application/octet-stream' }), fileName || 'file')
  // assistants purpose is widely accepted for file references
  form.append('purpose', 'assistants')

  const res = await fetch('https://api.openai.com/v1/files', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${openaiApiKey}` },
    body: form
  })
  if (!res.ok) {
    const errText = await res.text()
    let parsed: any = null
    try { parsed = JSON.parse(errText) } catch {}
    const openaiErr = parsed?.error || parsed || errText
    throw { code: 'OPENAI_FILE_UPLOAD_FAILED', status: res.status, openai: openaiErr, raw: errText, message: `OpenAI file upload failed: ${res.status}` }
  }
  const json = await res.json()
  const id = json?.id
  if (!id) throw new Error('OPENAI_FILE_ID_MISSING')
  return id
}

async function safeDownload(bucket: string, rawPath: string): Promise<ArrayBuffer> {
  const candidates = Array.from(new Set([
    cleanPath(rawPath),
    cleanPath(decodeURIComponent(rawPath)),
    cleanPath(encodeURI(rawPath)),
    cleanPath(rawPath.replace(/^resumes\//, '')), // just in case
    cleanPath(rawPath.replace(/^documents\//, '')),
  ]))
  let lastErr: any = null
  for (const key of candidates) {
    try {
      console.log(`[tailor-cv] trying download bucket='${bucket}' key='${key}'`)
      const { data, error } = await supabase.storage.from(bucket).download(key)
      if (error) { lastErr = error; continue }
      return await data.arrayBuffer()
    } catch (e) {
      lastErr = e
    }
  }
  throw new Error(`STORAGE_DOWNLOAD_FAILED bucket='${bucket}' path='${rawPath}' lastError='${lastErr?.message || lastErr}'`)
}

async function fetchResumeFileById(resumeId: string): Promise<{ bytes: ArrayBuffer, filename: string, mime: string }> {
  // New table: resumes
  const { data: r1 } = await supabase
    .from('resumes')
    .select('file_url, file_name')
    .eq('id', resumeId)
    .maybeSingle()
  if (r1?.file_url) {
    const parsed = parseStoragePublicUrl(r1.file_url)
    if (!parsed) throw new Error('RESUME_PATH_INVALID')
    console.log(`[tailor-cv] primary download bucket='${parsed.bucket}' path='${parsed.objectPath}'`)
    let arr: ArrayBuffer
    try {
      arr = await safeDownload(parsed.bucket, parsed.objectPath)
    } catch (e) {
      const altBucket = parsed.bucket === 'resumes' ? 'documents' : 'resumes'
      console.warn(`[tailor-cv] primary download failed, trying alt bucket='${altBucket}' path='${parsed.objectPath}'`)
      arr = await safeDownload(altBucket, parsed.objectPath)
    }
    const ext = (r1.file_name || '').toLowerCase().split('.').pop() || ''
    const mime = ext === 'pdf' ? 'application/pdf' : ext === 'docx' ? 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' : ext === 'txt' ? 'text/plain' : 'application/octet-stream'
    return { bytes: arr, filename: r1.file_name || 'resume', mime }
  }
  // Legacy table: candidate_resumes
  const { data: r2 } = await supabase
    .from('candidate_resumes')
    .select('file_path, name')
    .eq('id', resumeId)
    .maybeSingle()
  if (r2?.file_path) {
    // Support both raw object keys and full public URLs; prefer parsed URL when available
    const parsed = parseStoragePublicUrl(r2.file_path)
    const initialBucket = parsed?.bucket
      || (/^documents\//.test(r2.file_path) || /\/documents\//.test(r2.file_path) ? 'documents' : undefined)
      || (/^resumes\//.test(r2.file_path) || /\/resumes\//.test(r2.file_path) ? 'resumes' : undefined)
      || 'documents' // default guess: most legacy uploads used 'documents'
    const objectPath = parsed?.objectPath || r2.file_path.replace(/^documents\//, '').replace(/^resumes\//, '')

    // Try initial bucket then fallback to the other one
    const bucketsToTry = initialBucket === 'documents' ? ['documents', 'resumes'] : ['resumes', 'documents']
    let lastErr: any = null
    for (const b of bucketsToTry) {
      try {
        console.log(`[tailor-cv] download from bucket='${b}' path='${objectPath}'`)
        const arr = await safeDownload(b, objectPath)
        return { bytes: arr, filename: r2.name || 'resume', mime: 'application/octet-stream' }
      } catch (e) {
        lastErr = e
        console.warn(`[tailor-cv] download attempt failed bucket='${b}' path='${objectPath}':`, (e as any)?.message || e)
      }
    }
    throw new Error(`STORAGE_DOWNLOAD_FAILED bucket='${bucketsToTry.join('>or<')}' path='${objectPath}' lastError='${lastErr?.message || lastErr}'`)
  }
  throw new Error('RESUME_NOT_FOUND')
}

async function fetchJobById(jobId: string): Promise<{ title: string, company: string, description: string }> {
  const { data, error } = await supabase
    .from('jobs')
    .select('title, company, description')
    .eq('id', jobId)
    .single()
  if (error) throw new Error('JOB_NOT_FOUND: ' + error.message)
  return { title: data.title, company: data.company, description: data.description }
}

// OpenAI-powered extraction & tailoring --------------------------------------
async function openaiExtractTextFromFile(fileBytes: ArrayBuffer | Uint8Array, fileName: string, mime: string): Promise<string> {
  const uint8 = fileBytes instanceof ArrayBuffer ? new Uint8Array(fileBytes) : fileBytes
  const lower = (mime || '').toLowerCase()
  const isText = lower.startsWith('text/plain') || fileName.toLowerCase().endsWith('.txt')
  const isImage = lower.startsWith('image/')
  const isPdfOrDoc = lower === 'application/pdf' || lower === 'application/msword' || lower === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || fileName.toLowerCase().endsWith('.pdf') || fileName.toLowerCase().endsWith('.doc') || fileName.toLowerCase().endsWith('.docx')

  const prompt = `Extract all human-readable text from the attached resume (PDF/DOCX/TXT/Image). Return ONLY plain text. Preserve line breaks. Perform OCR if needed.`

  // Build messages according to content type
  let messages: any[]
  if (isText) {
    const textContent = new TextDecoder().decode(uint8)
    messages = [
      { role: 'system', content: prompt },
      { role: 'user', content: [ { type: 'text', text: `Filename: ${fileName}` }, { type: 'text', text: textContent.slice(0, 200000) } ] }
    ]
  } else if (isImage) {
    const b64 = btoa(String.fromCharCode(...uint8))
    const dataUrl = `data:${mime || 'image/png'};base64,${b64}`
    messages = [
      { role: 'system', content: prompt },
      { role: 'user', content: [ { type: 'text', text: `Filename: ${fileName}` }, { type: 'image_url', image_url: { url: dataUrl } } ] }
    ]
  } else if (isPdfOrDoc) {
    // Upload file and reference by file id
    const fileId = await openaiUploadFile(uint8, fileName, mime || 'application/octet-stream')
    messages = [
      { role: 'system', content: prompt },
      { role: 'user', content: [ { type: 'text', text: `Filename: ${fileName}` }, { type: 'file', file: { file_id: fileId } } ] }
    ]
  } else {
    // Fallback: attempt image_url if possible, otherwise file upload
    const b64 = btoa(String.fromCharCode(...uint8))
    const dataUrl = `data:${mime || 'application/octet-stream'};base64,${b64}`
    messages = [
      { role: 'system', content: prompt },
      { role: 'user', content: [ { type: 'text', text: `Filename: ${fileName}` }, { type: 'image_url', image_url: { url: dataUrl } } ] }
    ]
  }

  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${openaiApiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      temperature: 0,
      max_tokens: 4000,
      messages
    })
  })
  if (!res.ok) {
    const errText = await res.text()
    let parsed: any = null
    try { parsed = JSON.parse(errText) } catch {}
    const openaiErr = parsed?.error || parsed || errText
    throw { code: 'OPENAI_REQUEST_FAILED', stage: 'extract', status: res.status, openai: openaiErr, raw: errText, message: `OpenAI extract failed: ${res.status}` }
  }
  const json = await res.json()
  const text = json.choices?.[0]?.message?.content || ''
  if (!text || text.trim().length < 10) throw new Error('EXTRACT_EMPTY')
  return text.trim()
}

async function openaiGenerateTailoredMarkdown(resumeText: string, jobTitle: string, companyName: string, jobDescription: string): Promise<string> {
  const prompt = `ROLE: You are an expert UK CV writer.

GOAL: Recreate the candidate's original resume content in the exact style and layout of the provided TEMPLATE, returning valid Markdown (no code fences). Preserve ALL original information, sections, experiences, skills, bullet content and dates. Do NOT invent new roles or rewrite content beyond light wording adjustments.

ALLOWED CHANGES:
- Inject and weave in relevant keywords from the JOB DESCRIPTION into the existing content (especially the summary and bullets), only where they naturally fit.
- Improve clarity and concision of sentences without changing factual meaning.
- Maintain UK spelling.

STRICT REQUIREMENTS:
- Preserve original sections: Summary/Profile, Key Skills, Professional Experience (keep all roles and bullets), Education, Certifications, Projects, Contact.
- Keep all original content; do NOT delete content. You may reorder bullets for clarity.
- Output MUST follow the TEMPLATE style: headings, bold usage, bullet style, and section order as demonstrated below.
- Output MUST be pure Markdown, no code fences, no extra commentary.
- Keep the candidate's name and contact info from the source; do NOT use placeholder names.

TEMPLATE (STYLE GUIDE ONLY - copy the structure and formatting, NOT the sample content):\n\n${TEMPLATE_MD}

JOB TITLE: ${jobTitle || 'Professional Role'}
COMPANY: ${companyName || 'Company'}
JOB DESCRIPTION (for keywords only):\n${jobDescription}

SOURCE RESUME TEXT (authoritative content to preserve):\n${resumeText}`

  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${openaiApiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      temperature: 0.3,
      max_tokens: 6000,
      messages: [ { role: 'system', content: 'Respond ONLY with the Markdown resume. No code fences.' }, { role: 'user', content: prompt } ]
    })
  })
  if (!res.ok) {
    const errText = await res.text()
    let parsed: any = null
    try { parsed = JSON.parse(errText) } catch {}
    const openaiErr = parsed?.error || parsed || errText
    throw { code: 'OPENAI_REQUEST_FAILED', stage: 'tailor', status: res.status, openai: openaiErr, raw: errText, message: `OpenAI tailor failed: ${res.status}` }
  }
  const json = await res.json()
  const md = json.choices?.[0]?.message?.content || ''
  if (!md || md.trim().length < 50) throw new Error('TAILOR_EMPTY')
  return md.trim()
}

// keep a light sanitizer for encoding only (OpenAI will render PDF)
function markdownSanitizeForPdf(md: string): string {
  if (!md) return md
  let t = md.normalize('NFC')
  t = t.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, '')
  return t
}

// removed local PDF renderer; OpenAI Responses API is the sole PDF generator now

function classifyError(error: any): { code: string, message: string, userMessage: string, stack?: string } {
  try {
    if (typeof error === 'string') return { code: 'ERROR', message: error, userMessage: error }
    const msg = error?.message || (error ? JSON.stringify(error) : 'Unknown error')
    const stack = error?.stack || undefined
    return { code: 'ERROR', message: msg, userMessage: msg, stack }
  } catch {
    return { code: 'ERROR', message: 'Unknown error', userMessage: 'Unknown error' }
  }
}

// HTTP Handler ---------------------------------------------------------------
serve(async (req) => {
  const requestId = crypto.randomUUID().substring(0, 8)
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders })
  if (req.method !== 'POST') return new Response(JSON.stringify({ success: false, error: 'Use POST' }), { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
  try {
    const contentType = req.headers.get('content-type') || ''
    console.log(`[tailor-cv] requestId=${requestId} method=${req.method} contentType='${contentType}'`)

    // Multipart: direct file upload
    if (contentType.includes('multipart/form-data')) {
      const form = await req.formData()
      const file = form.get('file') as File
      const userId = String(form.get('userId') || '')
      const jobTitle = String(form.get('jobTitle') || 'Professional Role')
      const companyName = String(form.get('companyName') || 'Company')
      const jobDescription = String(form.get('jobDescription') || '')
      if (!file) throw new Error('No file uploaded')

      const bytes = await file.arrayBuffer()
      const extracted = await openaiExtractTextFromFile(bytes, file.name || 'resume', file.type || 'application/octet-stream')
      const markdown = await openaiGenerateTailoredMarkdown(extracted, jobTitle, companyName, jobDescription)
      const mdClean = markdownSanitizeForPdf(markdown)
      const pdfBytes = await generatePdfFromMarkdown(mdClean, `${companyName || 'Company'} - ${jobTitle || 'Role'}`)

      const base = `tailored_${Date.now()}_${(file.name || 'resume').replace(/\.[^/.]+$/, '')}`
      const pdfKey = `${base}.pdf`
      const mdKey = `${base}.md`
      const { error: upErr } = await supabase.storage.from('tailored-resumes').upload(pdfKey, pdfBytes, { contentType: 'application/pdf', upsert: false })
      if (upErr) throw new Error(`Failed to upload tailored pdf: ${upErr.message}`)
      const mdBytes = new TextEncoder().encode(mdClean)
      const { error: upMdErr } = await supabase.storage.from('tailored-resumes').upload(mdKey, mdBytes, { contentType: 'text/markdown; charset=utf-8', upsert: false })
      if (upMdErr) throw new Error(`Failed to upload markdown: ${upMdErr.message}`)

      const { data: row, error: insErr } = await supabase
        .from('tailored_resumes')
        .insert({
          user_id: userId || null,
          original_resume_id: null,
          job_id: null,
          tailored_content: mdClean,
          job_title: jobTitle,
          company_name: companyName,
          file_url: supabase.storage.from('tailored-resumes').getPublicUrl(pdfKey).data.publicUrl,
          file_name: pdfKey,
          status: 'tailored',
          file_format: 'pdf',
          tailoring_score: 85
        })
        .select()
        .single()
      if (insErr) throw new Error(`Failed to save tailored resume: ${insErr.message}`)

      return new Response(JSON.stringify({ success: true, tailoredResumeId: row.id, downloadUrl: supabase.storage.from('tailored-resumes').getPublicUrl(pdfKey).data.publicUrl, markdownUrl: supabase.storage.from('tailored-resumes').getPublicUrl(mdKey).data.publicUrl, score: 85 }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
    }

    // JSON: resolve by ids
    const body = await req.json()
    console.log(`[tailor-cv] requestId=${requestId} json-received keys=${Object.keys(body || {}).join(',')}`)
    const userId = String(body.userId || '')
    let jobTitle = String(body.jobTitle || '')
    let companyName = String(body.companyName || '')
    let jobDescription = String(body.jobDescription || '')
    if (body.jobId) {
      try {
        console.log(`[tailor-cv] requestId=${requestId} resolving jobId=${body.jobId}`)
        const job = await fetchJobById(String(body.jobId))
        jobTitle ||= job.title; companyName ||= job.company; jobDescription ||= job.description
        console.log(`[tailor-cv] requestId=${requestId} job resolved title='${jobTitle}' company='${companyName}' descLength=${(jobDescription||'').length}`)
      } catch (e) {
        console.warn(`[tailor-cv] requestId=${requestId} job resolve failed:`, e)
      }
    }
    if (!body.resumeId && !body.resumeContent) throw new Error('Missing resumeId or resumeContent')

    let resumeText = String(body.resumeContent || '').trim()
    if (!resumeText && body.resumeId) {
      console.log(`[tailor-cv] requestId=${requestId} resolving resumeId=${body.resumeId}`)
      const f = await fetchResumeFileById(String(body.resumeId))
      console.log(`[tailor-cv] requestId=${requestId} resume fetched filename='${f.filename}' mime='${f.mime}' size=${(f.bytes as ArrayBuffer).byteLength || 0}`)
      console.log(`[tailor-cv] requestId=${requestId} extracting text via OpenAI...`)
      resumeText = await openaiExtractTextFromFile(f.bytes, f.filename, f.mime)
      console.log(`[tailor-cv] requestId=${requestId} extraction complete length=${resumeText.length}`)
    }

    console.log(`[tailor-cv] requestId=${requestId} generating tailored markdown via OpenAI...`)
    const markdown = await openaiGenerateTailoredMarkdown(resumeText, jobTitle || 'Professional Role', companyName || 'Company', jobDescription || '')
    console.log(`[tailor-cv] requestId=${requestId} markdown length=${markdown.length}`)
    const mdClean = markdownSanitizeForPdf(markdown)
    const pdfBytes = await generatePdfFromMarkdown(mdClean, `${companyName || 'Company'} - ${jobTitle || 'Role'}`)
    console.log(`[tailor-cv] requestId=${requestId} pdf bytes=${pdfBytes.length}`)

    // Upload markdown and pdf
    const uuid = crypto.randomUUID().substring(0,8)
    const baseName = `tailored_${Date.now()}_${uuid}`
    const pdfKey = `${baseName}.pdf`
    const mdKey = `${baseName}.md`
    console.log(`[tailor-cv] requestId=${requestId} uploading to storage bucket='tailored-resumes' keys='${pdfKey}', '${mdKey}'`)
    const { error: upErr } = await supabase.storage.from('tailored-resumes').upload(pdfKey, pdfBytes, { contentType: 'application/pdf', upsert: false })
    if (upErr) throw new Error(`Failed to upload tailored pdf: ${upErr.message}`)
    const { error: upMdErr } = await supabase.storage.from('tailored-resumes').upload(mdKey, new TextEncoder().encode(mdClean), { contentType: 'text/markdown', upsert: false })
    if (upMdErr) console.warn(`[tailor-cv] markdown upload failed: ${upMdErr.message}`)

    console.log(`[tailor-cv] requestId=${requestId} inserting tailored_resumes row...`)
    const { data: row, error: insErr } = await supabase
      .from('tailored_resumes')
      .insert({
        user_id: userId || null,
        original_resume_id: body.resumeId || null,
        job_id: body.jobId || null,
        tailored_content: mdClean,
        job_title: jobTitle || null,
        company_name: companyName || null,
        job_description: jobDescription || null,
        tailored_file_path: pdfKey,
        file_format: 'pdf',
        status: 'tailored',
        tailoring_score: 85
      })
      .select()
      .single()
    if (insErr) throw new Error(`Failed to save tailored resume: ${insErr.message}`)

    console.log(`[tailor-cv] requestId=${requestId} completed tailoredResumeId=${row.id}`)
    return new Response(JSON.stringify({ success: true, tailoredResumeId: row.id, downloadUrl: supabase.storage.from('tailored-resumes').getPublicUrl(pdfKey).data.publicUrl, markdownUrl: supabase.storage.from('tailored-resumes').getPublicUrl(mdKey).data.publicUrl, score: 85, requestId }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
  } catch (error) {
    const info = classifyError(error)
    console.error(`[tailor-cv] requestId=${requestId} error=`, info.message, info.stack || '')
    const openaiStage = (error as any)?.stage
    const openaiStatus = (error as any)?.status
    const openaiError = (error as any)?.openai
    const openaiRaw = (error as any)?.raw
    return new Response(JSON.stringify({ success: false, error: info.userMessage, errorCode: info.code, technicalError: info.message, stack: info.stack, requestId, openaiStage, openaiStatus, openaiError, openaiRaw }), { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
  }
})