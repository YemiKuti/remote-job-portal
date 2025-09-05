// End-to-End CV Tailoring Test Suite
// Run this in browser console to test the complete workflow

const runE2ETests = async () => {
  console.log('🚀 Starting End-to-End CV Tailoring Tests...\n');
  
  const baseUrl = 'https://mmbrvcndxhipaoxysvwr.supabase.co/functions/v1/tailor-cv';
  
  // Test Candidate Profile
  const testCandidate = {
    personalInfo: {
      name: 'Sarah Martinez',
      email: 'sarah.martinez.test@example.com',
      phone: '(555) 123-4567',
      linkedin: 'linkedin.com/in/sarahmartinez',
      location: 'San Francisco, CA'
    },
    experience: [
      {
        title: 'Marketing Manager',
        company: 'TechStart Inc',
        duration: '2021-2024',
        description: 'Led digital marketing campaigns generating $2M+ revenue. Managed team of 5 marketing specialists, increased lead conversion by 45%, implemented SEO strategies improving organic traffic by 180%.'
      },
      {
        title: 'Marketing Coordinator', 
        company: 'Growth Solutions',
        duration: '2019-2021',
        description: 'Executed social media campaigns across platforms, managed content calendar, analyzed campaign performance using Google Analytics, collaborated with design team on creative assets.'
      },
      {
        title: 'Marketing Intern',
        company: 'Digital Dynamics',
        duration: '2018-2019', 
        description: 'Assisted with email marketing campaigns, conducted market research, created marketing materials, supported event planning and execution.'
      }
    ],
    education: [
      {
        degree: 'Bachelor of Science in Marketing',
        institution: 'University of California, Berkeley',
        year: '2019',
        gpa: '3.8'
      }
    ],
    skills: [
      'Digital Marketing', 'SEO/SEM', 'Google Analytics', 'Social Media Marketing',
      'Email Marketing', 'Content Creation', 'Project Management', 'Data Analysis',
      'Paid Advertising', 'Marketing Automation', 'Lead Generation', 'Brand Management'
    ]
  };

  // Sample CV Texts
  const sampleCVs = {
    marketing: `Sarah Martinez
Phone: (555) 123-4567 | Email: sarah.martinez.test@example.com | LinkedIn: linkedin.com/in/sarahmartinez | San Francisco, CA

PROFESSIONAL SUMMARY
Results-driven Marketing Manager with 5+ years of experience in digital marketing, lead generation, and team leadership. Proven track record of increasing revenue through strategic campaigns and data-driven decision making.

CORE COMPETENCIES
• Digital Marketing & SEO/SEM
• Google Analytics & Data Analysis  
• Social Media Marketing & Content Creation
• Email Marketing & Marketing Automation
• Project Management & Team Leadership
• Paid Advertising & Lead Generation

PROFESSIONAL EXPERIENCE

TechStart Inc | Marketing Manager | 2021-2024
• Led comprehensive digital marketing campaigns generating over $2M in revenue
• Managed and mentored team of 5 marketing specialists
• Increased lead conversion rates by 45% through optimization strategies
• Implemented SEO strategies that improved organic website traffic by 180%
• Developed and executed social media campaigns across multiple platforms
• Managed marketing budget of $500K+ with ROI tracking and optimization

Growth Solutions | Marketing Coordinator | 2019-2021
• Executed integrated social media campaigns resulting in 25% follower growth
• Managed content calendar and collaborated with design team on creative assets
• Analyzed campaign performance using Google Analytics and provided insights
• Assisted in lead nurturing campaigns that increased qualified leads by 30%
• Coordinated marketing events and webinars with average attendance of 200+

Digital Dynamics | Marketing Intern | 2018-2019
• Supported email marketing campaigns with 15% average open rate improvement
• Conducted market research and competitor analysis for strategic planning
• Created marketing materials including brochures, presentations, and web content
• Assisted with event planning and execution for trade shows and conferences

EDUCATION
Bachelor of Science in Marketing | University of California, Berkeley | 2019
GPA: 3.8/4.0 | Dean's List | Marketing Club President

CERTIFICATIONS
• Google Analytics Certified
• HubSpot Content Marketing Certified
• Facebook Blueprint Certified`,

    dataScience: `Sarah Martinez
Phone: (555) 123-4567 | Email: sarah.martinez.test@example.com | LinkedIn: linkedin.com/in/sarahmartinez | San Francisco, CA

PROFESSIONAL SUMMARY
Analytical marketing professional with strong quantitative background and 5+ years experience in data-driven marketing strategies. Expertise in statistical analysis, performance optimization, and marketing automation.

TECHNICAL SKILLS
• Data Analysis & Statistical Modeling
• Google Analytics & Marketing Analytics
• SQL & Database Management  
• Python & R for Marketing Analysis
• A/B Testing & Conversion Optimization
• Marketing Automation & CRM Systems

PROFESSIONAL EXPERIENCE

TechStart Inc | Marketing Manager | 2021-2024
• Analyzed customer data and behavior patterns to optimize marketing funnels
• Built predictive models for customer lifetime value and churn prediction
• Designed and executed A/B tests resulting in 45% conversion improvement
• Created automated reporting dashboards using Google Analytics and SQL
• Managed data-driven campaigns generating $2M+ revenue with detailed attribution
• Implemented marketing attribution models to optimize channel performance

Growth Solutions | Marketing Coordinator | 2019-2021  
• Developed customer segmentation strategies using statistical clustering methods
• Analyzed marketing campaign performance across channels using advanced analytics
• Created data visualization reports for executive team decision making
• Implemented marketing automation workflows based on customer behavior data
• Conducted cohort analysis and customer journey mapping

Digital Dynamics | Marketing Intern | 2018-2019
• Performed statistical analysis on customer survey data and market research
• Built Excel models for campaign ROI calculation and budget optimization  
• Assisted with database management and customer data hygiene initiatives
• Created performance tracking reports using pivot tables and data visualization

EDUCATION
Bachelor of Science in Marketing | University of California, Berkeley | 2019
Relevant Coursework: Statistics, Data Analysis, Consumer Research, Marketing Analytics

CERTIFICATIONS & TRAINING
• Google Analytics Individual Qualification (IQ)
• Google Tag Manager Certified
• SQL for Marketing Analytics (Coursera)
• Python for Data Analysis (edX)`,

    generic: `Sarah Martinez
sarah.martinez.test@example.com
(555) 123-4567

Experience:
Marketing Manager at TechStart Inc (2021-2024)
- Managed marketing campaigns
- Worked with team members  
- Increased company revenue
- Used various marketing tools
- Created marketing materials

Marketing Coordinator at Growth Solutions (2019-2021)
- Did social media marketing
- Made content for campaigns
- Looked at marketing data
- Helped with marketing projects
- Worked on marketing events

Marketing Intern at Digital Dynamics (2018-2019) 
- Helped marketing team
- Made presentations
- Did research projects
- Assisted with various tasks

Education:
Bachelor's degree in Marketing from UC Berkeley (2019)

Skills: 
Marketing, social media, email marketing, analytics, project management, teamwork, communication, Microsoft Office`
  };

  // Job Descriptions
  const jobDescriptions = {
    marketing: {
      title: 'Senior Digital Marketing Manager',
      company: 'InnovateNow Corp',
      description: `We are seeking a Senior Digital Marketing Manager to lead our digital marketing initiatives and drive customer acquisition growth.

Key Responsibilities:
• Develop and execute comprehensive digital marketing strategies
• Manage multi-channel campaigns including SEO, SEM, social media, and email
• Lead a team of marketing professionals and coordinate with cross-functional teams
• Analyze campaign performance and optimize for ROI and conversion rates  
• Manage marketing budgets and vendor relationships
• Stay current with digital marketing trends and emerging technologies

Required Qualifications:
• 5+ years of digital marketing experience with proven results
• Strong experience with Google Analytics, Google Ads, and marketing automation platforms
• Leadership experience managing marketing teams
• Proficiency in SEO/SEM, social media marketing, and email marketing
• Data-driven approach with strong analytical skills
• Bachelor's degree in Marketing, Business, or related field

Preferred Qualifications:
• Experience with marketing attribution and multi-touch attribution models
• Knowledge of HTML/CSS and basic web development
• Certifications in Google Analytics, Google Ads, or HubSpot
• Experience in B2B and B2C marketing environments
• Project management certification (PMP, Agile)

We offer competitive salary, comprehensive benefits, and opportunities for professional growth in a fast-paced, innovative environment.`
    },

    dataScience: {
      title: 'Marketing Data Analyst',
      company: 'DataDriven Marketing Solutions', 
      description: `Join our analytics team as a Marketing Data Analyst to drive data-informed marketing decisions and optimize campaign performance.

Key Responsibilities:
• Analyze marketing campaign performance across multiple channels and touchpoints
• Develop predictive models for customer behavior, lifetime value, and churn
• Design and implement A/B tests to optimize conversion rates and user experience
• Create automated reporting dashboards and data visualization tools
• Collaborate with marketing teams to translate business questions into analytical solutions
• Perform statistical analysis on customer data to identify trends and opportunities

Required Skills:
• 3+ years of experience in marketing analytics or data analysis
• Proficiency in SQL for database querying and data manipulation
• Experience with statistical analysis using Python, R, or similar tools
• Strong knowledge of Google Analytics, Google Tag Manager, and marketing analytics platforms
• Experience with A/B testing methodologies and statistical significance testing
• Familiarity with marketing attribution models and customer journey analysis

Technical Requirements:
• Advanced Excel skills including pivot tables, VLOOKUP, and statistical functions
• Experience with data visualization tools (Tableau, Power BI, or similar)
• Knowledge of marketing automation platforms (HubSpot, Marketo, Salesforce)
• Understanding of web analytics, conversion tracking, and digital marketing metrics
• Basic knowledge of HTML/CSS for tracking implementation

Preferred Qualifications:
• Bachelor's degree in Statistics, Mathematics, Economics, or related quantitative field
• Experience with machine learning algorithms for marketing applications
• Knowledge of customer segmentation and clustering techniques  
• Familiarity with marketing mix modeling and multi-touch attribution
• Experience with cloud platforms (AWS, Google Cloud, Azure) for data analysis`
    },

    generic: {
      title: 'Marketing Professional',
      company: 'ABC Company',
      description: `We are looking for a marketing professional to join our team.

Responsibilities:
• Work on marketing projects
• Help with marketing campaigns  
• Assist with marketing activities
• Support marketing team
• Do marketing tasks

Requirements:
• Marketing experience
• Good communication skills
• Team player
• Organized
• Motivated

This is a great opportunity to work in marketing.`
    }
  };

  const testResults = [];
  
  console.log('📋 Test Candidate Profile:');
  console.log(`Name: ${testCandidate.personalInfo.name}`);
  console.log(`Email: ${testCandidate.personalInfo.email}`);
  console.log(`Experience: ${testCandidate.experience.length} roles`);
  console.log(`Skills: ${testCandidate.skills.length} skills\n`);

  // Test Cases: CV + Job Description combinations
  const testCases = [
    {
      name: 'Marketing CV → Marketing Job',
      cvType: 'marketing',
      jobType: 'marketing',
      expectedScore: 85
    },
    {
      name: 'Data Science CV → Data Job', 
      cvType: 'dataScience',
      jobType: 'dataScience',
      expectedScore: 80
    },
    {
      name: 'Generic CV → Generic Job',
      cvType: 'generic', 
      jobType: 'generic',
      expectedScore: 70
    }
  ];

  // Run valid test cases
  for (const testCase of testCases) {
    console.log(`\n🧪 Running Test: ${testCase.name}`);
    console.log('='.repeat(50));
    
    const cv = sampleCVs[testCase.cvType];
    const job = jobDescriptions[testCase.jobType];
    
    console.log(`📄 CV Length: ${cv.length} characters`);
    console.log(`💼 Job: ${job.title} at ${job.company}`);
    console.log(`🎯 Expected Score: ${testCase.expectedScore}%+`);
    
    try {
      const startTime = Date.now();
      
      const response = await fetch(baseUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          resumeContent: cv,
          jobDescription: job.description,
          jobTitle: job.title,
          companyName: job.company,
          candidateData: testCandidate
        })
      });
      
      const duration = Date.now() - startTime;
      const result = await response.json();
      
      const testResult = {
        testName: testCase.name,
        status: response.status,
        success: response.ok,
        duration: `${duration}ms`,
        score: result.score,
        outputLength: result.tailoredResume?.length || 0,
        beforeCV: cv.substring(0, 200) + '...',
        afterCV: result.tailoredResume?.substring(0, 200) + '...' || 'No output',
        error: result.error,
        requestId: result.requestId
      };
      
      testResults.push(testResult);
      
      if (response.ok) {
        console.log(`✅ SUCCESS (${response.status}) - Duration: ${duration}ms`);
        console.log(`📊 Quality Score: ${result.score}% (Expected: ${testCase.expectedScore}%+)`);
        console.log(`📝 Output Length: ${result.tailoredResume.length} characters`);
        
        // Verify output structure
        const output = result.tailoredResume.toLowerCase();
        const hasContact = output.includes('phone') || output.includes('email');
        const hasSummary = output.includes('summary') || output.includes('profile');
        const hasExperience = output.includes('experience') || output.includes('work history');
        const hasSkills = output.includes('skills') || output.includes('competencies');
        const hasEducation = output.includes('education') || output.includes('degree');
        
        console.log(`📋 Structure Check:`);
        console.log(`   Contact Info: ${hasContact ? '✅' : '❌'}`);
        console.log(`   Summary: ${hasSummary ? '✅' : '❌'}`);
        console.log(`   Experience: ${hasExperience ? '✅' : '❌'}`);  
        console.log(`   Skills: ${hasSkills ? '✅' : '❌'}`);
        console.log(`   Education: ${hasEducation ? '✅' : '❌'}`);
        
        const structureScore = [hasContact, hasSummary, hasExperience, hasSkills, hasEducation].filter(Boolean).length;
        console.log(`   Structure Score: ${structureScore}/5 sections`);
        
        if (result.score >= testCase.expectedScore) {
          console.log(`🎯 PASS: Score meets expectations`);
        } else {
          console.log(`⚠️ WARN: Score below expected (${result.score}% < ${testCase.expectedScore}%)`);
        }
        
        // Show before/after comparison
        console.log(`\n📑 BEFORE/AFTER COMPARISON:`);
        console.log(`BEFORE: ${cv.substring(0, 150)}...`);
        console.log(`AFTER:  ${result.tailoredResume.substring(0, 150)}...`);
        
      } else {
        console.log(`❌ FAILED (${response.status}) - ${result.error}`);
      }
      
    } catch (error) {
      console.log(`💥 ERROR: ${error.message}`);
      testResults.push({
        testName: testCase.name,
        status: 'ERROR',
        success: false,
        error: error.message,
        beforeCV: cv.substring(0, 200) + '...',
        afterCV: 'Error - no output'
      });
    }
  }
  
  // Test error handling with malformed input
  console.log(`\n\n🚨 Testing Error Handling with Malformed Input`);
  console.log('=' .repeat(50));
  
  const malformedTests = [
    {
      name: 'Binary/Invalid Characters',
      cv: '���Invalid binary content��� with weird encoding \x00\x01\x02',
      job: 'Valid job description for testing error handling.',
      expectedStatus: 400
    },
    {
      name: 'Empty CV Content', 
      cv: '',
      job: 'Valid job description',
      expectedStatus: 400
    },
    {
      name: 'Extremely Long CV',
      cv: 'Very long content '.repeat(10000), // ~150KB
      job: 'Valid job description',
      expectedStatus: 400
    }
  ];
  
  for (const errorTest of malformedTests) {
    console.log(`\n🧪 Error Test: ${errorTest.name}`);
    
    try {
      const response = await fetch(baseUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          resumeContent: errorTest.cv,
          jobDescription: errorTest.job,
          jobTitle: 'Test Position',
          companyName: 'Test Company'
        })
      });
      
      const result = await response.json();
      
      if (response.status === errorTest.expectedStatus) {
        console.log(`✅ PASS: Correctly returned ${response.status} error`);
        console.log(`💬 Error Message: "${result.error}"`);
        
        // Check if error message is user-friendly
        const isUserFriendly = !result.error.includes('stack') && 
                              !result.error.includes('function') &&
                              result.error.length < 200;
        console.log(`📝 User-Friendly Error: ${isUserFriendly ? '✅' : '❌'}`);
        
      } else {
        console.log(`❌ FAIL: Expected ${errorTest.expectedStatus}, got ${response.status}`);
      }
      
      testResults.push({
        testName: `ERROR: ${errorTest.name}`,
        status: response.status,
        success: response.status === errorTest.expectedStatus,
        error: result.error,
        expectedStatus: errorTest.expectedStatus
      });
      
    } catch (error) {
      console.log(`💥 Unexpected Error: ${error.message}`);
      testResults.push({
        testName: `ERROR: ${errorTest.name}`,
        status: 'EXCEPTION',
        success: false,
        error: error.message
      });
    }
  }
  
  // Final Summary Report
  console.log('\n\n📊 FINAL TEST SUMMARY REPORT');
  console.log('=' .repeat(60));
  
  const validTests = testResults.filter(t => !t.testName.includes('ERROR'));
  const errorTests = testResults.filter(t => t.testName.includes('ERROR'));
  
  const passedValid = validTests.filter(t => t.success && t.score >= 70);
  const failedValid = validTests.filter(t => !t.success || (t.score && t.score < 70));
  
  const passedError = errorTests.filter(t => t.success);
  const failedError = errorTests.filter(t => !t.success);
  
  console.log(`\n📈 VALID TEST RESULTS:`);
  console.log(`Total Valid Tests: ${validTests.length}`);
  console.log(`Passed: ${passedValid.length} ✅`);
  console.log(`Failed: ${failedValid.length} ${failedValid.length > 0 ? '❌' : ''}`);
  
  console.log(`\n🚨 ERROR HANDLING RESULTS:`);
  console.log(`Total Error Tests: ${errorTests.length}`);  
  console.log(`Handled Correctly: ${passedError.length} ✅`);
  console.log(`Failed to Handle: ${failedError.length} ${failedError.length > 0 ? '❌' : ''}`);
  
  console.log(`\n📋 DETAILED RESULTS:`);
  testResults.forEach(result => {
    const status = result.success ? '✅' : '❌';
    const scoreInfo = result.score ? ` (Score: ${result.score}%)` : '';
    console.log(`${status} ${result.testName} (${result.status})${scoreInfo} ${result.duration || ''}`);
    if (result.error && !result.success) {
      console.log(`     Error: ${result.error}`);
    }
  });
  
  // Overall Pass/Fail
  const allValidPassed = validTests.every(t => t.success && (!t.score || t.score >= 70));
  const allErrorsPassed = errorTests.every(t => t.success);
  
  console.log(`\n🏁 OVERALL TEST STATUS:`);
  if (allValidPassed && allErrorsPassed) {
    console.log('🎉 ALL TESTS PASSED - CV Tailoring Tool is working correctly!');
  } else {
    console.log('⚠️ SOME TESTS FAILED - Review results above for issues');
  }
  
  console.log(`\n📋 ACCEPTANCE CRITERIA CHECK:`);
  console.log(`✓ All 3 valid cases produce polished CV: ${allValidPassed ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`✓ Malformed input triggers safe handling: ${allErrorsPassed ? '✅ PASS' : '❌ FAIL'}`);
  
  return testResults;
};

// Export test function for manual execution
window.runE2ETests = runE2ETests;

console.log('🧪 E2E Test Suite Loaded!');
console.log('📋 To run tests, execute: runE2ETests()');
console.log('\n📝 This will test:');
console.log('   • Marketing CV → Marketing Job');  
console.log('   • Data Science CV → Data Analytics Job');
console.log('   • Generic CV → Generic Job');
console.log('   • Error handling with malformed inputs');
console.log('   • Output structure and formatting validation');