
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
        employerId: getText("employerId") || "unknown"
      };
      
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
