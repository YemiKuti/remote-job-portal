// Test script for CV Tailoring Edge Function
// Run this in browser console to test all scenarios

const testCVTailoring = async () => {
  console.log('🧪 Starting CV Tailoring Edge Function Tests...\n');
  
  const baseUrl = 'https://mmbrvcndxhipaoxysvwr.supabase.co/functions/v1/tailor-cv';
  
  // Test Case A: Well-formed CV + Job Description
  const testA = {
    name: 'Test A: Well-formed CV + Job Description',
    data: {
      resumeContent: `John Smith
Phone: (555) 123-4567 | Email: john.smith@email.com | LinkedIn: linkedin.com/in/johnsmith | New York, NY

PROFESSIONAL SUMMARY
Experienced Software Engineer with 5+ years developing scalable web applications using JavaScript, React, and Node.js. Proven track record of delivering high-quality solutions that improve user experience and increase system performance by up to 40%.

CORE COMPETENCIES
• JavaScript, TypeScript, React, Node.js
• Python, Django, Flask
• PostgreSQL, MongoDB, Redis
• AWS, Docker, Kubernetes
• Git, CI/CD, Agile methodologies
• Problem solving and team leadership

PROFESSIONAL EXPERIENCE

Tech Solutions Inc. | Senior Software Engineer | 2021-2024
• Developed and maintained React-based web applications serving 100,000+ daily users
• Implemented RESTful APIs using Node.js and Express, improving response times by 35%
• Led a team of 4 junior developers in building a customer management system
• Reduced application load times by 40% through code optimization and caching strategies
• Collaborated with product managers and UX designers in an Agile environment

StartupXYZ | Software Developer | 2019-2021
• Built responsive web applications using React and Redux
• Designed and implemented database schemas for PostgreSQL
• Participated in code reviews and mentored new team members
• Contributed to open-source projects and internal documentation

EDUCATION
Bachelor of Science in Computer Science | State University | 2019
Relevant Coursework: Data Structures, Algorithms, Software Engineering, Database Systems`,
      
      jobDescription: `We are seeking a Senior Frontend Developer to join our growing engineering team. You'll be responsible for building user-facing features and improving our web application's performance.

Required Skills:
• 3+ years of experience with React and JavaScript
• Strong knowledge of HTML, CSS, and modern frontend build tools
• Experience with state management (Redux, Context API)
• Familiarity with RESTful APIs and asynchronous programming
• Git version control and collaborative development

Preferred Qualifications:
• TypeScript experience
• Experience with Node.js
• Knowledge of performance optimization techniques
• Agile/Scrum methodology experience
• Bachelor's degree in Computer Science or related field

Responsibilities:
• Develop and maintain React-based web applications
• Collaborate with designers and backend developers
• Optimize application performance and user experience
• Participate in code reviews and technical discussions
• Mentor junior developers and contribute to team growth`,
      
      jobTitle: 'Senior Frontend Developer',
      companyName: 'Tech Innovation Co',
      candidateData: {
        personalInfo: {
          name: 'John Smith',
          email: 'john.smith@email.com',
          phone: '(555) 123-4567'
        }
      }
    }
  };
  
  // Test Case B: Messy text CV (no bullets, poor formatting)
  const testB = {
    name: 'Test B: Messy text CV (no bullets, poor formatting)',
    data: {
      resumeContent: `sarah johnson email sarahjohnson@gmail.com phone 555-987-6543
      
marketing professional with experience in digital marketing worked at various companies have done social media marketing email campaigns and content creation also worked on seo and google ads campaigns managed budgets and teams
      
experience at marketing agency inc worked as marketing coordinator from 2020 to 2023 did social media posts email marketing campaigns managed google ads budget of 50000 dollars increased website traffic by 60 percent worked with design team created content calendars managed client relationships

before that worked at retail company as marketing assistant 2018 to 2020 helped with promotional campaigns assisted with event planning created marketing materials helped increase sales by 25 percent

education bachelor of arts in marketing from city college 2018 took classes in consumer behavior digital marketing advertising principles market research statistics

skills social media marketing facebook instagram linkedin twitter email marketing mailchimp constant contact seo google analytics google ads content creation copywriting project management excel powerpoint photoshop`,
      
      jobDescription: `We're looking for a Digital Marketing Specialist to develop and execute comprehensive digital marketing strategies. You'll manage our social media presence, email campaigns, and paid advertising initiatives.

Key Requirements:
- 2+ years of digital marketing experience
- Proficiency with social media platforms and management tools
- Experience with email marketing platforms (Mailchimp, HubSpot, etc.)
- Google Ads and Facebook Ads experience
- Strong analytical skills and experience with Google Analytics
- Content creation and copywriting abilities
- Project management and organizational skills

Preferred:
- Bachelor's degree in Marketing or related field
- SEO/SEM knowledge
- Experience with marketing automation
- Graphic design skills (Photoshop, Canva)
- HubSpot certification

Responsibilities:
- Develop and implement social media strategies
- Create and manage email marketing campaigns
- Optimize paid advertising campaigns (Google, Facebook, LinkedIn)
- Analyze campaign performance and generate reports
- Collaborate with design team on creative assets`,
      
      jobTitle: 'Digital Marketing Specialist',
      companyName: 'Growth Marketing Agency',
      candidateData: {
        personalInfo: {
          name: 'Sarah Johnson',
          email: 'sarahjohnson@gmail.com',
          phone: '555-987-6543'
        }
      }
    }
  };
  
  // Test Case C: Very large CV (exceeding limits)
  const testC = {
    name: 'Test C: Very large CV (exceeding size limits)',
    data: {
      resumeContent: 'Large CV Content '.repeat(5000), // ~75,000 characters
      jobDescription: 'Software Engineer position requiring extensive experience...',
      jobTitle: 'Software Engineer',
      companyName: 'Tech Corp',
      candidateData: {}
    }
  };
  
  // Test Case D: Invalid/Missing data
  const testD = {
    name: 'Test D: Invalid/Missing data',
    data: {
      // Missing resumeContent
      jobDescription: 'Test job description',
      jobTitle: 'Test Position',
      companyName: 'Test Company'
    }
  };
  
  const testCases = [testA, testB, testC, testD];
  const results = [];
  
  for (const testCase of testCases) {
    console.log(`\n🔍 Running ${testCase.name}...`);
    
    try {
      const startTime = Date.now();
      const response = await fetch(baseUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${window.supabase?.supabaseKey || 'test'}`
        },
        body: JSON.stringify(testCase.data)
      });
      
      const duration = Date.now() - startTime;
      const responseData = await response.json();
      
      const result = {
        testName: testCase.name,
        status: response.status,
        success: response.ok,
        duration: `${duration}ms`,
        responseSize: JSON.stringify(responseData).length,
        hasContent: !!responseData.tailoredResume,
        score: responseData.score,
        error: responseData.error,
        requestId: responseData.requestId
      };
      
      results.push(result);
      
      if (response.ok) {
        console.log(`✅ SUCCESS (${response.status}) - Duration: ${duration}ms`);
        if (responseData.tailoredResume) {
          console.log(`   📄 Generated resume: ${responseData.tailoredResume.length} chars`);
          console.log(`   📊 Quality score: ${responseData.score}%`);
        }
      } else {
        console.log(`❌ FAILED (${response.status}) - ${responseData.error}`);
        if (responseData.requestId) {
          console.log(`   🔍 Request ID: ${responseData.requestId}`);
        }
      }
      
    } catch (error) {
      console.log(`💥 ERROR: ${error.message}`);
      results.push({
        testName: testCase.name,
        status: 'ERROR',
        success: false,
        error: error.message
      });
    }
  }
  
  // Summary report
  console.log('\n📋 TEST SUMMARY REPORT');
  console.log('========================');
  
  const successful = results.filter(r => r.success);
  const failed = results.filter(r => !r.success);
  
  console.log(`Total Tests: ${results.length}`);
  console.log(`Successful: ${successful.length}`);
  console.log(`Failed: ${failed.length}`);
  
  console.log('\nDetailed Results:');
  results.forEach(result => {
    const status = result.success ? '✅' : '❌';
    console.log(`${status} ${result.testName} (${result.status}) ${result.duration || ''}`);
    if (result.error) {
      console.log(`     Error: ${result.error}`);
    }
    if (result.score) {
      console.log(`     Quality Score: ${result.score}%`);
    }
  });
  
  // Expected results validation
  console.log('\n🎯 EXPECTED RESULTS VALIDATION:');
  console.log('Test A (well-formed): Should return 200 with tailored resume');
  console.log('Test B (messy): Should return 200 with tailored resume'); 
  console.log('Test C (too large): Should return 400 with size limit error');
  console.log('Test D (missing data): Should return 400 with validation error');
  
  return results;
};

// Run the tests
console.log('🚀 To run CV Tailoring tests, execute: testCVTailoring()');

// Auto-run if this script is executed directly
if (typeof window !== 'undefined') {
  // Run tests after a short delay to allow console to be ready
  setTimeout(() => {
    testCVTailoring().then(results => {
      console.log('\n🏁 All tests completed!');
      console.log('Results stored in:', results);
    });
  }, 1000);
}