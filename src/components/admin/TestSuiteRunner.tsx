import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { CheckCircle, XCircle, AlertCircle, Play, Loader2 } from 'lucide-react';
import { runTestSuite, type TestSuiteResults, type TestResult } from '@/utils/testSuite';
import { toast } from 'sonner';

export const TestSuiteRunner: React.FC = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [results, setResults] = useState<TestSuiteResults | null>(null);
  const [currentStep, setCurrentStep] = useState<string>('');
  const [progress, setProgress] = useState(0);

  const handleRunTests = async () => {
    setIsRunning(true);
    setResults(null);
    setProgress(0);
    
    try {
      // Simulate progress updates
      setCurrentStep('Testing Supabase connectivity...');
      setProgress(10);
      
      const testResults = await runTestSuite();
      
      setProgress(100);
      setCurrentStep('Tests completed');
      setResults(testResults);
      
      const allPassed = testResults.connectivity.success && 
                       testResults.cvTailoring.success && 
                       testResults.jobUpload.success;
      
      if (allPassed) {
        toast.success('All tests passed successfully!');
      } else {
        toast.error('Some tests failed. Check the results below.');
      }
      
    } catch (error: any) {
      console.error('Test suite error:', error);
      toast.error('Test suite failed to run: ' + error.message);
    } finally {
      setIsRunning(false);
      setCurrentStep('');
    }
  };

  const renderTestResult = (title: string, result: TestResult, icon: React.ReactNode) => (
    <Card className="mb-4">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between text-base">
          <div className="flex items-center gap-2">
            {icon}
            {title}
          </div>
          <Badge variant={result.success ? "default" : "destructive"}>
            {result.success ? "PASS" : "FAIL"}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <p className="text-sm mb-2">{result.message}</p>
        
        {result.error && (
          <Alert variant="destructive" className="mb-3">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <strong>Error:</strong> {result.error}
            </AlertDescription>
          </Alert>
        )}
        
        {result.details && (
          <details className="text-xs bg-gray-50 p-2 rounded">
            <summary className="cursor-pointer font-medium">Technical Details</summary>
            <pre className="mt-2 whitespace-pre-wrap">
              {JSON.stringify(result.details, null, 2)}
            </pre>
          </details>
        )}
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Play className="h-5 w-5" />
            System Test Suite
          </CardTitle>
          <CardDescription>
            Comprehensive testing of Supabase connectivity, CV tailoring, and job upload automation
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Button 
              onClick={handleRunTests}
              disabled={isRunning}
              className="flex items-center gap-2"
            >
              {isRunning ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Play className="h-4 w-4" />
              )}
              {isRunning ? 'Running Tests...' : 'Run Test Suite'}
            </Button>
            
            {isRunning && (
              <div className="space-y-2">
                <Progress value={progress} className="w-full" />
                <p className="text-sm text-gray-600">{currentStep}</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {results && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Test Results</h3>
          
          {renderTestResult(
            'Supabase Connectivity',
            results.connectivity,
            results.connectivity.success ? (
              <CheckCircle className="h-5 w-5 text-green-500" />
            ) : (
              <XCircle className="h-5 w-5 text-red-500" />
            )
          )}
          
          {renderTestResult(
            'CV Tailoring Tool',
            results.cvTailoring,
            results.cvTailoring.success ? (
              <CheckCircle className="h-5 w-5 text-green-500" />
            ) : (
              <XCircle className="h-5 w-5 text-red-500" />
            )
          )}
          
          {renderTestResult(
            'Job Upload Automation',
            results.jobUpload,
            results.jobUpload.success ? (
              <CheckCircle className="h-5 w-5 text-green-500" />
            ) : (
              <XCircle className="h-5 w-5 text-red-500" />
            )
          )}
          
          <Card className="border-l-4 border-l-blue-500">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Summary</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-green-600">
                    {[results.connectivity, results.cvTailoring, results.jobUpload]
                      .filter(r => r.success).length}
                  </div>
                  <div className="text-sm text-gray-600">Tests Passed</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-red-600">
                    {[results.connectivity, results.cvTailoring, results.jobUpload]
                      .filter(r => !r.success).length}
                  </div>
                  <div className="text-sm text-gray-600">Tests Failed</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-blue-600">
                    {Math.round(([results.connectivity, results.cvTailoring, results.jobUpload]
                      .filter(r => r.success).length / 3) * 100)}%
                  </div>
                  <div className="text-sm text-gray-600">Success Rate</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};