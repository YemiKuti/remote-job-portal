
// Re-export all API functions
export * from './api/jobsApi';
export * from './api/conversationsApi';
export * from './api/employerApi';
export * from './api/adminApi';

// Export candidate API functions with explicit names to avoid conflicts
export {
  fetchCandidateApplications,
  fetchSavedJobs,
  toggleSaveJob,
  applyToJob,
  withdrawApplication,
  trackProfileView,
  getProfileViewCount,
  updateCandidateProfile,
  uploadProfilePhoto,
  fetchRecommendedJobs
} from './api/candidateApi';

// Export the new active jobs function
export { fetchActiveJobs } from './api/jobsApi';
