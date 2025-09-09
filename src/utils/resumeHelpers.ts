// Enhanced helper functions for resume processing and CV tailoring

export const extractSection = (content: string, sectionKeywords: string[]): string | null => {
  const lines = content.split('\n');
  let sectionFound = false;
  let sectionContent = '';
  let linesAfterHeader = 0;
  
  for (const line of lines) {
    const lowerLine = line.toLowerCase().trim();
    
    // Check if this line contains a section header
    if (sectionKeywords.some(keyword => lowerLine.includes(keyword.toLowerCase()))) {
      sectionFound = true;
      linesAfterHeader = 0;
      continue;
    }
    
    // If we found the section, collect content
    if (sectionFound) {
      linesAfterHeader++;
      
      // Stop if we hit another section or too many empty lines
      if (linesAfterHeader > 20 || 
          (linesAfterHeader > 3 && lowerLine === '') ||
          (lowerLine.length > 0 && 
           ['summary', 'objective', 'experience', 'education', 'skills', 'projects', 'certifications']
           .some(section => lowerLine.includes(section) && !sectionKeywords.includes(section)))) {
        break;
      }
      
      if (line.trim()) {
        sectionContent += line + '\n';
      }
    }
  }
  
  return sectionContent.trim() || null;
};

export const generateProfessionalSummary = (jobTitle: string, companyName: string, resumeContent: string): string => {
  // Extract years of experience
  const experienceMatch = resumeContent.match(/(\d+)[\+\s]*years?/i);
  const years = experienceMatch ? experienceMatch[1] : '5+';
  
  // Extract key skills
  const skills = extractKeySkills(resumeContent, 3);
  
  // Generate summary based on job title and extracted info
  const role = jobTitle || 'professional role';
  const company = companyName || 'your organization';
  
  return `Results-driven professional with ${years} years of experience specializing in ${role.toLowerCase()}. Proven expertise in ${skills.join(', ')} with a track record of delivering high-impact solutions. Seeking to leverage technical skills and leadership experience to drive success at ${company}.`;
};

export const generateKeyCompetencies = (jobDescription: string, skillsContent: string): string => {
  // Extract skills from job description
  const jobSkills = extractSkillsFromText(jobDescription);
  
  // Extract skills from resume
  const resumeSkills = extractSkillsFromText(skillsContent);
  
  // Find matching skills
  const matchingSkills = resumeSkills.filter(skill => 
    jobSkills.some(jobSkill => 
      skill.toLowerCase().includes(jobSkill.toLowerCase()) || 
      jobSkill.toLowerCase().includes(skill.toLowerCase())
    )
  );
  
  // Combine with additional relevant skills
  const allSkills = [...new Set([...matchingSkills, ...resumeSkills.slice(0, 8)])];
  
  return allSkills.slice(0, 10).map(skill => `• ${skill}`).join('\n');
};

export const calculateMatchScore = (resumeContent: string, jobDescription: string): number => {
  const resumeWords = extractKeywords(resumeContent);
  const jobWords = extractKeywords(jobDescription);
  
  const matchingWords = resumeWords.filter(word => 
    jobWords.some(jobWord => 
      word.toLowerCase() === jobWord.toLowerCase() ||
      (word.length > 4 && jobWord.toLowerCase().includes(word.toLowerCase()))
    )
  );
  
  const baseScore = Math.min(90, (matchingWords.length / Math.max(jobWords.length, 1)) * 100);
  
  // Bonus points for having structured sections
  let bonus = 0;
  if (resumeContent.toLowerCase().includes('experience')) bonus += 5;
  if (resumeContent.toLowerCase().includes('education')) bonus += 3;
  if (resumeContent.toLowerCase().includes('skills')) bonus += 5;
  if (resumeContent.toLowerCase().includes('achievements')) bonus += 2;
  
  return Math.min(95, Math.round(baseScore + bonus));
};

const extractKeySkills = (content: string, limit: number = 5): string[] => {
  const commonSkills = [
    'JavaScript', 'Python', 'Java', 'React', 'Node.js', 'SQL', 'HTML', 'CSS',
    'Project Management', 'Leadership', 'Communication', 'Problem Solving',
    'Data Analysis', 'Marketing', 'Sales', 'Customer Service', 'Design',
    'Research', 'Writing', 'Teaching', 'Consulting', 'Strategy'
  ];
  
  const foundSkills = commonSkills.filter(skill => 
    content.toLowerCase().includes(skill.toLowerCase())
  );
  
  return foundSkills.slice(0, limit);
};

const extractSkillsFromText = (text: string): string[] => {
  const skillPatterns = [
    /(?:skills?|technologies|tools|expertise|proficient in|experienced with)[:\-\s]+(.*?)(?:\n|$)/gi,
    /(?:including|such as)[:\s]+(.*?)(?:\n|\.)/gi,
    /[•\-\*]\s*([^•\-\*\n]+)/g
  ];
  
  const skills: string[] = [];
  
  skillPatterns.forEach(pattern => {
    const matches = text.match(pattern);
    if (matches) {
      matches.forEach(match => {
        const cleaned = match
          .replace(/^[•\-\*\s]*/, '')
          .replace(/skills?|technologies|tools|expertise|proficient in|experienced with|including|such as/gi, '')
          .replace(/[:\-\s]+$/, '')
          .trim();
        
        if (cleaned.length > 2 && cleaned.length < 50) {
          skills.push(cleaned);
        }
      });
    }
  });
  
  return [...new Set(skills)].slice(0, 15);
};

const extractKeywords = (text: string): string[] => {
  // Remove common words and extract meaningful terms
  const stopWords = new Set([
    'the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by',
    'from', 'up', 'about', 'into', 'through', 'during', 'before', 'after',
    'above', 'below', 'between', 'among', 'is', 'are', 'was', 'were', 'be',
    'been', 'being', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would',
    'should', 'could', 'can', 'may', 'might', 'must', 'shall', 'this', 'that',
    'these', 'those', 'a', 'an', 'as', 'if', 'each', 'how', 'which', 'what',
    'where', 'why', 'when', 'who', 'whom', 'whose', 'whether', 'both', 'either',
    'neither', 'not', 'no', 'nor', 'so', 'yet', 'any', 'all', 'some', 'most',
    'other', 'such', 'only', 'own', 'same', 'few', 'more', 'much', 'many'
  ]);
  
  const words = text
    .toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter(word => 
      word.length > 3 && 
      !stopWords.has(word) &&
      !/^\d+$/.test(word)
    );
  
  // Count word frequency
  const wordCount = words.reduce((acc, word) => {
    acc[word] = (acc[word] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  // Return most frequent words
  return Object.entries(wordCount)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 20)
    .map(([word]) => word);
};