
import { Job } from "../types";

export const mockJobs: Job[] = [
  {
    id: "1",
    title: "Senior Frontend Developer",
    company: "TechCorp Africa",
    logo: "/placeholder.svg",
    location: "Lagos, Nigeria",
    salary: {
      min: 80000,
      max: 120000,
      currency: "USD"
    },
    description: "We are looking for a skilled Frontend Developer to join our team and help build amazing user experiences.",
    requirements: ["React", "TypeScript", "Next.js", "Tailwind CSS"],
    postedDate: "2024-01-15",
    employmentType: "Full-time" as const,
    experienceLevel: "Senior" as const,
    visaSponsorship: true,
    companySize: "Medium" as const,
    techStack: ["React", "TypeScript", "Next.js", "Tailwind CSS", "Node.js"],
    remote: true,
    applicationType: "internal" as const,
    applicationValue: undefined,
    status: "active" as const,
    isFeatured: true,
    sponsored: true,
    views: 234,
    applications: 12,
    employerId: "emp1"
  },
  {
    id: "2",
    title: "Backend Engineer",
    company: "StartupHub Kenya",
    logo: "/placeholder.svg",
    location: "Nairobi, Kenya",
    salary: {
      min: 60000,
      max: 90000,
      currency: "USD"
    },
    description: "Join our backend team to build scalable and robust server-side applications.",
    requirements: ["Node.js", "Python", "PostgreSQL", "AWS"],
    postedDate: "2024-01-14",
    employmentType: "Full-time" as const,
    experienceLevel: "Mid-level" as const,
    visaSponsorship: false,
    companySize: "Startup" as const,
    techStack: ["Node.js", "Python", "PostgreSQL", "AWS", "Docker"],
    remote: false,
    applicationType: "external" as const,
    applicationValue: "https://startupkenyacareers.com/apply/backend-engineer",
    status: "active" as const,
    isFeatured: false,
    sponsored: false,
    views: 189,
    applications: 8,
    employerId: "emp2"
  },
  {
    id: "3",
    title: "Mobile App Developer",
    company: "InnovateSA",
    logo: "/placeholder.svg",
    location: "Cape Town, South Africa",
    salary: {
      min: 70000,
      max: 100000,
      currency: "USD"
    },
    description: "We need a talented mobile developer to create cutting-edge mobile applications.",
    requirements: ["React Native", "Flutter", "iOS", "Android"],
    postedDate: "2024-01-13",
    employmentType: "Full-time" as const,
    experienceLevel: "Mid-level" as const,
    visaSponsorship: true,
    companySize: "Large" as const,
    techStack: ["React Native", "Flutter", "iOS", "Android", "Firebase"],
    remote: true,
    applicationType: "email" as const,
    applicationValue: "careers@innovatesa.com",
    status: "active" as const,
    isFeatured: true,
    sponsored: true,
    views: 156,
    applications: 15,
    employerId: "emp3"
  },
  {
    id: "4",
    title: "DevOps Engineer",
    company: "CloudTech Ghana",
    logo: "/placeholder.svg",
    location: "Accra, Ghana",
    salary: {
      min: 75000,
      max: 110000,
      currency: "USD"
    },
    description: "Help us build and maintain our cloud infrastructure and deployment pipelines.",
    requirements: ["Docker", "Kubernetes", "AWS", "Terraform"],
    postedDate: "2024-01-12",
    employmentType: "Full-time" as const,
    experienceLevel: "Senior" as const,
    visaSponsorship: false,
    companySize: "Medium" as const,
    techStack: ["Docker", "Kubernetes", "AWS", "Terraform", "Jenkins"],
    remote: false,
    applicationType: "phone" as const,
    applicationValue: "+233-24-123-4567",
    status: "active" as const,
    isFeatured: false,
    sponsored: false,
    views: 203,
    applications: 9,
    employerId: "emp4"
  },
  {
    id: "5",
    title: "Data Scientist",
    company: "DataInsights Egypt",
    logo: "/placeholder.svg",
    location: "Cairo, Egypt",
    salary: {
      min: 65000,
      max: 95000,
      currency: "USD"
    },
    description: "Join our data science team to extract insights from large datasets and build predictive models.",
    requirements: ["Python", "R", "Machine Learning", "SQL"],
    postedDate: "2024-01-11",
    employmentType: "Full-time" as const,
    experienceLevel: "Mid-level" as const,
    visaSponsorship: true,
    companySize: "Large" as const,
    techStack: ["Python", "R", "TensorFlow", "Pandas", "SQL"],
    remote: true,
    applicationType: "internal" as const,
    applicationValue: undefined,
    status: "active" as const,
    isFeatured: true,
    sponsored: true,
    views: 178,
    applications: 11,
    employerId: "emp5"
  },
  {
    id: "6",
    title: "UI/UX Designer",
    company: "DesignStudio Morocco",
    logo: "/placeholder.svg",
    location: "Casablanca, Morocco",
    salary: {
      min: 45000,
      max: 70000,
      currency: "USD"
    },
    description: "Create beautiful and intuitive user interfaces and experiences for our digital products.",
    requirements: ["Figma", "Adobe Creative Suite", "Prototyping", "User Research"],
    postedDate: "2024-01-10",
    employmentType: "Contract" as const,
    experienceLevel: "Mid-level" as const,
    visaSponsorship: false,
    companySize: "Small" as const,
    techStack: ["Figma", "Adobe XD", "Sketch", "InVision", "Principle"],
    remote: true,
    applicationType: "external" as const,
    applicationValue: "https://designstudio.ma/careers/ux-designer",
    status: "active" as const,
    isFeatured: false,
    sponsored: false,
    views: 145,
    applications: 7,
    employerId: "emp6"
  },
  {
    id: "7",
    title: "Full Stack Developer",
    company: "TechSolutions Tunisia",
    logo: "/placeholder.svg",
    location: "Tunis, Tunisia",
    salary: {
      min: 55000,
      max: 85000,
      currency: "USD"
    },
    description: "We're looking for a versatile full stack developer to work on various web applications.",
    requirements: ["JavaScript", "React", "Node.js", "MongoDB"],
    postedDate: "2024-01-09",
    employmentType: "Full-time" as const,
    experienceLevel: "Entry-level" as const,
    visaSponsorship: true,
    companySize: "Medium" as const,
    techStack: ["JavaScript", "React", "Node.js", "MongoDB", "Express"],
    remote: false,
    applicationType: "email" as const,
    applicationValue: "jobs@techsolutions.tn",
    status: "active" as const,
    isFeatured: false,
    sponsored: false,
    views: 167,
    applications: 13,
    employerId: "emp7"
  }
];

export const currencies: { [key: string]: { symbol: string, name: string } } = {
  USD: { symbol: "$", name: "US Dollar" },
  EUR: { symbol: "€", name: "Euro" },
  GBP: { symbol: "£", name: "British Pound" },
  JPY: { symbol: "¥", name: "Japanese Yen" },
  CAD: { symbol: "C$", name: "Canadian Dollar" },
  AUD: { symbol: "A$", name: "Australian Dollar" },
  INR: { symbol: "₹", name: "Indian Rupee" },
  NGN: { symbol: "₦", name: "Nigerian Naira" },
};

export function formatSalary(min: number, max: number, currencyCode: string): string {
  const currency = currencies[currencyCode] || { symbol: currencyCode, name: currencyCode };
  return `${currency.symbol}${min.toLocaleString()} - ${currency.symbol}${max.toLocaleString()}`;
}

// Enhanced currency-aware salary formatting
export function formatSalaryWithConversion(
  min: number, 
  max: number, 
  originalCurrency: string,
  targetCurrency: string,
  convertAmount: (amount: number, from: string, to?: string) => number,
  showOriginal: boolean = false
): string {
  const convertedMin = convertAmount(min, originalCurrency, targetCurrency);
  const convertedMax = convertAmount(max, originalCurrency, targetCurrency);
  
  const targetCurrencyData = currencies[targetCurrency] || { symbol: targetCurrency, name: targetCurrency };
  const convertedRange = `${targetCurrencyData.symbol}${convertedMin.toLocaleString()} - ${targetCurrencyData.symbol}${convertedMax.toLocaleString()}`;
  
  if (showOriginal && originalCurrency !== targetCurrency) {
    const originalCurrencyData = currencies[originalCurrency] || { symbol: originalCurrency, name: originalCurrency };
    const originalRange = `${originalCurrencyData.symbol}${min.toLocaleString()} - ${originalCurrencyData.symbol}${max.toLocaleString()}`;
    return `${convertedRange} (~${originalRange} ${originalCurrency})`;
  }
  
  return convertedRange;
}

export function getTimeAgo(dateString: string): string {
  const now = new Date();
  const postedDate = new Date(dateString);
  const diffInMs = now.getTime() - postedDate.getTime();
  
  const diffInSecs = Math.floor(diffInMs / 1000);
  const diffInMins = Math.floor(diffInSecs / 60);
  const diffInHours = Math.floor(diffInMins / 60);
  const diffInDays = Math.floor(diffInHours / 24);
  
  if (diffInDays > 0) {
    return diffInDays === 1 ? "1 day ago" : `${diffInDays} days ago`;
  } else if (diffInHours > 0) {
    return diffInHours === 1 ? "1 hour ago" : `${diffInHours} hours ago`;
  } else if (diffInMins > 0) {
    return diffInMins === 1 ? "1 minute ago" : `${diffInMins} minutes ago`;
  } else {
    return "Just now";
  }
}
