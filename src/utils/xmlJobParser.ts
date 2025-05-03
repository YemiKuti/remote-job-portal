import { Job } from "@/types";

/**
 * Parse XML job data string into an array of Job objects
 */
export function parseJobsXML(xmlString: string): Job[] {
  try {
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlString, "text/xml");
    
    const jobElements = xmlDoc.getElementsByTagName("job");
    const jobs: Job[] = [];
    
    for (let i = 0; i < jobElements.length; i++) {
      const jobElement = jobElements[i];
      
      // Helper function to get text content of a child element
      const getText = (tagName: string): string => {
        const element = jobElement.getElementsByTagName(tagName)[0];
        return element ? element.textContent || "" : "";
      };
      
      // Parse salary data
      const salaryElement = jobElement.getElementsByTagName("salary")[0];
      const salary = {
        min: parseInt(salaryElement.getElementsByTagName("min")[0]?.textContent || "0"),
        max: parseInt(salaryElement.getElementsByTagName("max")[0]?.textContent || "0"),
        currency: salaryElement.getElementsByTagName("currency")[0]?.textContent || "USD"
      };
      
      // Parse requirements
      const requirementsElement = jobElement.getElementsByTagName("requirements")[0];
      const requirementElements = requirementsElement.getElementsByTagName("requirement");
      const requirements: string[] = [];
      
      for (let j = 0; j < requirementElements.length; j++) {
        requirements.push(requirementElements[j].textContent || "");
      }
      
      // Parse tech stack
      const techStackElement = jobElement.getElementsByTagName("techStack")[0];
      const techElements = techStackElement.getElementsByTagName("technology");
      const techStack: string[] = [];
      
      for (let j = 0; j < techElements.length; j++) {
        techStack.push(techElements[j].textContent || "");
      }
      
      // Parse plugins
      const pluginsElement = jobElement.getElementsByTagName("plugins")[0];
      const plugins: string[] = [];
      
      if (pluginsElement) {
        const pluginElements = pluginsElement.getElementsByTagName("plugin");
        for (let j = 0; j < pluginElements.length; j++) {
          plugins.push(pluginElements[j].textContent || "");
        }
      }
      
      // Create job object
      const job: Job = {
        id: getText("id"),
        title: getText("title"),
        company: getText("company"),
        logo: getText("logo"),
        location: getText("location"),
        salary,
        description: getText("description"),
        requirements,
        postedDate: getText("postedDate"),
        employmentType: getText("employmentType") as Job["employmentType"],
        experienceLevel: getText("experienceLevel") as Job["experienceLevel"],
        visaSponsorship: getText("visaSponsorship") === "true",
        companySize: getText("companySize") as Job["companySize"],
        techStack,
        remote: getText("remote") === "true",
        // Adding required fields
        status: "active",
        isFeatured: false,
        views: 0,
        applications: 0,
        employerId: getText("employerId") || "unknown",
        // Add plugins as a custom field
        plugins: plugins.length > 0 ? plugins : undefined
      } as Job; // Use type assertion to avoid the TypeScript error
      
      jobs.push(job);
    }
    
    return jobs;
  } catch (error) {
    console.error("Error parsing XML job data:", error);
    return [];
  }
}

/**
 * Import jobs from XML file
 */
export async function importJobsFromXML(file: File): Promise<Job[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const xmlString = e.target?.result as string;
        const jobs = parseJobsXML(xmlString);
        resolve(jobs);
      } catch (error) {
        reject(error);
      }
    };
    
    reader.onerror = () => {
      reject(new Error("Failed to read XML file"));
    };
    
    reader.readAsText(file);
  });
}

/**
 * Generate a sample XML job with plugin support for download/example
 */
export function generateExampleJobXML(): string {
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<jobs>
  <job>
    <id>example-job-1</id>
    <title>WordPress Developer</title>
    <company>Web Solutions</company>
    <logo>/placeholder.svg</logo>
    <location>Remote (Worldwide)</location>
    <salary>
      <min>50000</min>
      <max>80000</max>
      <currency>USD</currency>
    </salary>
    <description>We're looking for a skilled WordPress developer comfortable with popular plugins including Elementor, Contact Form 7, and more.</description>
    <requirements>
      <requirement>3+ years of WordPress experience</requirement>
      <requirement>Experience with Elementor page builder</requirement>
      <requirement>Familiar with Contact Form 7 configuration and customization</requirement>
      <requirement>Knowledge of multilingual site setup with Loco Translate</requirement>
    </requirements>
    <techStack>
      <technology>WordPress</technology>
      <technology>PHP</technology>
      <technology>JavaScript</technology>
      <technology>CSS</technology>
      <technology>MySQL</technology>
    </techStack>
    <plugins>
      <plugin>Elementor</plugin>
      <plugin>Contact Form 7</plugin>
      <plugin>MailChimp</plugin>
      <plugin>Loco Translate</plugin>
      <plugin>WooCommerce</plugin>
    </plugins>
    <postedDate>2023-07-15T10:30:00</postedDate>
    <employmentType>Full-time</employmentType>
    <experienceLevel>Mid-level</experienceLevel>
    <visaSponsorship>false</visaSponsorship>
    <companySize>Small</companySize>
    <remote>true</remote>
    <employerId>employer123</employerId>
  </job>
</jobs>`;
  return xml;
}
