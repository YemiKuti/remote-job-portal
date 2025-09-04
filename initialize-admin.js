// Script to initialize the first admin user
// Run this in the browser console on your site

const initializeAdmin = async () => {
  console.log('🚀 Initializing admin user for yemikuti@gmail.com...');
  
  try {
    const response = await fetch('https://mmbrvcndxhipaoxysvwr.supabase.co/functions/v1/initialize-admin', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1tYnJ2Y25keGhpcGFveHlzdndyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDYyNzE2NDcsImV4cCI6MjA2MTg0NzY0N30.VWBmdbI7lMzHaaXl6ASJnc2116YnHm0WLHE0bkfW870'
      },
      body: JSON.stringify({
        email: 'yemikuti@gmail.com',
        password: '1Arsenalfan#'
      })
    });

    const result = await response.json();
    
    if (result.success) {
      console.log('✅ Admin user created successfully!');
      console.log('📧 Email:', result.email);
      console.log('🆔 User ID:', result.user_id);
      console.log('🎉 You can now sign in at /admin/signin');
    } else {
      console.error('❌ Failed to create admin user:', result.error);
    }
  } catch (error) {
    console.error('❌ Error:', error);
  }
};

// Call the function
initializeAdmin();