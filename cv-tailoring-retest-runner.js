/**
 * CV Tailoring Retest Runner
 * Comprehensive validation against the 6 criteria specified
 */

const runCVTailoringRetest = async () => {
  console.log('🧪 Running CV Tailoring Retest Validation...');
  
  const results = {
    structurePreservation: 'UNKNOWN',
    candidateDetails: 'UNKNOWN',
    contentQuality: 'UNKNOWN',
    jobSpecificEnhancements: 'UNKNOWN',
    tailoringScore: 'UNKNOWN',
    exportValidation: 'UNKNOWN'
  };

  try {
    // Test CV content (Yemi Kuti example as requested)
    const testResumeContent = `YEMI OKUNOLA KUTI
yemi.kuti@email.com | (555) 123-4567 | LinkedIn: linkedin.com/in/yemikuti | San Francisco, CA

PROFESSIONAL SUMMARY
Creative UX Designer with 4+ years of experience designing user-centered digital products. Specialized in conducting user research, creating wireframes, and building interactive prototypes. Proven track record of improving user engagement by 35% through data-driven design solutions.

EDUCATION
Bachelor of Fine Arts in Design - University of California, San Francisco | 2019
Relevant Coursework: Human-Computer Interaction, Visual Communication, Typography, Design Psychology

PROFESSIONAL EXPERIENCE

UX Designer | TechStartup Inc. | 2021 - Present
• Designed mobile and web interfaces for fintech application serving 50,000+ users
• Conducted 25+ user interviews and usability tests to inform design decisions
• Created design systems and component libraries reducing development time by 30%
• Collaborated with product managers and engineers in agile development cycles
• Increased user retention by 40% through onboarding flow redesign

Junior UX Designer | DesignStudio Agency | 2020 - 2021
• Assisted in designing websites and mobile apps for 15+ client projects
• Created wireframes, mockups, and interactive prototypes using Figma and Sketch
• Participated in client presentations and design review meetings
• Developed style guides and design documentation for development teams

Design Intern | Creative Lab | Summer 2019
• Supported senior designers on branding and digital design projects
• Created social media graphics and marketing materials
• Assisted with user research and competitive analysis

SKILLS
Design Tools: Figma, Sketch, Adobe Creative Suite, InVision, Principle, Framer
Research Methods: User interviews, Usability testing, A/B testing, Surveys, Card sorting
Technical: HTML, CSS, Basic JavaScript, Responsive design, Design systems
Soft Skills: Communication, Collaboration, Problem-solving, Analytical thinking

CERTIFICATIONS
• Google UX Design Certificate - 2020
• Nielsen Norman Group UX Certification - 2021

PROJECTS
EcoTracker Mobile App (Personal Project)
• Designed sustainability tracking app with 95% user satisfaction in beta testing
• Conducted user research with 50+ participants to validate concept
• Created complete design system and high-fidelity prototypes`;

    const testJobDescription = `UX Designer - Creative Studio Pro

We are looking for a talented UX Designer to create amazing user experiences for our digital products. The ideal candidate should have a strong portfolio demonstrating user-centered design principles.

KEY RESPONSIBILITIES:
• Design intuitive user interfaces for web and mobile applications
• Conduct user research including interviews, surveys, and usability testing
• Create wireframes, prototypes, and high-fidelity mockups
• Collaborate with product managers, developers, and stakeholders
• Develop and maintain design systems and style guides
• Analyze user behavior data to inform design decisions
• Present design concepts and rationale to clients and team members
• Stay current with industry trends and best practices

REQUIRED QUALIFICATIONS:
• 3+ years of UX design experience
• Bachelor's degree in Design, HCI, or related field
• Proficiency in Figma, Sketch, Adobe Creative Suite
• Experience with prototyping tools (InVision, Principle, Framer)
• Strong understanding of user research methodologies
• Knowledge of HTML, CSS, and responsive design principles
• Excellent communication and presentation skills
• Portfolio showcasing end-to-end design process`;

    console.log('📤 Calling tailor-cv function...');

    // Create a FormData object to simulate file upload
    const formData = new FormData();
    
    // Create a text file blob from the resume content
    const resumeBlob = new Blob([testResumeContent], { type: 'text/plain' });
    formData.append('file', resumeBlob, 'yemi-kuti-cv.txt');
    formData.append('jobDescription', testJobDescription);
    formData.append('jobTitle', 'UX Designer');
    formData.append('companyName', 'Creative Studio Pro');
    formData.append('userId', 'test-user-validation');

    // Call the edge function with multipart/form-data
    const response = await fetch('https://mmbrvcndxhipaoxysvwr.supabase.co/functions/v1/tailor-cv', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${window.supabase?.supabaseKey || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1tYnJ2Y25keGhpcGFveHlzdndyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDYyNzE2NDcsImV4cCI6MjA2MTg0NzY0N30.VWBmdbI7lMzHaaXl6ASJnc2116YnHm0WLHE0bkfW870'}`
      },
      body: formData
    });

    console.log('📥 Response status:', response.status);
    const responseData = await response.json();
    console.log('📥 Response data:', responseData);

    if (!responseData.success) {
      console.error('❌ Function returned error:', responseData.error);
      throw new Error(responseData.error || 'Unknown error from function');
    }

    const tailoredContent = responseData.tailoredResume || responseData.tailoredContent;
    const score = responseData.score || 0;
    const downloadUrl = responseData.downloadUrl;

    console.log(`📄 Tailored content length: ${tailoredContent?.length || 0} characters`);
    console.log(`⭐ Tailoring score: ${score}`);

    // TEST 1: Structure Preservation
    console.log('\n🔍 TEST 1: Structure Preservation');
    const hasExperienceSection = tailoredContent.includes('EXPERIENCE') || tailoredContent.includes('PROFESSIONAL EXPERIENCE');
    const hasEducationSection = tailoredContent.includes('EDUCATION');
    const hasSkillsSection = tailoredContent.includes('SKILLS');
    const hasSummarySection = tailoredContent.includes('SUMMARY') || tailoredContent.includes('PROFESSIONAL SUMMARY');
    
    if (hasExperienceSection && hasEducationSection && hasSkillsSection && hasSummarySection) {
      results.structurePreservation = 'PASS';
      console.log('✅ PASS - All original sections preserved');
    } else {
      results.structurePreservation = 'FAIL';
      console.log('❌ FAIL - Missing sections:', {
        experience: hasExperienceSection,
        education: hasEducationSection,
        skills: hasSkillsSection,
        summary: hasSummarySection
      });
    }

    // TEST 2: Candidate Details
    console.log('\n🔍 TEST 2: Candidate Details');
    const hasRealName = tailoredContent.includes('YEMI') && tailoredContent.includes('KUTI');
    const hasRealEmail = tailoredContent.includes('yemi.kuti@email.com');
    const hasRealPhone = tailoredContent.includes('(555) 123-4567');
    const hasRealLinkedIn = tailoredContent.includes('linkedin.com/in/yemikuti');
    const noPlaceholders = !tailoredContent.includes('Available upon request') && 
                          !tailoredContent.includes('[Contact Information]') &&
                          !tailoredContent.includes('Contact Information Available Upon Request');
    
    if (hasRealName && hasRealEmail && hasRealPhone && hasRealLinkedIn && noPlaceholders) {
      results.candidateDetails = 'PASS';
      console.log('✅ PASS - Real contact info preserved');
    } else {
      results.candidateDetails = 'FAIL';
      console.log('❌ FAIL - Contact info issues:', {
        name: hasRealName,
        email: hasRealEmail,
        phone: hasRealPhone,
        linkedin: hasRealLinkedIn,
        noPlaceholders: noPlaceholders
      });
    }

    // TEST 3: Content Quality
    console.log('\n🔍 TEST 3: Content Quality');
    const hasCompleteSentences = !tailoredContent.includes('Proven expertise in ') && 
                                !tailoredContent.includes('...') && 
                                !tailoredContent.includes('and…');
    const hasReasonableLength = tailoredContent.length > 800;
    const hasProperFormatting = tailoredContent.includes('\n') && /•/.test(tailoredContent);
    const hasActionVerbs = /\b(Led|Delivered|Built|Owned|Designed|Implemented|Developed|Improved|Optimized|Automated|Managed|Coordinated|Launched|Reduced|Increased|Streamlined|Enhanced|Created|Architected|Deployed|Analyzed|Refactored|Mentored|Facilitated)\b/.test(tailoredContent);
    
    if (hasCompleteSentences && hasReasonableLength && hasProperFormatting && hasActionVerbs) {
      results.contentQuality = 'PASS';
      console.log('✅ PASS - Well-formatted, complete content with action verbs');
    } else {
      results.contentQuality = 'FAIL';
      console.log('❌ FAIL - Content quality issues:', {
        completeSentences: hasCompleteSentences,
        reasonableLength: hasReasonableLength,
        properFormatting: hasProperFormatting,
        actionVerbs: hasActionVerbs
      });
    }

    // TEST 4: Job-Specific Enhancements
    console.log('\n🔍 TEST 4: Job-Specific Enhancements');
    const lowerContent = tailoredContent.toLowerCase();
    const hasWireframing = lowerContent.includes('wireframe') || lowerContent.includes('wireframing');
    const hasUsabilityTesting = lowerContent.includes('usability testing') || lowerContent.includes('usability test');
    const hasFigma = lowerContent.includes('figma');
    const hasUserResearch = lowerContent.includes('user research') || lowerContent.includes('user interview');
    const hasPrototyping = lowerContent.includes('prototype') || lowerContent.includes('prototyping');
    
    const keywordCount = [hasWireframing, hasUsabilityTesting, hasFigma, hasUserResearch, hasPrototyping].filter(Boolean).length;
    
    if (keywordCount >= 3) {
      results.jobSpecificEnhancements = 'PASS';
      console.log(`✅ PASS - ${keywordCount}/5 key UX terms integrated naturally`);
    } else {
      results.jobSpecificEnhancements = 'FAIL';
      console.log(`❌ FAIL - Only ${keywordCount}/5 key UX terms found`);
    }

    // TEST 5: Tailoring Score
    console.log('\n🔍 TEST 5: Tailoring Score');
    if (score >= 80) {
      results.tailoringScore = 'PASS';
      console.log(`✅ PASS - Score: ${score} (≥ 80)`);
    } else {
      results.tailoringScore = 'FAIL';
      console.log(`❌ FAIL - Score: ${score} (< 80)`);
    }

    // TEST 6: Export Validation
    console.log('\n🔍 TEST 6: Export Validation');
    if (downloadUrl) {
      try {
        const pdfResponse = await fetch(downloadUrl);
        if (pdfResponse.ok) {
          const pdfBlob = await pdfResponse.blob();
          const hasValidSize = pdfBlob.size > 2000; // At least 2KB for complete PDF
          const hasValidType = pdfBlob.type.includes('pdf') || downloadUrl.includes('.pdf');
          
          if (hasValidSize && hasValidType) {
            results.exportValidation = 'PASS';
            console.log(`✅ PASS - Valid PDF export (${pdfBlob.size} bytes)`);
          } else {
            results.exportValidation = 'FAIL';
            console.log('❌ FAIL - PDF validation failed:', {
              size: pdfBlob.size,
              type: pdfBlob.type,
              hasValidSize,
              hasValidType
            });
          }
        } else {
          results.exportValidation = 'FAIL';
          console.log('❌ FAIL - PDF not accessible, status:', pdfResponse.status);
        }
      } catch (pdfError) {
        results.exportValidation = 'FAIL';
        console.log('❌ FAIL - PDF download error:', pdfError.message);
      }
    } else {
      results.exportValidation = 'FAIL';
      console.log('❌ FAIL - No download URL provided');
    }

  } catch (error) {
    console.error('❌ Test execution failed:', error);
    
    // Set all results to FAIL if test execution fails
    Object.keys(results).forEach(key => {
      if (results[key] === 'UNKNOWN') {
        results[key] = 'FAIL';
      }
    });
  }

  // Generate summary report
  console.log('\n📊 RETEST RESULT SUMMARY:');
  console.log('==========================');
  console.log(`Structure Preservation → ${results.structurePreservation}`);
  console.log(`Candidate Details → ${results.candidateDetails}`);
  console.log(`Content Quality → ${results.contentQuality}`);
  console.log(`Job-Specific Enhancements → ${results.jobSpecificEnhancements}`);
  console.log(`Tailoring Score → ${results.tailoringScore}`);
  console.log(`Export Validation → ${results.exportValidation}`);

  const passCount = Object.values(results).filter(result => result === 'PASS').length;
  const failCount = Object.values(results).filter(result => result === 'FAIL').length;
  
  console.log(`\nOverall: ${passCount} PASS, ${failCount} FAIL`);
  
  return {
    results,
    summary: `${passCount} PASS, ${failCount} FAIL`,
    success: passCount === 6
  };
};

// Auto-execute test
if (typeof window !== 'undefined') {
  window.runCVTailoringRetest = runCVTailoringRetest;
  console.log('🧪 CV Tailoring Retest loaded. Run with: runCVTailoringRetest()');
  
  // Auto-run the test
  setTimeout(() => {
    runCVTailoringRetest().then(result => {
      console.log('\n🎯 Final Result:', result.summary);
      if (result.success) {
        console.log('🎉 All tests passed! CV Tailoring system is working correctly.');
      } else {
        console.log('⚠️ Some tests failed. Review the details above.');
      }
    });
  }, 1000);
} else {
  // Node.js environment
  runCVTailoringRetest().then(result => {
    console.log('Test completed:', result.summary);
    process.exit(result.success ? 0 : 1);
  });
}