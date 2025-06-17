
export interface CandidateData {
  personalInfo: {
    name?: string;
    email?: string;
    phone?: string;
    address?: string;
    linkedin?: string;
    website?: string;
  };
  summary?: string;
  experience: {
    title?: string;
    company?: string;
    duration?: string;
    description?: string;
  }[];
  education: {
    degree?: string;
    institution?: string;
    year?: string;
    gpa?: string;
  }[];
  skills: string[];
  certifications: string[];
}

export const extractCandidateData = (resumeText: string): CandidateData => {
  console.log('🔍 Extracting candidate data from resume text');
  
  const lines = resumeText.split('\n').map(line => line.trim()).filter(line => line.length > 0);
  
  const candidateData: CandidateData = {
    personalInfo: {},
    experience: [],
    education: [],
    skills: [],
    certifications: []
  };

  // Extract email
  const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g;
  const emailMatch = resumeText.match(emailRegex);
  if (emailMatch) {
    candidateData.personalInfo.email = emailMatch[0];
  }

  // Extract phone number
  const phoneRegex = /(?:\+?1[-.\s]?)?\(?([0-9]{3})\)?[-.\s]?([0-9]{3})[-.\s]?([0-9]{4})/g;
  const phoneMatch = resumeText.match(phoneRegex);
  if (phoneMatch) {
    candidateData.personalInfo.phone = phoneMatch[0];
  }

  // Extract LinkedIn
  const linkedinRegex = /(?:linkedin\.com\/in\/|linkedin\.com\/profile\/view\?id=)([a-zA-Z0-9\-]+)/i;
  const linkedinMatch = resumeText.match(linkedinRegex);
  if (linkedinMatch) {
    candidateData.personalInfo.linkedin = `https://linkedin.com/in/${linkedinMatch[1]}`;
  }

  // Extract name (usually the first substantial line that's not contact info)
  for (const line of lines.slice(0, 5)) {
    if (!line.includes('@') && !phoneRegex.test(line) && line.length > 3 && line.length < 50) {
      const words = line.split(' ');
      if (words.length >= 2 && words.length <= 4) {
        candidateData.personalInfo.name = line;
        break;
      }
    }
  }

  let currentSection = '';
  let currentContent: string[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const lowerLine = line.toLowerCase();

    // Identify sections
    if (lowerLine.includes('summary') || lowerLine.includes('objective') || lowerLine.includes('profile')) {
      if (currentSection && currentContent.length > 0) {
        processSection(currentSection, currentContent, candidateData);
      }
      currentSection = 'summary';
      currentContent = [];
      continue;
    } else if (lowerLine.includes('experience') || lowerLine.includes('work') || lowerLine.includes('employment')) {
      if (currentSection && currentContent.length > 0) {
        processSection(currentSection, currentContent, candidateData);
      }
      currentSection = 'experience';
      currentContent = [];
      continue;
    } else if (lowerLine.includes('education') || lowerLine.includes('degree')) {
      if (currentSection && currentContent.length > 0) {
        processSection(currentSection, currentContent, candidateData);
      }
      currentSection = 'education';
      currentContent = [];
      continue;
    } else if (lowerLine.includes('skills') || lowerLine.includes('technical') || lowerLine.includes('competencies')) {
      if (currentSection && currentContent.length > 0) {
        processSection(currentSection, currentContent, candidateData);
      }
      currentSection = 'skills';
      currentContent = [];
      continue;
    } else if (lowerLine.includes('certification') || lowerLine.includes('license')) {
      if (currentSection && currentContent.length > 0) {
        processSection(currentSection, currentContent, candidateData);
      }
      currentSection = 'certifications';
      currentContent = [];
      continue;
    }

    if (currentSection && line.trim()) {
      currentContent.push(line);
    }
  }

  // Process the last section
  if (currentSection && currentContent.length > 0) {
    processSection(currentSection, currentContent, candidateData);
  }

  console.log('✅ Candidate data extracted:', candidateData);
  return candidateData;
};

const processSection = (section: string, content: string[], candidateData: CandidateData) => {
  switch (section) {
    case 'summary':
      candidateData.summary = content.join(' ');
      break;
    
    case 'experience':
      const experiences = parseExperience(content);
      candidateData.experience.push(...experiences);
      break;
    
    case 'education':
      const education = parseEducation(content);
      candidateData.education.push(...education);
      break;
    
    case 'skills':
      const skills = parseSkills(content);
      candidateData.skills.push(...skills);
      break;
    
    case 'certifications':
      candidateData.certifications.push(...content);
      break;
  }
};

const parseExperience = (content: string[]): CandidateData['experience'] => {
  const experiences: CandidateData['experience'] = [];
  let currentExp: Partial<CandidateData['experience'][0]> = {};
  
  for (const line of content) {
    // Check if line looks like a job title/company
    const jobTitlePattern = /^[A-Z][A-Za-z\s,&-]+(?:\s+at\s+|\s+@\s+|\s+-\s+)([A-Za-z\s,&.-]+)$/i;
    const match = line.match(jobTitlePattern);
    
    if (match) {
      if (Object.keys(currentExp).length > 0) {
        experiences.push(currentExp as CandidateData['experience'][0]);
      }
      currentExp = {
        title: line.split(/\s+at\s+|\s+@\s+|\s+-\s+/i)[0]?.trim(),
        company: match[1]?.trim()
      };
    } else if (line.match(/\d{4}|\d{1,2}\/\d{4}|present|current/i)) {
      // Looks like a date range
      currentExp.duration = line;
    } else if (currentExp.title && line.length > 20) {
      // Likely a description
      currentExp.description = (currentExp.description || '') + ' ' + line;
    }
  }
  
  if (Object.keys(currentExp).length > 0) {
    experiences.push(currentExp as CandidateData['experience'][0]);
  }
  
  return experiences;
};

const parseEducation = (content: string[]): CandidateData['education'] => {
  const education: CandidateData['education'] = [];
  let currentEdu: Partial<CandidateData['education'][0]> = {};
  
  for (const line of content) {
    if (line.match(/bachelor|master|phd|doctorate|associate|certificate/i)) {
      if (Object.keys(currentEdu).length > 0) {
        education.push(currentEdu as CandidateData['education'][0]);
      }
      currentEdu = { degree: line };
    } else if (line.match(/university|college|institute|school/i)) {
      currentEdu.institution = line;
    } else if (line.match(/\d{4}/)) {
      currentEdu.year = line;
    } else if (line.match(/gpa|grade/i)) {
      currentEdu.gpa = line;
    }
  }
  
  if (Object.keys(currentEdu).length > 0) {
    education.push(currentEdu as CandidateData['education'][0]);
  }
  
  return education;
};

const parseSkills = (content: string[]): string[] => {
  const skills: string[] = [];
  
  for (const line of content) {
    // Split by common delimiters
    const splitSkills = line.split(/[,•·\|\n\t]/)
      .map(skill => skill.trim())
      .filter(skill => skill.length > 1 && skill.length < 30);
    
    skills.push(...splitSkills);
  }
  
  return skills.filter((skill, index, arr) => arr.indexOf(skill) === index); // Remove duplicates
};
