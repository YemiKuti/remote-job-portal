// API Configuration
// This file contains the configuration for API endpoints used in the application

/**
 * CV Tailoring API Endpoint
 * 
 * For testing: Use https://httpbin.org/post (accepts POST and returns sent data)
 * For production: Replace with your actual API endpoint
 * 
 * You can also set this via environment variable:
 * VITE_CV_TAILORING_ENDPOINT=https://your-api.com/tailor
 */
export const CV_TAILORING_ENDPOINT = 
  import.meta.env.VITE_CV_TAILORING_ENDPOINT || 
  'https://httpbin.org/post';

/**
 * API Request Timeout (in milliseconds)
 */
export const API_TIMEOUT = 30000; // 30 seconds

/**
 * Whether to use mock responses for testing
 */
export const USE_MOCK_API = import.meta.env.VITE_USE_MOCK_API === 'true';
