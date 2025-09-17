// Simple CV Tailoring Test
console.log('🚀 Starting simple CV tailoring test...');

const testCVFunction = async () => {
  try {
    console.log('📤 Testing CV tailoring function...');
    
    // Simple test content
    const resumeContent = `John Smith
john.smith@email.com | (555) 123-4567
EXPERIENCE
Software Engineer | Tech Corp | 2020-Present
• Developed web applications using React and Node.js
• Led team of 3 developers on major projects`;

    const jobDescription = `Senior Software Engineer position requiring React, Node.js, and team leadership experience.`;

    // Create FormData for file upload
    const formData = new FormData();
    const resumeBlob = new Blob([resumeContent], { type: 'text/plain' });
    formData.append('file', resumeBlob, 'test-resume.txt');
    formData.append('jobDescription', jobDescription);
    formData.append('jobTitle', 'Senior Software Engineer');
    formData.append('companyName', 'Test Company');
    formData.append('userId', crypto.randomUUID());

    console.log('📡 Calling tailor-cv function...');
    
    const response = await fetch('https://mmbrvcndxhipaoxysvwr.supabase.co/functions/v1/tailor-cv', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1tYnJ2Y25keGhpcGFveHlzdndyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDYyNzE2NDcsImV4cCI6MjA2MTg0NzY0N30.VWBmdbI7lMzHaaXl6ASJnc2116YnHm0WLHE0bkfW870'
      },
      body: formData
    });

    console.log('📥 Response status:', response.status);
    const data = await response.json();
    console.log('📄 Response data:', data);

    if (data.success) {
      console.log('✅ CV tailoring function is working!');
      console.log('📊 Score:', data.score);
      console.log('📄 Content length:', data.tailoredResume?.length || 0);
      return true;
    } else {
      console.log('❌ CV tailoring failed:', data.error);
      return false;
    }
    
  } catch (error) {
    console.error('❌ Test error:', error);
    return false;
  }
};

// Execute test
testCVFunction().then(success => {
  console.log(success ? '🎉 Test completed successfully' : '💥 Test failed');
});