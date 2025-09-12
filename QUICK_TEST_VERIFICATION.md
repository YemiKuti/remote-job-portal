# Quick Test Verification Guide

## 🚀 How to Run Integration Tests

### Prerequisites:
- Admin access to the dashboard
- Access to file upload areas
- Test files available in project root

### Test Sequence (5 minutes total):

## 📋 Test 1: Job Upload & Approval (2 minutes)

1. **Navigate to Admin Dashboard**
   - Go to `/admin` → Jobs section
   - Look for CSV upload option

2. **Upload Test CSV**
   - Upload `COMPREHENSIVE_FIX_TEST.csv`
   - **Expected:** 3 jobs appear with "Draft" status
   - **Screenshot:** Admin dashboard with pending jobs

3. **Approve One Job**
   - Click approve on "Senior Full Stack Developer" 
   - **Expected:** Status changes to "Active"

4. **Check Frontend**
   - Go to main jobs page
   - **Expected:** Only approved job visible
   - **Expected:** Apply button shows `careers@technova.com`
   - **Screenshot:** Live job with correct formatting + email

## 🤖 Test 2: CV Tailoring - Success Case (2 minutes)

1. **Navigate to CV Tailoring**
   - Find CV tailoring section/button
   - Start tailoring workflow

2. **Upload Valid Resume**
   - Upload `SAMPLE_TEST_RESUME.txt`
   - Paste content from `test-job-description-sample.txt`
   - Submit for processing

3. **Verify Results**
   - **Expected:** Match score 80%+ displayed
   - **Expected:** Tailored resume text generated
   - **Expected:** PDF download button appears
   - **Screenshot:** Success screen with download option

## ⚠️ Test 3: CV Tailoring - Error Handling (1 minute)

1. **Upload Invalid File**
   - Upload `CORRUPTED_TEST_FILE.txt`
   - **Expected:** Clear error message appears
   - **Expected:** "Unsupported or corrupted file. Please upload a valid PDF or DOCX."
   - **Screenshot:** Error message display

## ✅ Success Indicators

### Job Upload System Working:
- ✅ CSV uploads without errors
- ✅ Jobs appear as "Draft" initially  
- ✅ Admin can approve jobs
- ✅ Approved jobs go live with formatting
- ✅ Apply emails are job-specific

### CV Tailoring System Working:
- ✅ Valid resumes process successfully
- ✅ Match scores calculated and displayed
- ✅ PDF downloads generated
- ✅ Invalid files show clear error messages
- ✅ No crashes or generic errors

## 🚨 Common Issues & Solutions

### If CSV upload fails:
- Check file format is .csv
- Verify admin permissions
- Look for console errors

### If jobs don't appear as draft:
- Check database `jobs` table
- Verify default status is 'draft'
- Check RLS policies

### If CV tailoring crashes:
- Check edge function logs
- Verify OpenAI API key is set
- Check file size limits

### If error messages aren't clear:
- Check error handling in components
- Verify user-friendly messages vs technical errors

## 📸 Required Screenshots:

1. **Admin Dashboard:** Pending jobs from CSV upload
2. **Live Job Page:** Approved job with correct formatting + email
3. **CV Success:** Match score + PDF download option  
4. **CV Error:** Clear error message for invalid file

## 🎯 Expected Test Duration: 5 minutes total

This verification confirms both systems are production-ready with proper error handling and user experience.