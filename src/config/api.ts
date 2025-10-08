// API Configuration
// This file contains the configuration for API endpoints used in the application

/**
 * CV Tailoring API Endpoint
 * Uses Supabase Edge Function for CV tailoring
 */
export const CV_TAILORING_ENDPOINT = 'https://mmbrvcndxhipaoxysvwr.supabase.co/functions/v1/tailor-cv';

/**
 * API Request Timeout (in milliseconds)
 */
export const API_TIMEOUT = 30000; // 30 seconds

/**
 * Whether to use mock responses for testing
 */
export const USE_MOCK_API = import.meta.env.VITE_USE_MOCK_API === 'true';
