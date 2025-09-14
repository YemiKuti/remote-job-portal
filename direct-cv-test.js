// Direct CV tailoring test
console.log('🚀 Starting direct CV tailoring validation test...');

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

// Test payload for the edge function
const testPayload = {
    resumeContent: testResumeContent,
    jobDescription: testJobDescription,
    jobTitle: "UX Designer",
    companyName: "Creative Studio Pro"
};

console.log('Test data prepared:', {
    resumeLength: testResumeContent.length,
    jobDescLength: testJobDescription.length,
    jobTitle: testPayload.jobTitle,
    companyName: testPayload.companyName
});

console.log('Call this function with supabase.functions.invoke("tailor-cv", { body: testPayload })');