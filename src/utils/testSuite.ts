import { supabase } from '@/integrations/supabase/client';
import { testSupabaseConnectivity } from './supabaseHealth';

export interface TestResult {
  success: boolean;
  message: string;
  details?: any;
  error?: string;
}

export interface TestSuiteResults {
  connectivity: TestResult;
  cvTailoring: TestResult;
  jobUpload: TestResult;
}

// Test CV Tailoring with dummy data
export const testCVTailoring = async (): Promise<TestResult> => {
  try {
    console.log('🧪 Testing CV Tailoring Tool...');
    
    // Use dummy CV content from public/dummy_cv.txt
    const dummyCV = `John Doe
Email: john.doe@example.com
Phone: +1 234 567 8900

Work Experience:
- Frontend Developer at CodeLabs (2020–2023)
  Built responsive web applications using React and Tailwind.
- Intern at TechHub (2019)
  Assisted in testing and debugging software applications.

Education:
BSc Computer Science – University of London (2018)

Skills:
- JavaScript, React, Next.js
- Tailwind CSS
- Git/GitHub
- Problem solving and teamwork`;

    const dummyJobDescription = `Frontend Developer
TechSoft, London

We are looking for a skilled Frontend Developer to join our team.

Requirements:
- 3+ years of experience with React
- Strong JavaScript/TypeScript skills
- Experience with modern CSS frameworks
- Knowledge of Git version control
- Bachelor's degree in Computer Science or related field

Responsibilities:
- Develop user-facing features using React
- Collaborate with backend developers
- Ensure responsive design across devices
- Write clean, maintainable code
- Participate in code reviews`;

    // Test the edge function
    const { data, error } = await supabase.functions.invoke('tailor-cv', {
      body: {
        resumeContent: dummyCV,
        jobDescription: dummyJobDescription,
        jobTitle: 'Frontend Developer',
        companyName: 'TechSoft',
        candidateData: {
          personalInfo: {
            name: 'John Doe',
            email: 'john.doe@example.com'
          }
        }
      }
    });

    if (error) {
      console.error('❌ CV Tailoring failed:', error);
      return {
        success: false,
        message: 'CV Tailoring failed',
        error: error.message,
        details: error
      };
    }

    if (!data || !data.tailoredContent) {
      return {
        success: false,
        message: 'CV Tailoring returned empty result',
        error: 'No tailored content generated'
      };
    }

    console.log('✅ CV Tailoring successful:', {
      matchScore: data.matchScore,
      contentLength: data.tailoredContent?.length,
      processingTime: data.processingTime
    });

    // Validate the tailored CV format
    const isTailoredValid = data.tailoredContent.length > 100 && 
                           data.tailoredContent.includes('John Doe') &&
                           data.tailoredContent.includes('React');

    if (!isTailoredValid) {
      return {
        success: false,
        message: 'Tailored CV format is invalid',
        error: 'Generated CV does not meet ATS-friendly criteria',
        details: { contentPreview: data.tailoredContent?.substring(0, 200) }
      };
    }

    return {
      success: true,
      message: `CV Tailoring successful - Match Score: ${data.matchScore || 'N/A'}%`,
      details: {
        matchScore: data.matchScore,
        contentLength: data.tailoredContent.length,
        processingTime: data.processingTime,
        analysisIncluded: !!data.analysis,
        suggestionsIncluded: !!data.suggestions
      }
    };

  } catch (error: any) {
    console.error('❌ CV Tailoring test error:', error);
    return {
      success: false,
      message: 'CV Tailoring test failed with exception',
      error: error.message,
      details: error
    };
  }
};

// Test Job Upload with sample CSV data
export const testJobUpload = async (): Promise<TestResult> => {
  try {
    console.log('🧪 Testing Job Upload Automation...');
    
    // Simulate CSV data from public/jobs_test.csv
    const testJobData = [
      {
        title: 'Frontend Developer',
        description: 'Develop UI features\nCollaborate with backend team\nEnsure responsive design',
        company: 'TechSoft',
        location: 'London',
        email: 'hr@techsoft.com'
      },
      {
        title: 'Marketing Manager',
        description: 'Create marketing campaigns\nManage budgets\nOversee social media',
        company: 'MarketPro',
        location: 'Lagos',
        email: 'jobs@marketpro.com'
      }
    ];

    // Test job creation using admin function
    const results = [];
    
    for (const jobData of testJobData) {
      try {
        const { data: jobId, error } = await supabase.rpc('admin_create_job', {
          job_title: jobData.title,
          job_company: jobData.company,
          job_location: jobData.location,
          job_description: jobData.description,
          job_requirements: ['Communication skills', 'Team player'],
          job_employment_type: 'full-time',
          job_experience_level: 'mid',
          job_status: 'draft', // Should default to draft/pending, NOT active
          job_application_type: 'email',
          job_application_value: jobData.email,
          job_sponsored: false
        });

        if (error) {
          console.error(`❌ Failed to create job "${jobData.title}":`, error);
          results.push({ title: jobData.title, success: false, error: error.message });
        } else {
          console.log(`✅ Created job "${jobData.title}" with ID:`, jobId);
          results.push({ title: jobData.title, success: true, jobId, status: 'draft' });
        }
      } catch (err: any) {
        console.error(`❌ Exception creating job "${jobData.title}":`, err);
        results.push({ title: jobData.title, success: false, error: err.message });
      }
    }

    // Verify jobs were created with correct status
    const { data: jobs, error: fetchError } = await supabase
      .from('jobs')
      .select('id, title, company, status, application_type, application_value')
      .in('title', testJobData.map(j => j.title))
      .order('created_at', { ascending: false })
      .limit(10);

    if (fetchError) {
      console.error('❌ Failed to fetch created jobs:', fetchError);
      return {
        success: false,
        message: 'Failed to verify created jobs',
        error: fetchError.message,
        details: { creationResults: results }
      };
    }

    console.log('📊 Created jobs verification:', jobs);

    // Check job status and email mapping
    const statusCheck = jobs?.every(job => job.status === 'draft') ?? false;
    const emailCheck = jobs?.every(job => 
      job.application_type === 'email' && 
      job.application_value && 
      job.application_value !== 'Send Email'
    ) ?? false;

    const successfulCreations = results.filter(r => r.success).length;
    const allSuccessful = successfulCreations === testJobData.length;

    // Clean up test jobs
    if (jobs && jobs.length > 0) {
      const jobIds = jobs.map(j => j.id);
      await supabase.from('jobs').delete().in('id', jobIds);
      console.log('🧹 Cleaned up test jobs');
    }

    if (!allSuccessful) {
      return {
        success: false,
        message: `Job upload partially failed - ${successfulCreations}/${testJobData.length} jobs created`,
        details: {
          results,
          statusCheck,
          emailCheck,
          createdJobs: jobs
        }
      };
    }

    if (!statusCheck) {
      return {
        success: false,
        message: 'Jobs were created but with wrong status (should be draft/pending)',
        error: 'Jobs went live automatically instead of pending approval',
        details: {
          results,
          statusCheck: false,
          emailCheck,
          createdJobs: jobs
        }
      };
    }

    if (!emailCheck) {
      return {
        success: false,
        message: 'Jobs created but email mapping is incorrect',
        error: 'Email values not properly mapped or showing generic "Send Email"',
        details: {
          results,
          statusCheck,
          emailCheck: false,
          createdJobs: jobs
        }
      };
    }

    return {
      success: true,
      message: `Job upload successful - ${successfulCreations} jobs created with correct draft status and email mapping`,
      details: {
        results,
        statusCheck: true,
        emailCheck: true,
        createdJobs: jobs
      }
    };

  } catch (error: any) {
    console.error('❌ Job upload test error:', error);
    return {
      success: false,
      message: 'Job upload test failed with exception',
      error: error.message,
      details: error
    };
  }
};

// Run complete test suite
export const runTestSuite = async (): Promise<TestSuiteResults> => {
  console.log('🚀 Starting comprehensive test suite...');
  
  // Step 1: Test Supabase connectivity
  console.log('\n📋 Step 1: Testing Supabase connectivity...');
  const connectivityResult = await testSupabaseConnectivity();
  const connectivity: TestResult = {
    success: connectivityResult.success,
    message: connectivityResult.success 
      ? 'Supabase connectivity successful'
      : `Supabase connectivity failed: ${connectivityResult.steps.find(s => !s.success)?.message || 'Unknown error'}`,
    details: connectivityResult
  };

  // Step 2: Test CV Tailoring
  console.log('\n📋 Step 2: Testing CV Tailoring Tool...');
  const cvTailoring = await testCVTailoring();

  // Step 3: Test Job Upload
  console.log('\n📋 Step 3: Testing Job Upload Automation...');
  const jobUpload = await testJobUpload();

  const results: TestSuiteResults = {
    connectivity,
    cvTailoring,
    jobUpload
  };

  console.log('\n📊 TEST SUITE COMPLETE');
  console.log('='.repeat(50));
  console.log(`✅ Connectivity: ${connectivity.success ? 'PASS' : 'FAIL'} - ${connectivity.message}`);
  console.log(`✅ CV Tailoring: ${cvTailoring.success ? 'PASS' : 'FAIL'} - ${cvTailoring.message}`);
  console.log(`✅ Job Upload: ${jobUpload.success ? 'PASS' : 'FAIL'} - ${jobUpload.message}`);
  console.log('='.repeat(50));

  return results;
};