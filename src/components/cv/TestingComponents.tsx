import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FileText, CheckCircle2, AlertTriangle, Upload, Download } from 'lucide-react';

// Component for testing CV tailoring system
export const CVTailoringTestPanel = () => {
  const testScenarios = [
    {
      name: "Valid PDF Upload",
      description: "Upload a sample PDF resume and confirm it's stored in 'resumes' table",
      expected: "Resume uploaded, stored in Supabase with status 'uploaded'",
      status: "pending"
    },
    {
      name: "Valid DOCX Upload", 
      description: "Upload a sample DOCX resume and confirm processing",
      expected: "Resume uploaded and text extracted successfully",
      status: "pending"
    },
    {
      name: "Invalid File Upload",
      description: "Try uploading an unsupported file type (e.g., .jpg)",
      expected: "Error: 'Please upload a valid resume (PDF or DOCX)'",
      status: "pending"
    },
    {
      name: "Job Selection - Live Jobs",
      description: "Select a job from live jobs where status = 'active'",
      expected: "Job details populated correctly with title, description",
      status: "pending"
    },
    {
      name: "Job Selection - Custom Entry",
      description: "Enter custom job details manually",
      expected: "Custom job data accepted and processed",
      status: "pending"
    },
    {
      name: "AI Tailoring Process",
      description: "Complete CV tailoring with valid resume + job description",
      expected: "Tailored CV generated with match score and saved to database",
      status: "pending"
    },
    {
      name: "Error Handling - Corrupted File",
      description: "Upload corrupted or empty file",
      expected: "Error: 'Please upload a valid resume (PDF or DOCX)'",
      status: "pending"
    },
    {
      name: "Download Tailored CV",
      description: "Download generated tailored CV as PDF",
      expected: "PDF download initiated successfully",
      status: "pending"
    }
  ];

  const getStatusIcon = (status: string) => {
    switch(status) {
      case 'passed':
        return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case 'failed':
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      default:
        return <FileText className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'passed':
        return <Badge className="bg-green-100 text-green-800">Passed</Badge>;
      case 'failed':
        return <Badge variant="destructive">Failed</Badge>;
      default:
        return <Badge variant="secondary">Pending</Badge>;
    }
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="h-5 w-5" />
          CV Tailoring System - Integration Tests
        </CardTitle>
        <p className="text-sm text-gray-600">
          Complete these test scenarios to verify the enhanced CV tailoring functionality
        </p>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {testScenarios.map((scenario, index) => (
            <Card key={index} className="border">
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      {getStatusIcon(scenario.status)}
                      <h3 className="font-medium">{scenario.name}</h3>
                      {getStatusBadge(scenario.status)}
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{scenario.description}</p>
                    <p className="text-xs text-blue-600 bg-blue-50 p-2 rounded">
                      <strong>Expected:</strong> {scenario.expected}
                    </p>
                  </div>
                  <Button variant="outline" size="sm" className="ml-4">
                    Test
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <h4 className="font-medium mb-2 flex items-center gap-2">
            <Download className="h-4 w-4" />
            Test Files Available
          </h4>
          <div className="text-sm text-gray-600 space-y-1">
            <p>• <code>COMPREHENSIVE_FIX_TEST.csv</code> - Job upload test data</p>
            <p>• <code>SAMPLE_TEST_RESUME.txt</code> - Valid resume for testing</p>
            <p>• <code>test-job-description-sample.txt</code> - Job description sample</p>
            <p>• <code>CORRUPTED_TEST_FILE.txt</code> - Corrupted file for error testing</p>
          </div>
        </div>

        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h4 className="font-medium text-blue-900 mb-2">Testing Protocol</h4>
          <div className="text-sm text-blue-800 space-y-2">
            <p>1. <strong>Resume Upload:</strong> Test both valid (PDF/DOCX) and invalid files</p>
            <p>2. <strong>Job Selection:</strong> Test both live job selection and custom entry</p>
            <p>3. <strong>CV Tailoring:</strong> Verify AI processing and PDF generation</p>
            <p>4. <strong>Error Handling:</strong> Confirm proper error messages for edge cases</p>
            <p>5. <strong>Data Persistence:</strong> Check Supabase tables for correct data storage</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};