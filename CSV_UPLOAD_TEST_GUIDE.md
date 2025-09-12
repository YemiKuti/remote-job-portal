# CSV Upload & Admin Approval Test Guide

## 🎯 Test Objective
Verify that CSV/XLSX uploaded jobs require admin approval before going live.

## 📋 Test Steps

### Step 1: Upload Test CSV
1. Navigate to `/admin/jobs`
2. Click "Bulk Upload CSV" button
3. Upload the `E2E_CSV_TEST_DATA.csv` file
4. Follow the mapping wizard to process the 3 jobs
5. Complete the upload process

**Expected Result:** All 3 jobs should be uploaded successfully

### Step 2: Verify Pending Status
1. In Admin Dashboard, go to "Approval Queue" tab
2. Confirm you see all 3 jobs in pending status:
   - Software Engineer at TechCorp Inc
   - Marketing Manager at GrowthCo LLC  
   - Data Analyst at DataInsights Corp

**Expected Result:** Jobs appear with "Pending Approval" badges, not live yet

### Step 3: Check Frontend (Jobs Not Live)
1. Navigate to `/jobs` (public job browse page)
2. Search for the uploaded companies: "TechCorp", "GrowthCo", "DataInsights"

**Expected Result:** None of the uploaded jobs should appear in public job listings

### Step 4: Approve One Job
1. Return to `/admin/jobs` → "Approval Queue"
2. Click "Approve" on the "Software Engineer" job
3. Add approval reason (optional): "Complete job posting with all required details"
4. Click "Approve Job"

**Expected Result:** 
- Job disappears from approval queue
- Success message appears
- Only 2 jobs remain in pending status

### Step 5: Verify Approved Job Goes Live
1. Navigate to `/jobs` (public job browse page)  
2. Search for "TechCorp" or "Software Engineer"

**Expected Result:** The approved Software Engineer job now appears in public listings

### Step 6: Verify Other Jobs Stay Pending
1. Search for "GrowthCo" and "DataInsights" on public job page

**Expected Result:** These jobs should NOT appear in public listings

### Step 7: Test Reject Functionality (Optional)
1. Return to `/admin/jobs` → "Approval Queue"
2. Click "Reject" on the "Marketing Manager" job
3. Add rejection reason: "Job description needs more specific requirements"
4. Click "Reject Job"

**Expected Result:**
- Job moves to draft status
- Only 1 job remains in approval queue (Data Analyst)

## ✅ Success Criteria

- [ ] CSV upload creates jobs in "pending" status
- [ ] Pending jobs appear in Admin Approval Queue
- [ ] Pending jobs do NOT appear on public job listings
- [ ] Approved jobs go live and appear on public job listings  
- [ ] Unapproved jobs remain hidden from public
- [ ] Rejection moves jobs back to draft status
- [ ] Admin can review job details before approval

## 🐛 Troubleshooting

If jobs go live immediately after upload:
1. Check job status in database (should be 'pending')
2. Verify RLS policy: only 'active' jobs show publicly
3. Check admin approval functions are working

If approval doesn't work:
1. Check browser console for errors
2. Verify admin permissions
3. Check Supabase function logs

## 📸 Screenshots to Capture

1. Approval Queue with 3 pending jobs
2. Public job page showing no results for pending jobs
3. Approved job appearing in public listings
4. Remaining jobs still in approval queue

This test confirms the complete admin approval workflow is functioning correctly!