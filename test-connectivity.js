// Supabase Connectivity Test Runner
// Run this in the browser console

async function runSupabaseConnectivityTest() {
    console.log('🚀 Starting Supabase connectivity test...');
    
    // Supabase client configuration from the project
    const SUPABASE_URL = "https://mmbrvcndxhipaoxysvwr.supabase.co";
    const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1tYnJ2Y25keGhpcGFveHlzdndyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDYyNzE2NDcsImV4cCI6MjA2MTg0NzY0N30.VWBmdbI7lMzHaaXl6ASJnc2116YnHm0WLHE0bkfW870";
    
    console.log('📋 Environment Check:');
    console.log('   Supabase URL:', SUPABASE_URL);
    console.log('   Anon Key (first 20 chars):', SUPABASE_ANON_KEY.substring(0, 20) + '...');
    
    // Test 1: Simple read from jobs table
    try {
        console.log('🔎 Test 1: Reading from jobs table...');
        
        const response = await fetch(`${SUPABASE_URL}/rest/v1/jobs?select=id&limit=1`, {
            headers: {
                'apikey': SUPABASE_ANON_KEY,
                'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
                'Content-Type': 'application/json'
            }
        });
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const data = await response.json();
        console.log('✅ Read test SUCCESS:', data.length, 'rows found');
        
    } catch (error) {
        console.error('❌ Read test FAILED:', error.message);
        return `FAILED: Read test - ${error.message}`;
    }
    
    // Test 2: Write test using admin RPC
    let testJobId = null;
    try {
        console.log('🛠️ Test 2: Creating test job via admin RPC...');
        
        const testTitle = `Connectivity Test Job ${new Date().toISOString()}`;
        const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/admin_create_job`, {
            method: 'POST',
            headers: {
                'apikey': SUPABASE_ANON_KEY,
                'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
                'Content-Type': 'application/json',
                'Content-Profile': 'public'
            },
            body: JSON.stringify({
                job_title: testTitle,
                job_company: 'HealthCheck Co',
                job_location: 'Internet',
                job_description: 'Temporary connectivity check record. Safe to delete.',
                job_requirements: [],
                job_employment_type: 'full-time',
                job_experience_level: 'mid',
                job_status: 'pending',
                job_application_type: 'internal',
                job_application_value: null,
                job_sponsored: false
            })
        });
        
        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`HTTP ${response.status}: ${errorText}`);
        }
        
        testJobId = await response.json();
        console.log('✅ Write test SUCCESS: Created job ID', testJobId);
        
    } catch (error) {
        console.error('❌ Write test FAILED:', error.message);
        return `FAILED: Write test - ${error.message}`;
    }
    
    // Test 3: Read back the created job
    try {
        console.log('🔍 Test 3: Reading back the created job...');
        
        const response = await fetch(`${SUPABASE_URL}/rest/v1/jobs?select=*&id=eq.${testJobId}`, {
            headers: {
                'apikey': SUPABASE_ANON_KEY,
                'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
                'Content-Type': 'application/json'
            }
        });
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const data = await response.json();
        if (data.length === 0) {
            throw new Error('Created job not found');
        }
        
        console.log('✅ Read-back test SUCCESS:', data[0].title);
        
    } catch (error) {
        console.error('❌ Read-back test FAILED:', error.message);
        return `FAILED: Read-back test - ${error.message}`;
    }
    
    // Test 4: Cleanup - delete test job
    try {
        console.log('🧹 Test 4: Cleaning up test job...');
        
        const response = await fetch(`${SUPABASE_URL}/rest/v1/jobs?id=eq.${testJobId}`, {
            method: 'DELETE',
            headers: {
                'apikey': SUPABASE_ANON_KEY,
                'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
                'Content-Type': 'application/json'
            }
        });
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        console.log('✅ Cleanup test SUCCESS: Test job deleted');
        
    } catch (error) {
        console.warn('⚠️ Cleanup test WARNING:', error.message);
        console.warn('   Test job may need manual deletion:', testJobId);
    }
    
    console.log('🎉 All connectivity tests completed successfully!');
    return 'SUCCESS: All Supabase connectivity tests passed';
}

// Auto-run the test
runSupabaseConnectivityTest().then(result => {
    console.log('🏁 FINAL RESULT:', result);
}).catch(error => {
    console.error('💥 TEST EXECUTION ERROR:', error);
});