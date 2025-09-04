import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, Check, X, AlertTriangle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

// Demo CSV samples for testing
const cleanCSVSample = [
  {
    'Job Title': 'Senior Software Engineer',
    'Company': 'TechCorp Inc',
    'Location': 'San Francisco, CA',
    'Description': 'We are seeking a Senior Software Engineer to join our dynamic team. You will be responsible for designing and implementing scalable software solutions, mentoring junior developers, and collaborating with cross-functional teams to deliver high-quality products.',
    'Employment Type': 'Full-time',
    'Experience Level': 'Senior',
    'Salary Min': '120000',
    'Salary Max': '180000',
    'Tech Stack': 'React, Node.js, PostgreSQL',
    'Remote': 'true',
    'Application Email': 'careers@techcorp.com'
  },
  {
    'Job Title': 'Product Manager',
    'Company': 'InnovateLabs',
    'Location': 'New York, NY',
    'Description': 'Join our product team to drive strategy and execution for our flagship products. You will work closely with engineering, design, and marketing teams to define product roadmaps and ensure successful product launches.',
    'Employment Type': 'Full-time',
    'Experience Level': 'Mid',
    'Salary Min': '100000',
    'Salary Max': '140000',
    'Remote': 'false',
    'Application Email': 'jobs@innovatelabs.com'
  }
];

const messyCSVSample = [
  {
    'Job Title': 'Data Scientist',
    'Company': 'DataCorp',
    'Location': 'Austin, TX',
    'Description': 'Looking for a data scientist with machine learning expertise. This is a very long description that goes on and on about the requirements and responsibilities. It includes detailed technical requirements, team structure information, company culture details, benefits information, and much more content that might need to be truncated for proper display and database storage limits.',
    'Employment Type': 'Full-time',
    'Experience Level': 'Senior',
    'Application Email': 'careers@datacorp.com'
  },
  {
    'Job Title': '', // Missing title - should be invalid
    'Company': 'EmptyTech',
    'Location': 'Remote',
    'Description': 'Some description',
    'Employment Type': 'Contract',
    'Experience Level': 'Junior'
  },
  {
    'Job Title': 'Senior Software Engineer', // Duplicate
    'Company': 'TechCorp Inc',
    'Location': 'San Francisco, CA',
    'Description': 'Another description for the same position',
    'Employment Type': 'Full-time',
    'Experience Level': 'Senior',
    'Application Email': 'careers@techcorp.com'
  },
  {
    'Job Title': 'Marketing Specialist',
    'Company': 'MarketingPro',
    'Location': 'Los Angeles, CA',
    'Description': 'Marketing role with creative focus',
    'Employment Type': 'Invalid-Type', // Invalid employment type
    'Experience Level': 'Mid',
    'Application Email': 'invalid-email' // Invalid email format
  }
];

const generateCSVContent = (data: any[]): string => {
  if (data.length === 0) return '';
  
  const headers = Object.keys(data[0]);
  const csvRows = [
    headers.join(','),
    ...data.map(row => 
      headers.map(header => {
        const value = row[header] || '';
        // Escape commas and quotes
        if (value.includes(',') || value.includes('"') || value.includes('\n')) {
          return `"${value.replace(/"/g, '""')}"`;
        }
        return value;
      }).join(',')
    )
  ];
  
  return csvRows.join('\n');
};

const downloadCSV = (filename: string, content: string) => {
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

export const DemoCSVSamples = () => {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Clean Sample */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Check className="h-5 w-5 text-green-600" />
              Clean CSV Sample
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Perfect CSV with all required fields, proper formatting, and no errors.
            </p>
            
            <div className="space-y-2">
              <Badge variant="outline" className="text-green-600">2 Valid Jobs</Badge>
              <Badge variant="outline" className="text-gray-600">0 Errors</Badge>
              <Badge variant="outline" className="text-gray-600">0 Duplicates</Badge>
            </div>
            
            <div className="text-xs space-y-1">
              <p>✓ Senior Software Engineer - TechCorp Inc</p>
              <p>✓ Product Manager - InnovateLabs</p>
            </div>
            
            <Button 
              onClick={() => downloadCSV('clean-jobs-sample.csv', generateCSVContent(cleanCSVSample))}
              className="w-full"
              variant="outline"
            >
              <Download className="h-4 w-4 mr-2" />
              Download Clean Sample
            </Button>
          </CardContent>
        </Card>

        {/* Messy Sample */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-yellow-600" />
              Messy CSV Sample
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              CSV with various errors and edge cases to test system robustness.
            </p>
            
            <div className="space-y-2">
              <Badge variant="outline" className="text-green-600">1 Valid Job</Badge>
              <Badge variant="destructive">2 Invalid Jobs</Badge>
              <Badge variant="secondary">1 Duplicate</Badge>
            </div>
            
            <div className="text-xs space-y-1">
              <p className="flex items-center gap-1">
                <Check className="h-3 w-3 text-green-600" />
                Data Scientist - DataCorp
              </p>
              <p className="flex items-center gap-1">
                <X className="h-3 w-3 text-red-600" />
                Empty Title - EmptyTech
              </p>
              <p className="flex items-center gap-1">
                <AlertTriangle className="h-3 w-3 text-yellow-600" />
                Duplicate - TechCorp Inc
              </p>
              <p className="flex items-center gap-1">
                <X className="h-3 w-3 text-red-600" />
                Invalid Type - MarketingPro
              </p>
            </div>
            
            <Button 
              onClick={() => downloadCSV('messy-jobs-sample.csv', generateCSVContent(messyCSVSample))}
              className="w-full"
              variant="outline"
            >
              <Download className="h-4 w-4 mr-2" />
              Download Messy Sample
            </Button>
          </CardContent>
        </Card>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Testing Instructions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium mb-2">Expected Results - Clean Sample:</h4>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>• 2 jobs processed successfully</li>
                <li>• All validations pass</li>
                <li>• Jobs appear correctly on job board</li>
                <li>• Upload completes within 5 seconds</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-medium mb-2">Expected Results - Messy Sample:</h4>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>• 1 job uploaded, 3 skipped</li>
                <li>• Clear error messages for invalid entries</li>
                <li>• Duplicate detection works correctly</li>
                <li>• Long description gets truncated</li>
              </ul>
            </div>
          </div>
          
          <div className="mt-4 p-4 bg-blue-50 rounded-lg">
            <h4 className="font-medium mb-2">Error Handling Test Cases:</h4>
            <ul className="text-sm space-y-1">
              <li>✓ Missing required fields (Job Title)</li>
              <li>✓ Invalid employment type format</li>
              <li>✓ Invalid email format in application field</li>
              <li>✓ Duplicate job detection (Title + Company + Location)</li>
              <li>✓ Long description truncation (2000+ characters)</li>
              <li>✓ Empty rows and malformed data</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};