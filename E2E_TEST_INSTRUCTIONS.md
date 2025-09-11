# End-to-End Testing Instructions

## 🧪 **STEP-BY-STEP TESTING GUIDE**

### **Test 1: CSV Job Upload & Admin Approval**

1. **Navigate to Admin Dashboard**
   - Go to `/admin/jobs`
   - You should see a tabbed interface: "Approval Queue" and "All Jobs"

2. **Upload Test CSV**
   - Click "Bulk Upload CSV" button
   - Upload the `E2E_TEST_DATA.csv` file (contains 3 jobs with different emails)
   - Wait for upload success message

3. **Verify Pending Status**
   - Go to "Approval Queue" tab
   - ✅ **VERIFY**: 3 jobs appear with "Pending Approval" status
   - ✅ **VERIFY**: Each job shows different company and email
   - ✅ **VERIFY**: Job descriptions preserve line breaks and bullet points

4. **Approve One Job**
   - Click "Approve" on the "Senior React Developer" job
   - Add approval note: "Approved for immediate posting"
   - Confirm approval

5. **Check Job Status**
   - Go to "All Jobs" tab  
   - ✅ **VERIFY**: Approved job shows "Active" status
   - ✅ **VERIFY**: Other 2 jobs remain in "Approval Queue" as pending

---

### **Test 2: Content Formatting Verification**

1. **View Live Job Posting**
   - Navigate to main jobs page `/jobs`
   - Find the approved "Senior React Developer" job
   - ✅ **VERIFY**: Job description shows proper formatting:
     - Bullet points display correctly
     - Line breaks are preserved  
     - Emojis and symbols render properly
     - Sections are clearly separated

2. **Screenshot Required**: Job listing with clean formatting

---

### **Test 3: Email Verification**

1. **Check Apply Button**
   - Click on the approved job to view details
   - Look for "Apply" or contact information
   - ✅ **VERIFY**: Email shows `sarah.johnson@techflow.com`
   - ✅ **VERIFY**: Clicking opens mailto with correct address

2. **Admin Panel Email Check**
   - Return to `/admin/jobs` → "All Jobs" tab
   - ✅ **VERIFY**: "Contact" column shows correct job-specific emails
   - No generic "Send Email" placeholders

---

### **Test 4: CV Tailoring Success Test**

1. **Navigate to CV Tailoring**
   - Go to candidate dashboard or `/candidate/tailored-resumes`
   - Click "Create Tailored Resume" tab

2. **Upload Resume**
   - Upload the `SAMPLE_RESUME.txt` file
   - ✅ **VERIFY**: File uploads successfully with progress indicator
   - ✅ **VERIFY**: Resume appears in selection list

3. **Select Job for Tailoring**
   - Choose the approved "Senior React Developer" job
   - Or paste the job description manually
   - Click "Continue to AI Analysis"

4. **Generate Tailored CV**
   - Click "Start AI Analysis" 
   - ✅ **VERIFY**: Progress bar shows analysis in progress
   - ✅ **VERIFY**: Tailored CV generates successfully (no errors)
   - ✅ **VERIFY**: Output contains structured resume content
   - ✅ **VERIFY**: Match score is displayed

5. **Screenshot Required**: Successful tailored CV output page

---

### **Test 5: Error Handling Verification**

1. **Upload Invalid File**
   - Try to upload `CORRUPTED_TEST.txt` (empty file)
   - ✅ **VERIFY**: Clear error message appears
   - Expected message: "File is too small. Please upload a resume with more content."

2. **Try Unsupported Format**
   - Try uploading a .jpg or .png file
   - ✅ **VERIFY**: Error message: "Please upload a PDF, DOC, DOCX, or TXT file."

3. **Test File Size Limit**
   - Try uploading a very large file (>10MB)
   - ✅ **VERIFY**: Error message about file size limit

---

### **Test 6: Final System Verification**

✅ **Complete Checklist**:
- [ ] CSV uploads create pending jobs (not live)
- [ ] Admin can approve/reject with confirmation dialogs  
- [ ] Approved jobs go live with proper formatting
- [ ] Job-specific emails are correctly mapped and displayed
- [ ] CV tailoring works with PDF/DOCX/TXT files
- [ ] Clear error messages for invalid uploads
- [ ] Loading states and progress indicators work
- [ ] No console errors during normal operation

---

## 📸 **REQUIRED SCREENSHOTS**

Please take screenshots of:

1. **Admin Approval Queue** - showing 2+ pending jobs
2. **Live Job Listing** - approved job with clean formatting  
3. **Correct Apply Email** - showing job-specific email address
4. **Successful CV Tailoring** - generated tailored resume output
5. **Error Handling** - clear error message for invalid file

---

## 🚨 **If Any Test Fails**

1. **Clear browser cache** (Ctrl+F5)
2. **Check console for errors** (F12 → Console tab)
3. **Verify admin permissions** are properly set
4. **Try different browsers** (Chrome, Firefox, Safari)
5. **Check network requests** for failed API calls

---

## 💡 **Success Criteria**

✅ All tests pass = **System is production ready**
❌ Any test fails = **Additional fixes needed**

The system should handle the complete workflow: CSV Upload → Admin Approval → Live Publishing → CV Tailoring without errors.