// Script to reset admin password (Version 2 - More Direct)
// Run this in the browser console on your site

const resetAdminPasswordV2 = async () => {
  const newPassword = '1Arsenalfan#'; // New password
  const email = 'yemikuti@gmail.com';
  
  console.log('🔐 Resetting admin password (V2)...');
  
  try {
    const response = await fetch('https://mmbrvcndxhipaoxysvwr.supabase.co/functions/v1/reset-admin-password', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1tYnJ2Y25keGhpcGFveHlzdndyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDYyNzE2NDcsImV4cCI6MjA2MTg0NzY0N30.VWBmdbI7lMzHaaXl6ASJnc2116YnHm0WLHE0bkfW870'
      },
      body: JSON.stringify({
        email: email,
        newPassword: newPassword
      })
    });

    const result = await response.json();
    
    if (result.success) {
      console.log('✅ Admin password reset successfully!');
      console.log('📧 Email:', email);
      console.log('🔑 Password:', newPassword);
      console.log('🚀 Try signing in now at /admin-signin');
      console.log('⚠️ If it still fails, wait 30 seconds and try again');
    } else {
      console.error('❌ Failed to reset admin password:', result.error);
    }
  } catch (error) {
    console.error('❌ Error:', error);
  }
};

// Call the function
resetAdminPasswordV2();