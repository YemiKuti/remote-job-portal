// Direct test of CV tailoring functionality
const testCVTailoring = async () => {
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
• Portfolio showcasing end-to-end design process

PREFERRED QUALIFICATIONS:
• Experience with design systems and component libraries
• Knowledge of accessibility standards (WCAG)
• Familiarity with Agile/Scrum development processes
• Experience with A/B testing and data analysis tools
• Understanding of mobile-first design principles

WHAT WE OFFER:
• Competitive salary: $90,000 - $120,000
• Comprehensive health benefits
• Professional development opportunities
• Flexible work arrangements
• Creative and collaborative work environment

Apply with your portfolio and cover letter to: careers@creativestudiopro.com`;

  const testPayload = {
    resumeContent: testResumeContent,
    jobDescription: testJobDescription,
    jobTitle: "UX Designer",
    companyName: "Creative Studio Pro"
  };

  console.log('🚀 Testing CV tailoring with sample data...');
  console.log('Resume length:', testResumeContent.length);
  console.log('Job description length:', testJobDescription.length);

  try {
    // Call the Supabase edge function
    const { data, error } = await supabase.functions.invoke('tailor-cv', {
      body: testPayload
    });

    console.log('📤 Function called, checking response...');

    if (error) {
      console.error('❌ Function error:', error);
      return { success: false, error: error.message };
    }

    console.log('✅ Function response received:', data);

    // Validation tests
    const results = validateTailoredCV(data, testResumeContent);
    
    console.log('📊 Validation Results:', results);
    return results;

  } catch (err) {
    console.error('❌ Test failed:', err);
    return { success: false, error: err.message };
  }
};

const validateTailoredCV = (response, originalResume) => {
  const results = {
    success: false,
    tests: {},
    score: 0,
    issues: []
  };

  // Check response structure
  if (!response || !response.tailoredContent && !response.tailoredResume) {
    results.issues.push('No tailored content in response');
    return results;
  }

  const tailoredContent = response.tailoredContent || response.tailoredResume || '';
  const lowerContent = tailoredContent.toLowerCase();

  // Test 1: Structure Preservation
  results.tests.preservedName = !lowerContent.includes('contact information available upon request');
  results.tests.hasRealContent = !lowerContent.includes('experienced professional with a demonstrated history');
  results.tests.noGenericTemplate = !lowerContent.includes('relevant to the industry.');

  // Test 2: Enhancement Quality  
  results.tests.hasUXKeywords = lowerContent.includes('ux') || lowerContent.includes('user experience');
  results.tests.hasDesignTools = lowerContent.includes('figma') || lowerContent.includes('sketch');
  results.tests.hasMetrics = /\d+%|\d+\+?\s+(users|projects|increase|improvement)/.test(lowerContent);

  // Test 3: Completeness
  results.tests.adequateLength = tailoredContent.length >= 800;
  results.tests.hasEducation = lowerContent.includes('education') || lowerContent.includes('bachelor');
  results.tests.hasExperience = lowerContent.includes('experience') || lowerContent.includes('designer');

  // Test 4: Quality Score
  const qualityScore = response.tailoring_score || response.score || response.matchScore || 0;
  results.tests.goodScore = qualityScore >= 80;

  // Calculate overall success
  const passedTests = Object.values(results.tests).filter(Boolean).length;
  const totalTests = Object.keys(results.tests).length;
  results.score = Math.round((passedTests / totalTests) * 100);
  results.success = results.score >= 80;

  // Identify specific issues
  if (!results.tests.preservedName) results.issues.push('Uses placeholder contact information');
  if (!results.tests.hasRealContent) results.issues.push('Contains generic template text');
  if (!results.tests.hasUXKeywords) results.issues.push('Missing UX-specific keywords');
  if (!results.tests.adequateLength) results.issues.push('Content too short or truncated');
  if (!results.tests.goodScore) results.issues.push(`Quality score too low: ${qualityScore}`);

  return results;
};

// Export for use
window.testCVTailoring = testCVTailoring;