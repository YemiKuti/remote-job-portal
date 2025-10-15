import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Download, FileText, RotateCcw, Eye, AlertCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { jsPDF } from 'jspdf';
import DOMPurify from 'dompurify';

interface DownloadStepProps {
  workflowData: {
    tailoredResumeId: string;
    jobTitle: string;
    companyName: string;
    selectedResume: any;
    downloadUrl?: string;
    markdownUrl?: string;
  };
  onRestart: () => void;
}

export function DownloadStep({ workflowData, onRestart }: DownloadStepProps) {
  const [tailoredResume, setTailoredResume] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  useEffect(() => {
    fetchTailoredResume();
  }, [workflowData.tailoredResumeId]);

  const fetchTailoredResume = async () => {
    try {
      const { data, error } = await supabase
        .from('tailored_resumes')
        .select('*')
        .eq('id', workflowData.tailoredResumeId)
        .single();

      if (error) throw error;
      setTailoredResume(data);
    } catch (error) {
      console.error('Error fetching tailored resume:', error);
      toast.error('Failed to load tailored resume');
    } finally {
      setLoading(false);
    }
  };

  const generateFileName = (format: string) => {
    const company = workflowData.companyName?.replace(/[^a-zA-Z0-9]/g, '_') || 'Company';
    const job = workflowData.jobTitle?.replace(/[^a-zA-Z0-9]/g, '_') || 'Position';
    const timestamp = new Date().toISOString().split('T')[0];
    return `Resume_${job}_${company}_${timestamp}.${format}`;
  };

  const formatResumeContent = (content: string) => {
    // Clean up the content and remove formatting artifacts
    let cleanContent = content
      .replace(/\*\*(.*?)\*\*/g, '$1') // Remove bold markdown
      .replace(/^\s*---\s*$/gm, '') // Remove separator lines
      .replace(/\[.*?\]/g, '') // Remove any remaining placeholders
      .trim();

    // Split into lines and process
    const lines = cleanContent.split('\n').map(line => line.trim()).filter(line => line.length > 0);
    
    let formattedSections = [];
    let currentSection = '';
    let currentContent = [];
    let isFirstSection = true;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      
      // Check if this is a section header
      const sectionKeywords = /^(PROFESSIONAL SUMMARY|SUMMARY|OBJECTIVE|PROFESSIONAL EXPERIENCE|EXPERIENCE|EDUCATION|SKILLS|WORK EXPERIENCE|EMPLOYMENT|ACHIEVEMENTS?|PROJECTS?|CERTIFICATIONS?|CONTACT|TECHNICAL SKILLS|WORK HISTORY|CAREER OBJECTIVE)$/i;
      
      // Also check if it's the contact information (first few lines)
      if (isFirstSection && i < 6 && (line.includes('@') || line.includes('(') || line.includes('St,') || line.includes('Ave,') || line.includes('linkedin'))) {
        if (currentSection !== 'CONTACT') {
          if (currentSection && currentContent.length > 0) {
            formattedSections.push({
              title: currentSection,
              content: currentContent.join('\n')
            });
          }
          currentSection = 'CONTACT';
          currentContent = [];
        }
        currentContent.push(line);
      } else if (sectionKeywords.test(line)) {
        isFirstSection = false;
        // Save previous section if exists
        if (currentSection && currentContent.length > 0) {
          formattedSections.push({
            title: currentSection,
            content: currentContent.join('\n')
          });
        }
        
        // Start new section
        currentSection = line.toUpperCase();
        currentContent = [];
      } else if (line.length > 0) {
        isFirstSection = false;
        currentContent.push(line);
      }
    }
    
    // Add the last section
    if (currentSection && currentContent.length > 0) {
      formattedSections.push({
        title: currentSection,
        content: currentContent.join('\n')
      });
    }

    return formattedSections;
  };

  const generatePDF = (content: string) => {
    const sections = formatResumeContent(content);
    const pdf = new jsPDF('p', 'mm', 'a4');
    
    // Find contact section
    const contactSection = sections.find(s => s.title === 'CONTACT');
    const otherSections = sections.filter(s => s.title !== 'CONTACT');
    
    let yPosition = 20;
    const pageWidth = pdf.internal.pageSize.getWidth();
    const margin = 20;
    const contentWidth = pageWidth - (2 * margin);
    
    // Header
    if (contactSection) {
      const contactLines = contactSection.content.split('\n');
      const name = contactLines[0] || 'Professional Resume';
      
      // Name
      pdf.setFontSize(22);
      pdf.setFont('helvetica', 'bold');
      pdf.text(name, pageWidth / 2, yPosition, { align: 'center' });
      yPosition += 8;
      
      // Contact info
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');
      const contactInfo = contactLines.slice(1).join(' • ');
      pdf.text(contactInfo, pageWidth / 2, yPosition, { align: 'center' });
      yPosition += 6;
      
      // Job info
      const jobInfo = `${workflowData.jobTitle ? `Position: ${workflowData.jobTitle}` : ''}${workflowData.companyName ? ` • Company: ${workflowData.companyName}` : ''} • Generated: ${new Date().toLocaleDateString()}`;
      pdf.text(jobInfo, pageWidth / 2, yPosition, { align: 'center' });
      yPosition += 10;
    } else {
      // Fallback header
      pdf.setFontSize(22);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Professional Resume', pageWidth / 2, yPosition, { align: 'center' });
      yPosition += 8;
      
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');
      const jobInfo = `${workflowData.jobTitle ? `Position: ${workflowData.jobTitle}` : ''}${workflowData.companyName ? ` • Company: ${workflowData.companyName}` : ''} • Generated: ${new Date().toLocaleDateString()}`;
      pdf.text(jobInfo, pageWidth / 2, yPosition, { align: 'center' });
      yPosition += 10;
    }
    
    // Separator line
    pdf.setDrawColor(44, 62, 80);
    pdf.setLineWidth(0.5);
    pdf.line(margin, yPosition, pageWidth - margin, yPosition);
    yPosition += 8;

    // Sections
    otherSections.forEach(section => {
      // Check if we need a new page
      if (yPosition > 250) {
        pdf.addPage();
        yPosition = 20;
      }
      
      // Section title
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'bold');
      pdf.text(section.title, margin, yPosition);
      yPosition += 6;
      
      // Section content
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');
      
      const contentLines = section.content.split('\n');
      contentLines.forEach(line => {
        if (yPosition > 270) {
          pdf.addPage();
          yPosition = 20;
        }
        
        const trimmedLine = line.trim();
        if (trimmedLine.length === 0) return;
        
        // Format different types of content
        if (trimmedLine.startsWith('- ')) {
          // Bullet point
          const bulletText = trimmedLine.substring(2);
          const wrappedText = pdf.splitTextToSize(bulletText, contentWidth - 10);
          pdf.text('•', margin + 5, yPosition);
          pdf.text(wrappedText, margin + 10, yPosition);
          yPosition += wrappedText.length * 4;
        } else if (trimmedLine.match(/^[A-Z][a-zA-Z\s]+$/)) {
          // Job title
          pdf.setFont('helvetica', 'bold');
          pdf.text(trimmedLine, margin + 5, yPosition);
          pdf.setFont('helvetica', 'normal');
          yPosition += 5;
        } else if (trimmedLine.includes(',') && (trimmedLine.includes('CA') || trimmedLine.includes('NY') || trimmedLine.includes('–') || trimmedLine.includes('-'))) {
          // Company and date info
          pdf.setFont('helvetica', 'italic');
          pdf.text(trimmedLine, margin + 5, yPosition);
          pdf.setFont('helvetica', 'normal');
          yPosition += 5;
        } else {
          // Regular content
          const wrappedText = pdf.splitTextToSize(trimmedLine, contentWidth);
          pdf.text(wrappedText, margin + 5, yPosition);
          yPosition += wrappedText.length * 4;
        }
      });
      
      yPosition += 5; // Space between sections
    });

    return pdf;
  };

  const generateHTMLContent = (content: string) => {
    const sections = formatResumeContent(content);
    
    // Find contact section
    const contactSection = sections.find(s => s.title === 'CONTACT');
    const otherSections = sections.filter(s => s.title !== 'CONTACT');
    
    let headerHTML = '';
    if (contactSection) {
      const contactLines = contactSection.content.split('\n');
      const name = contactLines[0] || 'Professional Resume';
      const contactInfo = contactLines.slice(1).join(' • ');
      
      headerHTML = `
        <div class="header">
          <h1>${name}</h1>
          <div class="contact-info">${contactInfo}</div>
          <div class="job-info">
            ${workflowData.jobTitle ? `Position: ${workflowData.jobTitle}` : ''}
            ${workflowData.companyName ? ` • Company: ${workflowData.companyName}` : ''}
            • Generated: ${new Date().toLocaleDateString()}
          </div>
        </div>
      `;
    } else {
      headerHTML = `
        <div class="header">
          <h1>Professional Resume</h1>
          <div class="job-info">
            ${workflowData.jobTitle ? `Position: ${workflowData.jobTitle}` : ''}
            ${workflowData.companyName ? ` • Company: ${workflowData.companyName}` : ''}
            • Generated: ${new Date().toLocaleDateString()}
          </div>
        </div>
      `;
    }

    const sectionsHTML = otherSections.map(section => {
      const formattedContent = section.content
        .split('\n')
        .map(line => {
          // Format job titles and company names
          if (line.match(/^[A-Z][a-zA-Z\s]+$/)) {
            return `<div class="job-title">${line}</div>`;
          }
          // Format company and date lines
          if (line.includes(',') && (line.includes('CA') || line.includes('NY') || line.includes('–') || line.includes('-'))) {
            return `<div class="company-info">${line}</div>`;
          }
          // Format bullet points
          if (line.startsWith('- ')) {
            return `<div class="bullet-point">${line.substring(2)}</div>`;
          }
          // Format education entries
          if (line.includes('University') || line.includes('College') || line.includes('Graduated:')) {
            return `<div class="education-item">${line}</div>`;
          }
          return `<div class="content-line">${line}</div>`;
        })
        .join('');

      return `
        <div class="section">
          <h2 class="section-title">${section.title}</h2>
          <div class="section-content">${formattedContent}</div>
        </div>
      `;
    }).join('');

    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Resume - ${workflowData.jobTitle || 'Professional Resume'}</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: 'Calibri', 'Arial', sans-serif;
            line-height: 1.4;
            color: #333;
            max-width: 8.5in;
            margin: 0 auto;
            padding: 0.75in;
            background: white;
            font-size: 11pt;
        }
        
        .header {
            text-align: center;
            margin-bottom: 30px;
            padding-bottom: 20px;
            border-bottom: 2px solid #2c3e50;
        }
        
        .header h1 {
            font-size: 28pt;
            font-weight: bold;
            color: #2c3e50;
            margin-bottom: 8px;
            letter-spacing: 0.5px;
        }
        
        .contact-info {
            font-size: 11pt;
            color: #555;
            margin-bottom: 8px;
            line-height: 1.2;
        }
        
        .job-info {
            font-size: 10pt;
            color: #777;
            font-style: italic;
        }
        
        .section {
            margin-bottom: 25px;
            page-break-inside: avoid;
        }
        
        .section-title {
            font-size: 14pt;
            font-weight: bold;
            color: #2c3e50;
            text-transform: uppercase;
            letter-spacing: 1px;
            border-bottom: 1px solid #bdc3c7;
            padding-bottom: 5px;
            margin-bottom: 15px;
            position: relative;
        }
        
        .section-title::before {
            content: '';
            position: absolute;
            bottom: -1px;
            left: 0;
            width: 60px;
            height: 2px;
            background-color: #3498db;
        }
        
        .section-content {
            margin-left: 5px;
        }
        
        .job-title {
            font-size: 12pt;
            font-weight: bold;
            color: #2c3e50;
            margin-top: 15px;
            margin-bottom: 3px;
        }
        
        .company-info {
            font-size: 10pt;
            color: #666;
            font-style: italic;
            margin-bottom: 8px;
        }
        
        .bullet-point {
            font-size: 11pt;
            margin-bottom: 4px;
            padding-left: 15px;
            position: relative;
            text-align: justify;
        }
        
        .bullet-point::before {
            content: '•';
            position: absolute;
            left: 0;
            color: #3498db;
            font-weight: bold;
        }
        
        .education-item {
            font-size: 11pt;
            margin-bottom: 5px;
            font-weight: ${section => section.includes('Bachelor') || section.includes('Master') ? 'bold' : 'normal'};
        }
        
        .content-line {
            font-size: 11pt;
            margin-bottom: 5px;
            text-align: justify;
        }
        
        /* Skills section special formatting */
        .section:has(.section-title:contains("SKILLS")) .content-line {
            display: inline-block;
            margin-right: 15px;
            margin-bottom: 8px;
        }
        
        /* Print-specific styles */
        @media print {
            body {
                padding: 0.5in;
                font-size: 10pt;
            }
            
            .header h1 {
                font-size: 24pt;
            }
            
            .section {
                page-break-inside: avoid;
                margin-bottom: 20px;
            }
            
            .section-title {
                font-size: 12pt;
            }
        }
        
        /* Responsive adjustments */
        @media screen and (max-width: 768px) {
            body {
                padding: 20px;
                font-size: 12pt;
            }
            
            .header h1 {
                font-size: 22pt;
            }
            
            .section-title {
                font-size: 13pt;
            }
        }
    </style>
</head>
<body>
    ${headerHTML}
    
    <div class="content">
        ${sectionsHTML}
    </div>
</body>
</html>`;
  };

  const generateFormattedText = (content: string) => {
    const sections = formatResumeContent(content);
    
    // Find contact section
    const contactSection = sections.find(s => s.title === 'CONTACT');
    const otherSections = sections.filter(s => s.title !== 'CONTACT');
    
    let formattedText = '';
    
    if (contactSection) {
      const contactLines = contactSection.content.split('\n');
      formattedText += `${contactLines[0]}\n`;
      formattedText += `${contactLines.slice(1).join(' • ')}\n\n`;
    }
    
    formattedText += `${'='.repeat(80)}\n`;
    if (workflowData.jobTitle) {
      formattedText += `POSITION: ${workflowData.jobTitle.toUpperCase()}\n`;
    }
    if (workflowData.companyName) {
      formattedText += `COMPANY: ${workflowData.companyName.toUpperCase()}\n`;
    }
    formattedText += `GENERATED: ${new Date().toLocaleDateString()}\n`;
    formattedText += `${'='.repeat(80)}\n\n`;

    otherSections.forEach(section => {
      formattedText += `${section.title}\n`;
      formattedText += `${'-'.repeat(section.title.length)}\n\n`;
      
      const lines = section.content.split('\n');
      lines.forEach(line => {
        if (line.startsWith('- ')) {
          formattedText += `  • ${line.substring(2)}\n`;
        } else {
          formattedText += `${line}\n`;
        }
      });
      formattedText += '\n';
    });

    return formattedText;
  };

  const handleDownload = async (format: 'pdf' | 'docx' | 'txt' | 'html') => {
    if (!tailoredResume) return;

    setDownloading(true);
    try {
      // Prefer direct backend-generated file for PDF
      if (format === 'pdf' && workflowData.downloadUrl) {
        const a = document.createElement('a');
        a.href = workflowData.downloadUrl;
        a.download = generateFileName('pdf');
        a.target = '_blank';
        a.rel = 'noopener';
        a.style.display = 'none';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      } else {
        const content = tailoredResume.tailored_content;
        const fileName = generateFileName(format);
        let blob: Blob;

        switch (format) {
          case 'pdf':
            const pdf = generatePDF(content);
            blob = new Blob([pdf.output('blob')], { type: 'application/pdf' });
            break;
          case 'html':
            const htmlContent = generateHTMLContent(content);
            blob = new Blob([htmlContent], { type: 'text/html' });
            break;
          case 'docx':
            // Create a more structured document for Word
            const docContent = generateFormattedText(content);
            blob = new Blob([docContent], { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' });
            break;
          default: // txt
            const txtContent = generateFormattedText(content);
            blob = new Blob([txtContent], { type: 'text/plain' });
        }

        // Create download link
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = fileName;
        a.style.display = 'none';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }

      // Update download count
      await supabase
        .from('tailored_resumes')
        .update({ download_count: (tailoredResume.download_count || 0) + 1 })
        .eq('id', tailoredResume.id);

      toast.success(`Resume downloaded as ${format.toUpperCase()}`);
    } catch (error) {
      console.error('Error downloading resume:', error);
      toast.error('Failed to download resume');
    } finally {
      setDownloading(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-8">
          <div className="text-center">Loading your tailored resume...</div>
        </CardContent>
      </Card>
    );
  }

  if (!tailoredResume) {
    return (
      <Card>
        <CardContent className="p-8">
          <div className="text-center">
            <p className="text-red-600 mb-4">Failed to load tailored resume</p>
            <Button onClick={onRestart}>Start Over</Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Download className="h-5 w-5 text-green-500" />
            Download Your Tailored Resume
          </CardTitle>
          <CardDescription>
            Ready to use for your application.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-green-900">
                {workflowData.jobTitle || 'Position'} Resume
              </h3>
              {workflowData.companyName && (
                <p className="text-sm text-green-700">For {workflowData.companyName}</p>
              )}
            </div>
            <Badge variant="outline">Score: {tailoredResume.tailoring_score || 85}%</Badge>
          </div>

          <Button onClick={() => handleDownload('pdf')} disabled={downloading} className="w-full h-12">
            <Download className="h-5 w-5 mr-2" /> Download PDF
          </Button>

          {workflowData.markdownUrl && (
            <Button
              variant="outline"
              onClick={() => {
                const a = document.createElement('a');
                a.href = workflowData.markdownUrl as string;
                a.download = generateFileName('md');
                a.target = '_blank';
                a.rel = 'noopener';
                a.style.display = 'none';
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
              }}
              className="w-full h-12"
            >
              <Download className="h-5 w-5 mr-2" /> Download Markdown
            </Button>
          )}

          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setShowPreview(!showPreview)} className="flex-1">
              <Eye className="h-4 w-4 mr-2" /> {showPreview ? 'Hide Preview' : 'Preview'}
            </Button>
            <Button variant="outline" onClick={onRestart} className="flex-1">
              <RotateCcw className="h-4 w-4 mr-2" /> Create Another
            </Button>
          </div>

          {showPreview && (
            <div 
              className="bg-white border rounded-lg p-6 max-h-96 overflow-y-auto"
              dangerouslySetInnerHTML={{ 
                __html: DOMPurify.sanitize(
                  generateHTMLContent(tailoredResume.tailored_content)
                    .replace(/<style>[\s\S]*?<\/style>/, '')
                    .replace(/<html[^>]*>|<\/html>|<head[^>]*>[\s\S]*?<\/head>|<body[^>]*>|<\/body>/g, ''),
                  {
                    ALLOWED_TAGS: ['div', 'h1', 'h2', 'p', 'br', 'strong', 'em', 'ul', 'ol', 'li'],
                    ALLOWED_ATTR: ['class'],
                    KEEP_CONTENT: true,
                  }
                )
              }}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
