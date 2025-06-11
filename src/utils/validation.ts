
import { z } from 'zod';

// Enhanced validation schemas
export const jobFormSchema = z.object({
  title: z.string()
    .min(3, 'Job title must be at least 3 characters')
    .max(100, 'Job title must not exceed 100 characters')
    .regex(/^[a-zA-Z0-9\s\-\.]+$/, 'Job title contains invalid characters'),
  
  company: z.string()
    .min(2, 'Company name must be at least 2 characters')
    .max(100, 'Company name must not exceed 100 characters'),
  
  location: z.string()
    .min(2, 'Location must be at least 2 characters')
    .max(100, 'Location must not exceed 100 characters'),
  
  description: z.string()
    .min(50, 'Job description must be at least 50 characters')
    .max(5000, 'Job description must not exceed 5000 characters'),
  
  salary_min: z.number()
    .min(0, 'Minimum salary must be positive')
    .max(10000000, 'Salary seems unrealistic'),
  
  salary_max: z.number()
    .min(0, 'Maximum salary must be positive')
    .max(10000000, 'Salary seems unrealistic'),
  
  employment_type: z.enum(['full-time', 'part-time', 'contract', 'internship']),
  
  experience_level: z.enum(['entry', 'mid', 'senior', 'lead', 'executive']),
  
  tech_stack: z.array(z.string()).min(1, 'At least one skill is required').max(20, 'Too many skills'),
  
  remote: z.boolean(),
  
  visa_sponsorship: z.boolean()
}).refine((data) => data.salary_max >= data.salary_min, {
  message: 'Maximum salary must be greater than or equal to minimum salary',
  path: ['salary_max']
});

export const profileUpdateSchema = z.object({
  full_name: z.string()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name must not exceed 100 characters')
    .regex(/^[a-zA-Z\s\-\.]+$/, 'Name contains invalid characters'),
  
  phone: z.string()
    .regex(/^\+?[\d\s\-\(\)]+$/, 'Invalid phone number format')
    .optional()
    .or(z.literal('')),
  
  location: z.string()
    .max(100, 'Location must not exceed 100 characters')
    .optional()
    .or(z.literal('')),
  
  website: z.string()
    .url('Invalid website URL')
    .optional()
    .or(z.literal('')),
  
  bio: z.string()
    .max(1000, 'Bio must not exceed 1000 characters')
    .optional()
    .or(z.literal(''))
});

// Rate limiting helper
export const createRateLimit = (requests: number, windowMs: number) => {
  const requests_map = new Map();
  
  return (identifier: string): boolean => {
    const now = Date.now();
    const windowStart = now - windowMs;
    
    if (!requests_map.has(identifier)) {
      requests_map.set(identifier, []);
    }
    
    const timestamps = requests_map.get(identifier).filter((time: number) => time > windowStart);
    
    if (timestamps.length >= requests) {
      return false;
    }
    
    timestamps.push(now);
    requests_map.set(identifier, timestamps);
    return true;
  };
};

// Input sanitization
export const sanitizeInput = (input: string): string => {
  return input
    .replace(/[<>]/g, '') // Remove potential HTML tags
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+=/gi, '') // Remove event handlers
    .trim()
    .slice(0, 10000); // Limit length
};

export const sanitizeHtml = (html: string): string => {
  return html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+="[^"]*"/g, '')
    .replace(/on\w+='[^']*'/g, '');
};
