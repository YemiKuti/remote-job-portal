# CV Tailoring Tool - End-to-End Test Instructions

## 🎯 Overview

This comprehensive test suite validates the CV Tailoring Tool functionality end-to-end, including:
- Valid CV tailoring scenarios (Marketing, Data Science, Generic)
- Error handling with malformed inputs
- Output quality and structure validation
- Performance and user experience testing

## 📋 Prerequisites

1. **Application Access**: Ensure you're signed into the job board application
2. **Browser**: Use Chrome/Firefox with console access
3. **Network**: Stable internet connection for API calls
4. **Permissions**: Candidate/user account (not admin required)

## 🚀 Quick Start (2-Minute Test)

### Option A: Browser Console
1. Open browser console (F12)
2. Copy and paste `cv-tailoring-e2e-test.js` content
3. Run: `runE2ETests()`
4. Wait for completion and review results

### Option B: Test Runner Interface
1. Open `cv-tailoring-test-runner.html` in browser
2. Check authentication status
3. Click "Run All E2E Tests"
4. Download generated report

## 📝 Detailed Test Execution

### Step 1: Load Test Suite
```javascript
// Copy entire cv-tailoring-e2e-test.js content into browser console
// This loads the test functions and sample data
```

### Step 2: Execute Tests
```javascript
// Run all tests
const results = await runE2ETests();

// Or run specific test types
const validResults = await runValidTests();
const errorResults = await runErrorTests();
```

### Step 3: Generate Report
```javascript
// Generate formatted report
const report = generateTestReport(results);
console.log(report);
```

## 🧪 Test Cases Included

### Valid Input Tests
1. **Marketing CV → Marketing Job**
   - Well-structured resume with marketing experience
   - Senior Digital Marketing Manager position
   - Expected: 85%+ quality score, proper keyword integration

2. **Data Science CV → Data Analytics Job**
   - Technical resume with analytics background  
   - Marketing Data Analyst position
   - Expected: 80%+ quality score, technical skills highlighted

3. **Generic CV → Generic Job**
   - Basic resume with minimal formatting
   - Generic marketing position
   - Expected: 70%+ quality score, structure improvement

### Error Handling Tests
1. **Binary/Invalid Content**
   - Resume with binary characters and encoding issues
   - Expected: 400 status with user-friendly error message

2. **Empty Content**
   - Missing resume or job description
   - Expected: 400 status with validation error

3. **Size Limits**
   - Extremely large CV content (50KB+)
   - Expected: 400 status with size limit error

## ✅ Acceptance Criteria

### Functional Requirements
- [ ] All 3 valid test cases return 200 status
- [ ] Generated CVs have proper structure (Contact, Summary, Experience, Education, Skills)
- [ ] Quality scores meet minimum thresholds (70%+)
- [ ] Keywords integrated naturally into content
- [ ] Achievement statements quantified and impactful

### Error Handling Requirements  
- [ ] Malformed inputs return 4xx status codes
- [ ] Error messages are user-friendly (no technical details)
- [ ] System handles edge cases gracefully
- [ ] No 5xx server errors on predictable bad inputs

### Performance Requirements
- [ ] Processing time under 30 seconds per request
- [ ] Consistent response times across test runs
- [ ] No memory leaks or timeout issues

### Output Quality Requirements
- [ ] Generated CVs are 1000+ characters (download-ready)
- [ ] Professional formatting and structure
- [ ] Natural language flow (not keyword stuffed)
- [ ] Industry-appropriate terminology

## 📊 Interpreting Results

### Success Indicators
```
✅ SUCCESS (200) - Duration: 12000ms
📊 Quality Score: 87% (Expected: 85%+)
📝 Output Length: 2847 characters
📋 Structure Check:
   Contact Info: ✅
   Summary: ✅
   Experience: ✅
   Skills: ✅
   Education: ✅
   Structure Score: 5/5 sections
🎯 PASS: Score meets expectations
```

### Error Indicators
```
❌ FAILED (400) - Request size too large. Please provide smaller resume.
🔍 Request ID: abc123-def456-ghi789
```

### Performance Benchmarks
- **Small Resume (2KB)**: 8-15 seconds
- **Medium Resume (5KB)**: 12-20 seconds  
- **Large Resume (15KB)**: 18-30 seconds
- **Oversized (50KB+)**: Immediate rejection

## 🔧 Troubleshooting

### Common Issues

1. **Authentication Errors**
   ```
   ❌ Not authenticated - please sign in to the application
   ```
   **Solution**: Sign into the job board application in the same browser

2. **Function Not Available**
   ```
   ❌ runE2ETests is not defined
   ```
   **Solution**: Ensure test script is properly loaded in console

3. **Network Errors**
   ```
   💥 ERROR: Failed to fetch
   ```
   **Solution**: Check internet connection and try again

4. **Timeout Issues**
   ```
   ❌ Request timeout after 90s
   ```
   **Solution**: Try with smaller resume content or check server status

### Debug Information

Each test includes detailed logging:
- Request ID for tracking issues
- Processing duration for performance analysis  
- Input sizes for optimization insights
- Structured error messages for troubleshooting

## 📄 Sample Test Data

The test suite includes realistic sample data:

### Test Candidate Profile
- **Name**: Sarah Martinez  
- **Experience**: 3 marketing roles (intern → coordinator → manager)
- **Education**: UC Berkeley Marketing degree
- **Skills**: 12 marketing and technical skills

### CV Variations
1. **Professional**: Well-formatted with quantified achievements
2. **Technical**: Analytics-focused with technical skills
3. **Basic**: Minimal formatting, needs improvement

### Job Descriptions
1. **Marketing**: Senior Digital Marketing Manager role
2. **Data**: Marketing Data Analyst position  
3. **Generic**: Basic marketing professional role

## 🎉 Success Criteria Summary

**PASS Conditions:**
- All valid tests return 200 status with quality score 70%+
- Error tests return appropriate 4xx codes with helpful messages
- Generated CVs have complete structure (5/5 sections)
- Processing completes within 30 seconds
- Output is professional and download-ready

**FAIL Conditions:**
- Any 5xx server errors on valid inputs
- Quality scores below 70% threshold
- Missing required CV sections (contact, summary, experience)
- Processing timeouts or system crashes
- Unclear or technical error messages

## 📞 Support

If tests fail consistently:
1. Check the CV Tailoring Debug Report for system status
2. Verify OpenAI API key configuration
3. Review edge function logs for detailed error information
4. Contact development team with Request IDs from failed tests

---

**Last Updated**: 2025-09-05  
**Test Suite Version**: 1.0  
**Compatible With**: Production CV Tailoring Edge Function