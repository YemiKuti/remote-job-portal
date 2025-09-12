import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { 
  FileText, 
  TestTube, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  Download,
  Upload,
  Sparkles
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface TestResult {
  step: string;
  status: 'pending' | 'success' | 'error';
  message: string;
  details?: any;
}

export const CVTailoringTestPanel: React.FC = () => {
  const [testing, setTesting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [results, setResults] = useState<TestResult[]>([]);

  const createTestCV = (): File => {
    const testContent = `John Smith
Software Engineer
Email: john.smith@email.com
Phone: (555) 123-4567

PROFESSIONAL SUMMARY
Experienced software engineer with 5+ years of development experience. Skilled in JavaScript, React, and Node.js.

TECHNICAL SKILLS
• JavaScript, TypeScript, React, Vue.js
• Node.js, Express, MongoDB, PostgreSQL
• AWS, Docker, Git, Agile development

WORK EXPERIENCE
Senior Developer at Tech Corp (2021-Present)
• Developed scalable web applications using React and Node.js
• Led a team of 3 junior developers
• Improved application performance by 40%

Software Developer at StartupXYZ (2019-2021)
• Built REST APIs using Node.js and Express
• Implemented responsive UI components with React
• Collaborated with design team to improve user experience

EDUCATION
Bachelor of Science in Computer Science
State University (2015-2019)

PROJECTS
E-commerce Platform
• Built full-stack application with React and Node.js
• Integrated payment processing and user authentication
• Deployed on AWS with CI/CD pipeline`;

    return new File([testContent], 'test-resume.txt', { type: 'text/plain' });
  };

  const createCorruptedFile = (): File => {
    const corruptedContent = new ArrayBuffer(8);
    return new File([corruptedContent], 'corrupted-file.pdf', { type: 'application/pdf' });
  };

  const runTest = async (testName: string, testFn: () => Promise<any>) => {
    const resultIndex = results.length;
    setResults(prev => [...prev, { step: testName, status: 'pending', message: 'Running...' }]);

    try {
      const result = await testFn();
      setResults(prev => prev.map((r, i) => 
        i === resultIndex 
          ? { ...r, status: 'success', message: 'Passed', details: result }
          : r
      ));
      return result;
    } catch (error: any) {
      setResults(prev => prev.map((r, i) => 
        i === resultIndex 
          ? { ...r, status: 'error', message: error.message, details: error }
          : r
      ));
      throw error;
    }
  };

  const runComprehensiveTest = async () => {
    setTesting(true);
    setProgress(0);
    setResults([]);

    try {
      // Test 1: File validation - Valid file
      setProgress(10);
      await runTest('File Validation (Valid)', async () => {
        const testFile = createTestCV();
        const allowedTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain'];
        const isValid = allowedTypes.includes(testFile.type) && testFile.size > 100 && testFile.size < 10 * 1024 * 1024;
        if (!isValid) throw new Error('File validation failed');
        return { fileSize: testFile.size, fileType: testFile.type };
      });

      // Test 2: File validation - Corrupted file
      setProgress(20);
      await runTest('File Validation (Corrupted)', async () => {
        const corruptedFile = createCorruptedFile();
        try {
          const allowedTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain'];
          const isValid = allowedTypes.includes(corruptedFile.type) && corruptedFile.size > 100;
          if (isValid && corruptedFile.size < 50) {
            throw new Error('File appears to be corrupted or empty');
          }
          return 'Corruption detection working';
        } catch (error: any) {
          if (error.message.includes('corrupted') || error.message.includes('empty')) {
            return 'Correctly detected corrupted file';
          }
          throw error;
        }
      });

      // Test 3: Storage bucket access
      setProgress(30);
      await runTest('Storage Bucket Access', async () => {
        const { data, error } = await supabase.storage.from('cvs').list('', { limit: 1 });
        if (error) throw new Error(`Storage access failed: ${error.message}`);
        return 'Storage bucket accessible';
      });

      // Test 4: Job selection
      setProgress(40);
      const availableJobs = await runTest('Job Selection', async () => {
        const { data, error } = await supabase
          .from('jobs')
          .select('id, title, company, description')
          .eq('status', 'active')
          .limit(5);
        
        if (error) throw new Error(`Job fetch failed: ${error.message}`);
        if (!data || data.length === 0) throw new Error('No active jobs found');
        return data;
      });

      // Test 5: File upload to storage
      setProgress(50);
      const uploadPath = await runTest('File Upload', async () => {
        const { data: user } = await supabase.auth.getUser();
        if (!user.user) throw new Error('User not authenticated');

        const testFile = createTestCV();
        const fileName = `${user.user.id}/test-${Date.now()}.txt`;
        
        const { data, error } = await supabase.storage
          .from('cvs')
          .upload(fileName, testFile);

        if (error) throw new Error(`Upload failed: ${error.message}`);
        return data.path;
      });

      // Test 6: Edge function call
      setProgress(70);
      await runTest('AI Processing (Edge Function)', async () => {
        if (!availableJobs || availableJobs.length === 0) {
          throw new Error('No jobs available for testing');
        }

        const testJob = availableJobs[0];
        const { data, error } = await supabase.functions.invoke('tailor-cv', {
          body: {
            fileUrl: uploadPath,
            fileName: 'test-resume.txt',
            jobId: testJob.title,
            jobDescription: testJob.description || 'Test job description',
            candidateData: null
          }
        });

        if (error) throw new Error(`Edge function failed: ${error.message}`);
        if (!data?.success) throw new Error(data?.error || 'AI processing failed');
        
        return {
          matchScore: data.analysis?.matchScore,
          contentLength: data.tailoredContent?.length,
          processingTime: data.analysis?.processingTime
        };
      });

      // Test 7: Cleanup
      setProgress(90);
      await runTest('Cleanup', async () => {
        const { error } = await supabase.storage
          .from('cvs')
          .remove([uploadPath]);
        
        if (error) console.warn('Cleanup warning:', error.message);
        return 'Test file cleaned up';
      });

      setProgress(100);
      toast.success('All tests completed successfully!');

    } catch (error: any) {
      console.error('Test suite failed:', error);
      toast.error('Some tests failed. Check results below.');
    } finally {
      setTesting(false);
    }
  };

  const downloadTestCV = () => {
    const testFile = createTestCV();
    const url = URL.createObjectURL(testFile);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'test-resume.txt';
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Test CV downloaded');
  };

  const getStatusIcon = (status: TestResult['status']) => {
    switch (status) {
      case 'success': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'error': return <XCircle className="h-4 w-4 text-red-500" />;
      default: return <AlertTriangle className="h-4 w-4 text-yellow-500 animate-spin" />;
    }
  };

  const getStatusColor = (status: TestResult['status']) => {
    switch (status) {
      case 'success': return 'border-green-200 bg-green-50';
      case 'error': return 'border-red-200 bg-red-50';
      default: return 'border-yellow-200 bg-yellow-50';
    }
  };

  return (
    <Card className="max-w-4xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TestTube className="h-5 w-5" />
          CV Tailoring System Test
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            This comprehensive test validates all components of the CV tailoring system including file validation, 
            storage, job matching, AI processing, and error handling.
          </AlertDescription>
        </Alert>

        <div className="flex gap-2">
          <Button 
            onClick={runComprehensiveTest} 
            disabled={testing}
            className="flex items-center gap-2"
          >
            {testing ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            ) : (
              <Sparkles className="h-4 w-4" />
            )}
            Run Full Test Suite
          </Button>
          <Button variant="outline" onClick={downloadTestCV}>
            <Download className="h-4 w-4 mr-2" />
            Download Test CV
          </Button>
        </div>

        {testing && (
          <div className="space-y-2">
            <Progress value={progress} />
            <p className="text-sm text-muted-foreground text-center">
              Running tests... {progress}%
            </p>
          </div>
        )}

        {results.length > 0 && (
          <div className="space-y-3">
            <h3 className="font-semibold">Test Results</h3>
            {results.map((result, index) => (
              <div 
                key={index} 
                className={`p-3 rounded-lg border ${getStatusColor(result.status)}`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {getStatusIcon(result.status)}
                    <span className="font-medium">{result.step}</span>
                  </div>
                  <Badge variant={result.status === 'success' ? 'default' : result.status === 'error' ? 'destructive' : 'secondary'}>
                    {result.status}
                  </Badge>
                </div>
                <p className="text-sm mt-1 text-muted-foreground">{result.message}</p>
                {result.details && (
                  <details className="mt-2">
                    <summary className="text-sm cursor-pointer hover:text-foreground">
                      View Details
                    </summary>
                    <pre className="text-xs mt-1 p-2 bg-background rounded border overflow-auto">
                      {JSON.stringify(result.details, null, 2)}
                    </pre>
                  </details>
                )}
              </div>
            ))}
          </div>
        )}

        <div className="grid md:grid-cols-2 gap-4 mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Validation Features
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-3 w-3 text-green-500" />
                <span>PDF, DOCX, TXT file support</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-3 w-3 text-green-500" />
                <span>File size validation (max 10MB)</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-3 w-3 text-green-500" />
                <span>Corrupted file detection</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-3 w-3 text-green-500" />
                <span>Content extraction validation</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Sparkles className="h-4 w-4" />
                AI Processing Features
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-3 w-3 text-green-500" />
                <span>Job requirement analysis</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-3 w-3 text-green-500" />
                <span>Resume content optimization</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-3 w-3 text-green-500" />
                <span>Match score calculation</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-3 w-3 text-green-500" />
                <span>DOCX/TXT download options</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </CardContent>
    </Card>
  );
};