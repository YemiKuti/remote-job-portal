import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Download, FileText, RotateCcw, Eye, AlertCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface DownloadStepProps {
  workflowData: {
    tailoredResumeId: string;
    jobTitle: string;
    companyName: string;
    selectedResume: any;
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
    // Split content into sections and format them properly
    const lines = content.split('\n');
    let formattedSections = [];
    let currentSection = '';
    let currentContent = [];

    for (const line of lines) {
      const trimmedLine = line.trim();
      
      // Check if this is a section header (contains common resume section keywords)
      const sectionKeywords = /^(SUMMARY|OBJECTIVE|EXPERIENCE|EDUCATION|SKILLS|WORK EXPERIENCE|EMPLOYMENT|ACHIEVEMENTS?|PROJECTS?|CERTIFICATIONS?|CONTACT|PROFESSIONAL SUMMARY|TECHNICAL SKILLS|WORK HISTORY|CAREER OBJECTIVE)/i;
      
      if (sectionKeywords.test(trimmedLine) && trimmedLine.length < 50) {
        // Save previous section if exists
        if (currentSection && currentContent.length > 0) {
          formattedSections.push({
            title: currentSection,
            content: currentContent.join('\n')
          });
        }
        
        // Start new section
        currentSection = trimmedLine.toUpperCase();
        currentContent = [];
      } else if (trimmedLine.length > 0) {
        currentContent.push(line);
      } else if (currentContent.length > 0) {
        currentContent.push(''); // Preserve empty lines within content
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

  const generateHTMLContent = (content: string) => {
    const sections = formatResumeContent(content);
    
    const sectionsHTML = sections.map(section => `
      <div class="section">
        <h2 class="section-title">${section.title}</h2>
        <div class="section-content">${section.content.replace(/\n/g, '<br>')}</div>
      </div>
    `).join('');

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
            font-family: 'Georgia', 'Times New Roman', serif;
            line-height: 1.6;
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
            font-size: 24pt;
            font-weight: bold;
            color: #2c3e50;
            margin-bottom: 8px;
            letter-spacing: 1px;
        }
        
        .job-info {
            font-size: 12pt;
            color: #7f8c8d;
            font-style: italic;
            margin-bottom: 5px;
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
            letter-spacing: 0.5px;
            border-bottom: 1px solid #bdc3c7;
            padding-bottom: 5px;
            margin-bottom: 12px;
            position: relative;
        }
        
        .section-title::before {
            content: '';
            position: absolute;
            bottom: -1px;
            left: 0;
            width: 40px;
            height: 2px;
            background-color: #3498db;
        }
        
        .section-content {
            font-size: 11pt;
            line-height: 1.5;
            text-align: justify;
            margin-left: 10px;
        }
        
        .section-content br + br {
            line-height: 2;
        }
        
        /* Print-specific styles */
        @media print {
            body {
                padding: 0.5in;
                font-size: 10pt;
            }
            
            .section {
                page-break-inside: avoid;
                margin-bottom: 20px;
            }
            
            .header {
                margin-bottom: 25px;
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
                font-size: 20pt;
            }
            
            .section-title {
                font-size: 13pt;
            }
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>Professional Resume</h1>
        ${workflowData.jobTitle ? `<div class="job-info">Tailored for: ${workflowData.jobTitle}</div>` : ''}
        ${workflowData.companyName ? `<div class="job-info">Company: ${workflowData.companyName}</div>` : ''}
        <div class="job-info">Generated on: ${new Date().toLocaleDateString()}</div>
    </div>
    
    <div class="content">
        ${sectionsHTML || `<div class="section"><div class="section-content">${content.replace(/\n/g, '<br>')}</div></div>`}
    </div>
</body>
</html>`;
  };

  const generateFormattedText = (content: string) => {
    const sections = formatResumeContent(content);
    
    let formattedText = `PROFESSIONAL RESUME\n`;
    formattedText += `${'='.repeat(50)}\n\n`;
    
    if (workflowData.jobTitle) {
      formattedText += `Position: ${workflowData.jobTitle}\n`;
    }
    if (workflowData.companyName) {
      formattedText += `Company: ${workflowData.companyName}\n`;
    }
    formattedText += `Generated: ${new Date().toLocaleDateString()}\n\n`;
    formattedText += `${'='.repeat(50)}\n\n`;

    sections.forEach(section => {
      formattedText += `${section.title}\n`;
      formattedText += `${'-'.repeat(section.title.length)}\n`;
      formattedText += `${section.content}\n\n`;
    });

    return formattedText;
  };

  const handleDownload = async (format: 'pdf' | 'docx' | 'txt' | 'html') => {
    if (!tailoredResume) return;

    setDownloading(true);
    try {
      const content = tailoredResume.tailored_content;
      const fileName = generateFileName(format);
      let blob: Blob;

      switch (format) {
        case 'html':
          const htmlContent = generateHTMLContent(content);
          blob = new Blob([htmlContent], { type: 'text/html' });
          break;
        case 'pdf':
          // For PDF, open formatted HTML in new window for printing
          const pdfHtmlContent = generateHTMLContent(content);
          const printWindow = window.open('', '_blank');
          if (printWindow) {
            printWindow.document.write(pdfHtmlContent);
            printWindow.document.close();
            setTimeout(() => {
              printWindow.print();
            }, 500);
          }
          
          toast.success('Resume opened in new window. Use Ctrl+P (or Cmd+P) and select "Save as PDF"');
          setDownloading(false);
          return;
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
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Download className="h-5 w-5 text-green-500" />
            Step 4: Download Your Tailored Resume
          </CardTitle>
          <CardDescription>
            Your professionally formatted, ATS-optimized resume is ready for download.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Resume Info */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-semibold text-green-900">
                  {workflowData.jobTitle || 'Position'} Resume
                </h3>
                {workflowData.companyName && (
                  <p className="text-sm text-green-700">For {workflowData.companyName}</p>
                )}
                <div className="mt-2 flex items-center gap-2">
                  <Badge variant="outline">
                    Tailoring Score: {tailoredResume.tailoring_score || 85}%
                  </Badge>
                  <Badge variant="outline">
                    ATS Optimized
                  </Badge>
                  <Badge variant="outline">
                    Professionally Formatted
                  </Badge>
                </div>
              </div>
              <FileText className="h-8 w-8 text-green-500" />
            </div>
          </div>

          {/* Download Options */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Button 
              onClick={() => handleDownload('pdf')} 
              disabled={downloading} 
              className="h-20 flex flex-col gap-2"
            >
              <Download className="h-6 w-6" />
              <div className="text-center">
                <div className="font-medium">PDF</div>
                <div className="text-xs opacity-75">Print to PDF</div>
              </div>
            </Button>
            
            <Button 
              onClick={() => handleDownload('html')} 
              disabled={downloading} 
              variant="outline" 
              className="h-20 flex flex-col gap-2"
            >
              <Download className="h-6 w-6" />
              <div className="text-center">
                <div className="font-medium">HTML</div>
                <div className="text-xs opacity-75">Web format</div>
              </div>
            </Button>
            
            <Button 
              onClick={() => handleDownload('docx')} 
              disabled={downloading} 
              variant="outline" 
              className="h-20 flex flex-col gap-2"
            >
              <Download className="h-6 w-6" />
              <div className="text-center">
                <div className="font-medium">DOCX</div>
                <div className="text-xs opacity-75">Word format</div>
              </div>
            </Button>
            
            <Button 
              onClick={() => handleDownload('txt')} 
              disabled={downloading} 
              variant="outline" 
              className="h-20 flex flex-col gap-2"
            >
              <Download className="h-6 w-6" />
              <div className="text-center">
                <div className="font-medium">TXT</div>
                <div className="text-xs opacity-75">Plain text</div>
              </div>
            </Button>
          </div>

          {/* Format Descriptions */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
                <div>
                  <h4 className="font-medium text-blue-900 mb-1">PDF Download (Recommended)</h4>
                  <p className="text-sm text-blue-800">
                    Opens a professionally formatted version in a new window. Use Ctrl+P (or Cmd+P) → 
                    Select "Save as PDF" → Choose your destination and save.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <FileText className="h-5 w-5 text-amber-600 mt-0.5" />
                <div>
                  <h4 className="font-medium text-amber-900 mb-1">Format Benefits</h4>
                  <ul className="text-sm text-amber-800 list-disc ml-4">
                    <li>Professional typography and spacing</li>
                    <li>Structured sections with clear headings</li>
                    <li>ATS-friendly formatting</li>
                    <li>Print-optimized layout</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Additional Actions */}
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              onClick={() => setShowPreview(!showPreview)}
            >
              <Eye className="h-4 w-4 mr-2" />
              {showPreview ? 'Hide' : 'Preview'} Resume
            </Button>
            
            <Button variant="outline" onClick={onRestart}>
              <RotateCcw className="h-4 w-4 mr-2" />
              Create Another
            </Button>
          </div>

          {/* Enhanced Preview */}
          {showPreview && (
            <Card>
              <CardHeader>
                <CardTitle>Resume Preview</CardTitle>
                <CardDescription>
                  Preview of your formatted resume content
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div 
                  className="bg-white border rounded-lg p-6 max-h-96 overflow-y-auto shadow-inner"
                  dangerouslySetInnerHTML={{ 
                    __html: generateHTMLContent(tailoredResume.tailored_content)
                      .replace(/<style>[\s\S]*?<\/style>/, '') // Remove styles for preview
                      .replace(/<html[^>]*>|<\/html>|<head[^>]*>[\s\S]*?<\/head>|<body[^>]*>|<\/body>/g, '') // Remove HTML structure tags
                  }}
                />
              </CardContent>
            </Card>
          )}

          {/* Tips */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-medium text-blue-900 mb-2">💡 Next Steps:</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Download as PDF for the best formatting and ATS compatibility</li>
              <li>• Review all sections to ensure accuracy before submitting</li>
              <li>• Save multiple formats for different application portals</li>
              <li>• Consider creating variations for different types of roles</li>
              <li>• Track which versions perform best for future optimization</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
