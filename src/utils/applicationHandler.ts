
import { Job } from '@/types';

export const handleJobApplication = (job: Job) => {
  switch (job.applicationType) {
    case 'external':
      if (job.applicationValue) {
        window.open(job.applicationValue, '_blank');
      } else {
        console.error('External application URL not provided');
      }
      break;
    
    case 'email':
      if (job.applicationValue) {
        const subject = encodeURIComponent(`Application for ${job.title} at ${job.company}`);
        const body = encodeURIComponent(`Dear Hiring Manager,\n\nI am interested in applying for the ${job.title} position at ${job.company}.\n\nBest regards`);
        window.location.href = `mailto:${job.applicationValue}?subject=${subject}&body=${body}`;
      } else {
        console.error('Email address not provided');
      }
      break;
    
    case 'phone':
      if (job.applicationValue) {
        window.location.href = `tel:${job.applicationValue}`;
      } else {
        console.error('Phone number not provided');
      }
      break;
    
    case 'internal':
    default:
      // Return true to indicate internal application should be handled
      return true;
  }
  
  return false;
};

export const getApplicationButtonText = (applicationType: 'internal' | 'external' | 'email' | 'phone'): string => {
  switch (applicationType) {
    case 'external':
      return 'Apply on Company Site';
    case 'email':
      return 'Send Email';
    case 'phone':
      return 'Call to Apply';
    case 'internal':
    default:
      return 'Apply Now';
  }
};

export const getApplicationInstructions = (job: Job): string => {
  switch (job.applicationType) {
    case 'external':
      return `Click the button below to apply directly on ${job.company}'s website.`;
    case 'email':
      return `Send your application via email to: ${job.applicationValue || 'the provided email address'}`;
    case 'phone':
      return `Call ${job.applicationValue || 'the provided phone number'} to apply for this position.`;
    case 'internal':
    default:
      return 'Submit your application through our platform using the form below.';
  }
};
