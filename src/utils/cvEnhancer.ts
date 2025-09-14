/**
 * CV Enhancement Logic - Preserves original content while adding targeted improvements
 */

export interface ResumeSection {
  contact?: {
    name: string;
    email: string;
    phone: string;
    linkedin?: string;
    location?: string;
  };
  summary?: string;
  experience: ExperienceEntry[];
  education: EducationEntry[];
  skills: string[];
  certifications?: string[];
  projects?: ProjectEntry[];
}

export interface ExperienceEntry {
  title: string;
  company: string;
  duration: string;
  location?: string;
  bullets: string[];
}

export interface EducationEntry {
  degree: string;
  institution: string;
  year?: string;
  location?: string;
  details?: string[];
}

export interface ProjectEntry {
  name: string;
  description: string;
  technologies?: string[];
}

export interface JobRequirements {
  title: string;
  company: string;
  description: string;
  requiredSkills: string[];
  preferredSkills: string[];
  responsibilities: string[];
  keywords: string[];
}

export class CVEnhancer {
  private originalResume: ResumeSection;
  private jobRequirements: JobRequirements;
  
  constructor(originalResume: ResumeSection, jobRequirements: JobRequirements) {
    this.originalResume = originalResume;
    this.jobRequirements = jobRequirements;
  }

  /**
   * Parse raw resume text into structured sections
   */
  static parseResumeContent(content: string): ResumeSection {
    const sections = {
      contact: CVEnhancer.extractContact(content),
      summary: CVEnhancer.extractSection(content, ['summary', 'profile', 'objective']),
      experience: CVEnhancer.extractExperience(content),
      education: CVEnhancer.extractEducation(content),
      skills: CVEnhancer.extractSkills(content),
      certifications: CVEnhancer.extractCertifications(content),
      projects: CVEnhancer.extractProjects(content)
    };

    return sections;
  }

  /**
   * Extract contact information from resume
   */
  private static extractContact(content: string): ResumeSection['contact'] {
    const lines = content.split('\n').slice(0, 10); // Check first 10 lines
    const contact: ResumeSection['contact'] = {
      name: '',
      email: '',
      phone: ''
    };

    // Extract name (usually first line or first substantial line)
    const nameRegex = /^[A-Z][a-z]+ [A-Z][a-z]+/;
    for (const line of lines) {
      const cleanLine = line.trim().replace(/[^\w\s]/g, ' ').trim();
      if (nameRegex.test(cleanLine) && cleanLine.length < 50) {
        contact.name = cleanLine;
        break;
      }
    }

    // Extract email
    const emailMatch = content.match(/[\w.-]+@[\w.-]+\.\w+/);
    if (emailMatch) contact.email = emailMatch[0];

    // Extract phone
    const phoneMatch = content.match(/(\+?1[-.\s]?)?\(?[0-9]{3}\)?[-.\s]?[0-9]{3}[-.\s]?[0-9]{4}/);
    if (phoneMatch) contact.phone = phoneMatch[0];

    // Extract LinkedIn
    const linkedinMatch = content.match(/linkedin\.com\/in\/[\w-]+/);
    if (linkedinMatch) contact.linkedin = linkedinMatch[0];

    // Extract location
    const locationMatch = content.match(/([A-Z][a-z]+,?\s*[A-Z]{2})|([A-Z][a-z]+\s*[A-Z][a-z]+,?\s*[A-Z]{2})/);
    if (locationMatch) contact.location = locationMatch[0];

    return contact;
  }

  /**
   * Extract work experience section
   */
  private static extractExperience(content: string): ExperienceEntry[] {
    const experiences: ExperienceEntry[] = [];
    const experienceSection = CVEnhancer.extractSection(content, [
      'experience', 'work experience', 'professional experience', 'employment', 'career history'
    ]);

    if (!experienceSection) return experiences;

    // Split by job entries (look for patterns like "Title | Company | Date")
    const jobPattern = /([A-Za-z\s]+)\s*\|\s*([A-Za-z\s&.,]+)\s*\|\s*([\d\s\-A-Za-z,]+)/g;
    const bullets = experienceSection.split('\n').filter(line => line.trim().startsWith('•') || line.trim().startsWith('-'));
    
    let currentJob: Partial<ExperienceEntry> = {};
    
    const lines = experienceSection.split('\n');
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      
      // Check if this line contains job info
      const jobMatch = line.match(/^(.+?)\s*\|\s*(.+?)\s*\|\s*(.+)$/);
      if (jobMatch) {
        // Save previous job if exists
        if (currentJob.title && currentJob.company) {
          experiences.push(currentJob as ExperienceEntry);
        }
        
        currentJob = {
          title: jobMatch[1].trim(),
          company: jobMatch[2].trim(),
          duration: jobMatch[3].trim(),
          bullets: []
        };
      } else if (line.startsWith('•') || line.startsWith('-')) {
        // Add bullet to current job
        if (currentJob.bullets) {
          currentJob.bullets.push(line.substring(1).trim());
        }
      }
    }

    // Add last job
    if (currentJob.title && currentJob.company) {
      experiences.push(currentJob as ExperienceEntry);
    }

    return experiences;
  }

  /**
   * Extract education section
   */
  private static extractEducation(content: string): EducationEntry[] {
    const education: EducationEntry[] = [];
    const educationSection = CVEnhancer.extractSection(content, ['education', 'academic', 'qualifications']);
    
    if (!educationSection) return education;

    const lines = educationSection.split('\n').filter(line => line.trim().length > 0);
    
    for (const line of lines) {
      // Look for degree patterns
      const degreeMatch = line.match(/(Bachelor|Master|PhD|Associate|Certificate).*?-\s*(.+?)\s*\|\s*(\d{4})/);
      if (degreeMatch) {
        education.push({
          degree: degreeMatch[1],
          institution: degreeMatch[2].trim(),
          year: degreeMatch[3]
        });
      }
    }

    return education;
  }

  /**
   * Extract skills section
   */
  private static extractSkills(content: string): string[] {
    const skillsSection = CVEnhancer.extractSection(content, ['skills', 'technical skills', 'competencies', 'technologies']);
    if (!skillsSection) return [];

    const skills: string[] = [];
    const lines = skillsSection.split('\n');
    
    for (const line of lines) {
      if (line.includes(':')) {
        // Format like "Languages: JavaScript, Python"
        const parts = line.split(':');
        if (parts.length > 1) {
          const skillList = parts[1].split(',').map(s => s.trim());
          skills.push(...skillList);
        }
      } else if (line.startsWith('•') || line.startsWith('-')) {
        skills.push(line.substring(1).trim());
      }
    }

    return skills.filter(skill => skill.length > 0);
  }

  /**
   * Extract certifications section
   */
  private static extractCertifications(content: string): string[] {
    const certSection = CVEnhancer.extractSection(content, ['certification', 'certificates', 'licenses']);
    if (!certSection) return [];

    return certSection.split('\n')
      .filter(line => line.trim().startsWith('•') || line.trim().startsWith('-'))
      .map(line => line.substring(1).trim());
  }

  /**
   * Extract projects section
   */
  private static extractProjects(content: string): ProjectEntry[] {
    const projectSection = CVEnhancer.extractSection(content, ['projects', 'portfolio', 'personal projects']);
    if (!projectSection) return [];

    // Simple project extraction
    const projects: ProjectEntry[] = [];
    const lines = projectSection.split('\n');
    
    for (const line of lines) {
      if (line.trim() && !line.startsWith('•') && !line.startsWith('-')) {
        projects.push({
          name: line.trim(),
          description: ''
        });
      }
    }

    return projects;
  }

  /**
   * Extract a section from resume content
   */
  private static extractSection(content: string, sectionNames: string[]): string | null {
    const normalizedContent = content.toLowerCase();
    
    for (const sectionName of sectionNames) {
      const sectionRegex = new RegExp(`(^|\\n)\\s*${sectionName}\\s*:?\\s*\\n([\\s\\S]*?)(?=\\n\\s*[A-Z][A-Z\\s]+\\s*:?\\s*\\n|$)`, 'i');
      const match = normalizedContent.match(sectionRegex);
      
      if (match && match[2]) {
        // Get the original case version
        const startIndex = content.toLowerCase().indexOf(match[0]);
        const endIndex = startIndex + match[0].length;
        const originalText = content.substring(startIndex, endIndex);
        
        return match[2].trim();
      }
    }
    
    return null;
  }

  /**
   * Enhance the resume while preserving original content
   */
  enhanceResume(): string {
    const enhanced = {
      contact: this.enhanceContact(),
      summary: this.enhanceSummary(),
      experience: this.enhanceExperience(),
      skills: this.enhanceSkills(),
      education: this.enhanceEducation()
    };

    return this.formatEnhancedResume(enhanced);
  }

  /**
   * Enhance contact section (preserve all original data)
   */
  private enhanceContact(): ResumeSection['contact'] {
    return { ...this.originalResume.contact };
  }

  /**
   * Enhance professional summary
   */
  private enhanceSummary(): string {
    const original = this.originalResume.summary || '';
    const jobKeywords = this.jobRequirements.keywords.slice(0, 3);
    
    if (!original) {
      // Create summary if none exists
      return `${this.jobRequirements.title} with proven expertise in ${jobKeywords.join(', ')}. Experienced professional focused on delivering high-impact solutions and driving business results.`;
    }
    
    // Enhance existing summary by adding relevant keywords naturally
    let enhanced = original;
    
    // Add job title if not mentioned
    if (!enhanced.toLowerCase().includes(this.jobRequirements.title.toLowerCase())) {
      enhanced = `${this.jobRequirements.title} | ${enhanced}`;
    }
    
    return enhanced;
  }

  /**
   * Enhance work experience by rephrasing bullets for impact
   */
  private enhanceExperience(): ExperienceEntry[] {
    return this.originalResume.experience.map(job => ({
      ...job,
      bullets: job.bullets.map(bullet => this.enhanceBullet(bullet))
    }));
  }

  /**
   * Enhance individual experience bullet point
   */
  private enhanceBullet(bullet: string): string {
    // Add action verbs and impact metrics where appropriate
    const actionVerbs = ['Led', 'Implemented', 'Developed', 'Improved', 'Achieved', 'Delivered', 'Optimized'];
    
    let enhanced = bullet;
    
    // If bullet doesn't start with action verb, try to enhance it
    if (!actionVerbs.some(verb => enhanced.toLowerCase().startsWith(verb.toLowerCase()))) {
      // Simple enhancement - add quantifiable impact where possible
      if (enhanced.includes('developed') || enhanced.includes('built')) {
        enhanced = enhanced.replace(/developed|built/i, 'Successfully developed');
      }
    }
    
    return enhanced;
  }

  /**
   * Enhance skills section by adding relevant job skills
   */
  private enhanceSkills(): string[] {
    const originalSkills = [...this.originalResume.skills];
    const jobSkills = [...this.jobRequirements.requiredSkills, ...this.jobRequirements.preferredSkills];
    
    // Add job-relevant skills that candidate likely has based on experience
    for (const skill of jobSkills) {
      const hasRelatedSkill = originalSkills.some(s => 
        s.toLowerCase().includes(skill.toLowerCase()) || 
        skill.toLowerCase().includes(s.toLowerCase())
      );
      
      if (!hasRelatedSkill && originalSkills.length < 15) {
        // Only add if it makes sense based on experience
        if (this.skillRelevantToExperience(skill)) {
          originalSkills.push(skill);
        }
      }
    }
    
    return originalSkills;
  }

  /**
   * Check if skill is relevant to candidate's experience
   */
  private skillRelevantToExperience(skill: string): boolean {
    const experienceText = this.originalResume.experience
      .map(exp => exp.bullets.join(' '))
      .join(' ')
      .toLowerCase();
    
    // Simple relevance check
    return experienceText.includes(skill.toLowerCase().split(' ')[0]);
  }

  /**
   * Enhance education (preserve original)
   */
  private enhanceEducation(): EducationEntry[] {
    return [...this.originalResume.education];
  }

  /**
   * Format the enhanced resume into final text
   */
  private formatEnhancedResume(enhanced: any): string {
    const sections: string[] = [];
    
    // Contact Information
    if (enhanced.contact) {
      const contact = enhanced.contact;
      sections.push(contact.name.toUpperCase());
      
      const contactLine = [contact.email, contact.phone, contact.linkedin, contact.location]
        .filter(item => item)
        .join(' | ');
      
      sections.push(contactLine);
      sections.push('');
    }
    
    // Professional Summary
    if (enhanced.summary) {
      sections.push('PROFESSIONAL SUMMARY');
      sections.push(enhanced.summary);
      sections.push('');
    }
    
    // Work Experience
    if (enhanced.experience && enhanced.experience.length > 0) {
      sections.push('PROFESSIONAL EXPERIENCE');
      sections.push('');
      
      for (const job of enhanced.experience) {
        sections.push(`${job.title} | ${job.company} | ${job.duration}`);
        for (const bullet of job.bullets) {
          sections.push(`• ${bullet}`);
        }
        sections.push('');
      }
    }
    
    // Skills
    if (enhanced.skills && enhanced.skills.length > 0) {
      sections.push('SKILLS');
      
      // Group skills by category if possible
      const technicalSkills = enhanced.skills.filter((skill: string) => 
        ['javascript', 'python', 'react', 'node', 'sql', 'html', 'css', 'figma', 'sketch'].some(tech => 
          skill.toLowerCase().includes(tech)
        )
      );
      
      const softSkills = enhanced.skills.filter((skill: string) => 
        !technicalSkills.includes(skill)
      );
      
      if (technicalSkills.length > 0) {
        sections.push(`Technical: ${technicalSkills.join(', ')}`);
      }
      
      if (softSkills.length > 0) {
        sections.push(`Professional: ${softSkills.join(', ')}`);
      }
      
      sections.push('');
    }
    
    // Education
    if (enhanced.education && enhanced.education.length > 0) {
      sections.push('EDUCATION');
      
      for (const edu of enhanced.education) {
        sections.push(`${edu.degree} - ${edu.institution} | ${edu.year || ''}`);
      }
      sections.push('');
    }
    
    return sections.join('\n').trim();
  }

  /**
   * Calculate enhancement quality score
   */
  calculateScore(): number {
    let score = 0;
    
    // Contact completeness (20 points)
    if (this.originalResume.contact?.name) score += 5;
    if (this.originalResume.contact?.email) score += 5;
    if (this.originalResume.contact?.phone) score += 5;
    if (this.originalResume.contact?.location) score += 5;
    
    // Content quality (40 points)
    if (this.originalResume.summary) score += 10;
    if (this.originalResume.experience.length > 0) score += 15;
    if (this.originalResume.education.length > 0) score += 10;
    if (this.originalResume.skills.length > 0) score += 5;
    
    // Job relevance (40 points)
    const skillMatches = this.calculateSkillMatches();
    score += Math.min(skillMatches * 5, 20);
    
    const keywordMatches = this.calculateKeywordMatches();
    score += Math.min(keywordMatches * 2, 20);
    
    return Math.min(score, 100);
  }

  /**
   * Calculate skill matches between resume and job
   */
  private calculateSkillMatches(): number {
    const resumeSkills = this.originalResume.skills.map(s => s.toLowerCase());
    const jobSkills = [...this.jobRequirements.requiredSkills, ...this.jobRequirements.preferredSkills]
      .map(s => s.toLowerCase());
    
    let matches = 0;
    for (const skill of jobSkills) {
      if (resumeSkills.some(rs => rs.includes(skill) || skill.includes(rs))) {
        matches++;
      }
    }
    
    return matches;
  }

  /**
   * Calculate keyword matches in experience
   */
  private calculateKeywordMatches(): number {
    const experienceText = this.originalResume.experience
      .map(exp => exp.bullets.join(' '))
      .join(' ')
      .toLowerCase();
    
    let matches = 0;
    for (const keyword of this.jobRequirements.keywords) {
      if (experienceText.includes(keyword.toLowerCase())) {
        matches++;
      }
    }
    
    return matches;
  }

  /**
   * Parse job description into structured requirements
   */
  static parseJobDescription(title: string, company: string, description: string): JobRequirements {
    const lowerDesc = description.toLowerCase();
    
    // Extract skills from common patterns
    const skillPatterns = [
      /(?:experience with|proficiency in|knowledge of)\s*:?\s*([^.]+)/g,
      /(?:skills|technologies|tools):\s*([^.]+)/g,
      /(?:required|must have|should have):\s*([^.]+)/g
    ];
    
    const skills: string[] = [];
    for (const pattern of skillPatterns) {
      let match;
      while ((match = pattern.exec(lowerDesc)) !== null) {
        const skillList = match[1].split(/[,;]/).map(s => s.trim());
        skills.push(...skillList);
      }
    }
    
    // Extract common keywords
    const commonKeywords = [
      'agile', 'scrum', 'leadership', 'collaboration', 'communication',
      'problem-solving', 'analytical', 'creative', 'innovative', 'strategic'
    ];
    
    const keywords = commonKeywords.filter(keyword => 
      lowerDesc.includes(keyword)
    );
    
    return {
      title,
      company,
      description,
      requiredSkills: skills.slice(0, 5),
      preferredSkills: [],
      responsibilities: [],
      keywords: [...new Set(keywords)]
    };
  }
}