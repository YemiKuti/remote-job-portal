# CV Tailoring Tool Configuration Guide

## Overview

The AI CV Tailoring Tool has been updated to work without dependency on Supabase Edge Functions. It now uses a configurable endpoint that can be easily switched between testing and production.

## Configuration

The endpoint is configured in `src/config/api.ts`:

```typescript
export const CV_TAILORING_ENDPOINT = 
  import.meta.env.VITE_CV_TAILORING_ENDPOINT || 
  'https://httpbin.org/post';
```

### Current Setup (Testing Mode)

By default, the tool uses `https://httpbin.org/post` which is a public testing endpoint that:
- ✅ Accepts POST requests
- ✅ Returns the sent data
- ✅ Validates that file upload and form data are working correctly
- ✅ Shows a mock success response

### Switching to Production

To switch to your production API endpoint, you have two options:

#### Option 1: Environment Variable (Recommended)

Create a `.env` file in the project root:

```env
VITE_CV_TAILORING_ENDPOINT=https://your-api.com/api/tailor-cv
```

#### Option 2: Direct Configuration

Edit `src/config/api.ts`:

```typescript
export const CV_TAILORING_ENDPOINT = 'https://your-api.com/api/tailor-cv';
```

## What Gets Sent

The tool sends a POST request with the following data:

### For File Uploads (FormData)
```
- file: Resume file (PDF/DOCX/DOC/TXT)
- jobTitle: Job position title
- companyName: Company name
- jobDescription: Full job description
- userId: User ID (if available)
```

### For JSON Payloads
```json
{
  "resumeContent": "Full resume text content",
  "jobDescription": "Full job description",
  "jobTitle": "Job position title",
  "companyName": "Company name",
  "candidateData": { /* optional candidate data */ },
  "jobRequirements": ["requirement1", "requirement2"],
  "userId": "user-id"
}
```

## Expected Response Format

Your production API should return a JSON response in this format:

```json
{
  "success": true,
  "tailoredResume": "Full tailored resume content in plain text or HTML",
  "score": 85,
  "analysis": {
    "skillsMatched": 8,
    "requiredSkills": 10,
    "candidateSkills": ["React", "TypeScript", "Node.js"],
    "experienceLevel": "Mid-level",
    "hasCareerProfile": true,
    "hasContactInfo": true
  },
  "suggestions": {
    "keywordsMatched": 12,
    "totalKeywords": 15,
    "recommendations": [
      "Add more quantifiable achievements",
      "Emphasize leadership experience"
    ]
  }
}
```

### Error Response Format

For errors, return:

```json
{
  "success": false,
  "error": "Error message to display to user"
}
```

## Features

### ✅ Implemented Features

1. **File Upload Validation**
   - File size check (max 10MB)
   - Format validation (PDF, DOCX, DOC, TXT)
   - Empty file detection

2. **Progress Bar**
   - Visual feedback during upload
   - Progress updates during retries

3. **Retry Logic**
   - Exponential backoff
   - Maximum 3 attempts
   - Network error detection

4. **Error Handling**
   - Clear error messages
   - Missing field detection
   - Network failure handling

5. **Timeout Protection**
   - 30-second timeout
   - Automatic abort on timeout

### Success Messages

- ✅ "Resume uploaded successfully. Tailoring process started." (on success)
- ⚠️ "Unable to connect to the server. Please try again later." (on failure)

## Testing

### Testing with httpbin.org

The current setup uses httpbin.org which will:
1. Accept your POST request
2. Echo back the sent data
3. Return a mock success response

You can verify:
- File uploads are working
- Form data is being sent correctly
- Error handling is functioning
- Progress bar updates correctly

### Testing with Your API

Once you've configured your production endpoint:

1. Test file upload:
   - Upload a PDF/DOCX resume
   - Check the network tab to see the request
   - Verify the response matches expected format

2. Test JSON payload:
   - Use a pre-existing resume
   - Check that all fields are sent correctly

3. Test error handling:
   - Temporarily use an invalid URL
   - Verify error message displays correctly

## Components Modified

The following components now use the new configuration:

1. `src/utils/edgeFunctionUtils.ts` - Main API call utility
2. `src/config/api.ts` - Configuration file
3. `src/components/cv/TailoredCVWorkflow.tsx` - Workflow component
4. `src/components/cv/DirectCVTailoringDialog.tsx` - Direct upload dialog

## Reconnecting to Supabase (Future)

If you want to reconnect to Supabase Edge Functions later:

1. Update the endpoint in `.env`:
   ```env
   VITE_CV_TAILORING_ENDPOINT=https://your-project.supabase.co/functions/v1/tailor-cv
   ```

2. Add authentication header in `edgeFunctionUtils.ts`:
   ```typescript
   headers['Authorization'] = `Bearer ${supabaseAnonKey}`;
   ```

## Troubleshooting

### Issue: "Unable to connect to the server"
- Check that the endpoint URL is correct
- Verify the server is running and accessible
- Check CORS settings on your API

### Issue: "Request timed out"
- API might be taking too long (>30 seconds)
- Consider increasing timeout in `src/config/api.ts`
- Optimize your API response time

### Issue: File not uploading
- Check file size (<10MB)
- Verify file format (PDF, DOCX, DOC, TXT)
- Check network tab for actual error

## Support

For issues or questions:
1. Check console logs (they're very detailed)
2. Check network tab in browser dev tools
3. Review error messages in the UI
