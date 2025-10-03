# CV Tailoring System - Complete Testing Guide

## 🎯 System Status: FIXED & READY FOR TESTING

### Changes Made:
1. ✅ Fixed syntax error (duplicate `candidateName` declaration)
2. ✅ Enhanced CORS headers with explicit methods
3. ✅ Added comprehensive logging for debugging
4. ✅ Set function to public mode for testing (verify_jwt = false)
5. ✅ Created comprehensive test suite

---

## 🧪 Quick Test Instructions

### Option 1: Automated Test Suite (RECOMMENDED)
1. Open `cv-tailoring-comprehensive-test.html` in your browser
2. Click "🚀 Run All Tests"
3. Wait for all 12 tests to complete
4. Review results (Expected: 12/12 ✅ PASS)

### Option 2: Manual Testing via Application
1. Go to https://africantechjobs.co.uk
2. Log in as a candidate
3. Navigate to "Tailored Resumes" section
4. Upload a CV file (PDF, DOCX, or TXT)
5. Select a job from the list
6. Click "Tailor My CV"
7. Verify:
   - No "Failed to send request" error
   - Processing completes successfully
   - Tailored CV is generated with score ≥80
   - Download button works
   - PDF is stored in database

### Option 3: Direct API Test (cURL)

**Test 1: JSON Payload**
```bash
curl -X POST https://mmbrvcndxhipaoxysvwr.supabase.co/functions/v1/tailor-cv \
  -H "Content-Type: application/json" \
  -H "apikey: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1tYnJ2Y25keGhpcGFveHlzdndyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDYyNzE2NDcsImV4cCI6MjA2MTg0NzY0N30.VWBmdbI7lMzHaaXl6ASJnc2116YnHm0WLHE0bkfW870" \
  -d '{
    "resumeContent": "John Doe\nSoftware Engineer\n\nExperience:\n- 5 years React development\n- Built scalable applications",
    "jobDescription": "Looking for a React developer with strong JavaScript skills",
    "jobTitle": "React Developer",
    "companyName": "TechCorp"
  }'
```

**Test 2: CORS Preflight**
```bash
curl -X OPTIONS https://mmbrvcndxhipaoxysvwr.supabase.co/functions/v1/tailor-cv \
  -H "Access-Control-Request-Method: POST" \
  -H "Access-Control-Request-Headers: content-type" \
  -v
```

---

## 📋 Test Checklist (13 Tests)

### Section 1: Edge Function Deployment (3 tests)
- [ ] 1.1 - Function endpoint reachable
- [ ] 1.2 - CORS preflight works
- [ ] 1.3 - Method validation (rejects GET, accepts POST)

### Section 2: CV Tailoring Functionality (6 tests)
- [ ] 2.1 - JSON payload processing
- [ ] 2.2 - File upload (FormData)
- [ ] 2.3 - Structure preservation (name, email, phone)
- [ ] 2.4 - Keyword integration (job-specific terms)
- [ ] 2.5 - PDF generation (download URL)
- [ ] 2.6 - Quality score ≥80

### Section 3: Error Handling (3 tests)
- [ ] 3.1 - Invalid format handling
- [ ] 3.2 - Empty content enhancement
- [ ] 3.3 - Large file processing

### Section 4: Job Upload & Approval (1 test - regression)
- [ ] 4.1 - CSV upload still works correctly

---

## 🔍 Debugging Edge Function Issues

### View Logs
1. Go to: https://supabase.com/dashboard/project/mmbrvcndxhipaoxysvwr/functions/tailor-cv/logs
2. Look for error messages with timestamps
3. Check for:
   - `worker boot error` → Syntax errors in code
   - `❌ [REQUEST_ID]` → Runtime errors
   - CORS errors → Missing/incorrect headers
   - 404 errors → Function not deployed

### Common Issues & Solutions

**Issue: "Failed to send request to Edge Function"**
- **Cause**: Function deployment failed or CORS issue
- **Fix**: Check logs for `worker boot error`, redeploy function
- **Verify**: Run CORS preflight test (Option 3, Test 2)

**Issue: "worker boot error: Identifier 'candidateName' has already been declared"**
- **Cause**: Duplicate variable declaration (NOW FIXED)
- **Fix**: Already resolved in latest code
- **Verify**: Check function logs for successful boot

**Issue: Request hangs or times out**
- **Cause**: Long processing time or infinite loop
- **Fix**: Check logs for where it's stuck, verify timeout handling
- **Verify**: Test with small CV first

**Issue: Score = 0 or empty content**
- **Cause**: AI processing failed or content extraction issue
- **Fix**: Check logs for AI errors, verify OpenAI API key
- **Verify**: Test with plain text input first

---

## 🎯 Expected Results

### All Tests PASS (13/13 ✅)
```
Section 1: Edge Function Deployment
  ✅ 1.1 - Endpoint reachable
  ✅ 1.2 - CORS headers present
  ✅ 1.3 - Method validation working

Section 2: CV Tailoring Functionality
  ✅ 2.1 - JSON processing successful
  ✅ 2.2 - File upload successful
  ✅ 2.3 - Structure preserved
  ✅ 2.4 - Keywords integrated
  ✅ 2.5 - PDF generated
  ✅ 2.6 - Quality score ≥80

Section 3: Error Handling
  ✅ 3.1 - Invalid format handled
  ✅ 3.2 - Empty content enhanced
  ✅ 3.3 - Large file processed

Final Score: 13/13 (100%) ✅
```

### Sample Successful Response
```json
{
  "success": true,
  "tailoredContent": "John Doe\nSoftware Engineer\n...",
  "score": 85,
  "downloadUrl": "https://mmbrvcndxhipaoxysvwr.supabase.co/storage/v1/object/public/tailored-resumes/...",
  "tailoredResumeId": "uuid-here",
  "requestId": "abc123",
  "timestamp": "2025-10-03T07:30:00.000Z"
}
```

---

## 🚀 Production Readiness Checklist

Before going live:
- [ ] All 13 tests pass
- [ ] No errors in function logs
- [ ] CORS works from africantechjobs.co.uk domain
- [ ] Re-enable JWT verification (`verify_jwt = true`)
- [ ] Test with authenticated users
- [ ] Verify storage buckets have correct RLS policies
- [ ] Test edge cases (corrupted files, huge files, empty content)
- [ ] Monitor function execution time (should be <120s)
- [ ] Verify OpenAI API usage and costs

---

## 📞 Support & Troubleshooting

If tests fail after following this guide:
1. Check function logs: [Edge Function Logs](https://supabase.com/dashboard/project/mmbrvcndxhipaoxysvwr/functions/tailor-cv/logs)
2. Review error messages in test suite
3. Verify all environment variables are set (OPENAI_API_KEY)
4. Check Supabase project status (not paused)
5. Ensure storage buckets exist and have correct policies

---

## ✅ Summary

The CV Tailoring system has been fixed and is now ready for comprehensive testing. The main issues resolved were:
1. Syntax error causing deployment failure
2. CORS configuration improved
3. Better error handling and logging
4. Comprehensive test suite created

**Next Step**: Run the comprehensive test suite and verify all tests pass.
