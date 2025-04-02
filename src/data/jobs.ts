
import { Job } from "../types";

export const jobs: Job[] = [
  {
    id: "1",
    title: "Senior Frontend Developer",
    company: "TechCorp",
    logo: "/placeholder.svg",
    location: "Remote (US)",
    salary: {
      min: 120000,
      max: 150000,
      currency: "USD",
    },
    description: "TechCorp is looking for a Senior Frontend Developer to join our team. You will be responsible for building and maintaining our web applications.",
    requirements: [
      "5+ years of experience with React",
      "Experience with TypeScript",
      "Strong understanding of web fundamentals",
    ],
    postedDate: "2023-06-15T10:30:00",
    employmentType: "Full-time",
    experienceLevel: "Senior",
    visaSponsorship: true,
    companySize: "Medium",
    techStack: ["React", "TypeScript", "Next.js", "Tailwind CSS"],
    remote: true,
  },
  {
    id: "2",
    title: "Backend Engineer",
    company: "CloudSystems",
    logo: "/placeholder.svg",
    location: "Remote (EU)",
    salary: {
      min: 80000,
      max: 110000,
      currency: "EUR",
    },
    description: "Join our backend team to develop scalable, high-performance services that power our cloud platform.",
    requirements: [
      "3+ years of experience with Node.js or Python",
      "Experience with microservices architecture",
      "Knowledge of cloud platforms like AWS or Azure",
    ],
    postedDate: "2023-06-17T14:45:00",
    employmentType: "Full-time",
    experienceLevel: "Mid-level",
    visaSponsorship: false,
    companySize: "Large",
    techStack: ["Node.js", "PostgreSQL", "AWS", "Docker"],
    remote: true,
  },
  {
    id: "3",
    title: "DevOps Engineer",
    company: "InfraInc",
    logo: "/placeholder.svg",
    location: "Remote (Worldwide)",
    salary: {
      min: 90000,
      max: 130000,
      currency: "USD",
    },
    description: "Help us build and maintain our CI/CD pipelines, infrastructure as code, and cloud infrastructure.",
    requirements: [
      "Experience with Kubernetes and Docker",
      "Knowledge of infrastructure as code (Terraform, CloudFormation)",
      "Experience with AWS or GCP",
    ],
    postedDate: "2023-06-18T09:15:00",
    employmentType: "Full-time",
    experienceLevel: "Mid-level",
    visaSponsorship: true,
    companySize: "Small",
    techStack: ["Kubernetes", "Docker", "Terraform", "AWS", "GitHub Actions"],
    remote: true,
  },
  {
    id: "4",
    title: "Product Designer",
    company: "DesignHub",
    logo: "/placeholder.svg",
    location: "Remote (APAC)",
    salary: {
      min: 70000,
      max: 95000,
      currency: "USD",
    },
    description: "Join our product team to create beautiful, user-friendly interfaces for our growing product suite.",
    requirements: [
      "3+ years of experience in product design",
      "Proficiency in Figma or similar design tools",
      "Understanding of user-centered design principles",
    ],
    postedDate: "2023-06-19T11:20:00",
    employmentType: "Full-time",
    experienceLevel: "Mid-level",
    visaSponsorship: false,
    companySize: "Small",
    techStack: ["Figma", "Adobe XD", "Sketch"],
    remote: true,
  },
  {
    id: "5",
    title: "Machine Learning Engineer",
    company: "AI Innovations",
    logo: "/placeholder.svg",
    location: "Remote (US)",
    salary: {
      min: 130000,
      max: 180000,
      currency: "USD",
    },
    description: "Help us build cutting-edge machine learning models to solve complex problems in various domains.",
    requirements: [
      "MS or PhD in Computer Science, Machine Learning, or related field",
      "Experience with PyTorch or TensorFlow",
      "Strong understanding of machine learning algorithms",
    ],
    postedDate: "2023-06-20T16:10:00",
    employmentType: "Full-time",
    experienceLevel: "Senior",
    visaSponsorship: true,
    companySize: "Medium",
    techStack: ["Python", "PyTorch", "TensorFlow", "AWS", "Docker"],
    remote: true,
  },
  {
    id: "6",
    title: "Full Stack Developer",
    company: "WebWorks",
    logo: "/placeholder.svg",
    location: "Remote (Worldwide)",
    salary: {
      min: 85000,
      max: 120000,
      currency: "USD",
    },
    description: "Join our team to work on both frontend and backend aspects of our web applications.",
    requirements: [
      "Experience with React and Node.js",
      "Knowledge of database systems",
      "Understanding of web security principles",
    ],
    postedDate: "2023-06-21T08:30:00",
    employmentType: "Contract",
    experienceLevel: "Mid-level",
    visaSponsorship: false,
    companySize: "Small",
    techStack: ["React", "Node.js", "MongoDB", "Express"],
    remote: true,
  },
  {
    id: "7",
    title: "Data Scientist",
    company: "DataDrive",
    logo: "/placeholder.svg",
    location: "Remote (EU)",
    salary: {
      min: 90000,
      max: 130000,
      currency: "EUR",
    },
    description: "Help us analyze and interpret complex data to drive business decisions and product improvements.",
    requirements: [
      "Strong statistical knowledge",
      "Experience with Python and data analysis libraries",
      "Knowledge of machine learning fundamentals",
    ],
    postedDate: "2023-06-22T13:45:00",
    employmentType: "Full-time",
    experienceLevel: "Senior",
    visaSponsorship: true,
    companySize: "Medium",
    techStack: ["Python", "Pandas", "Scikit-learn", "SQL", "Tableau"],
    remote: true,
  },
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
