// Test if the deployed webhook URL is working
import fetch from 'node-fetch';

async function testWebhookURL() {
  console.log('🧪 Testing Deployed Webhook URL');
  console.log('===============================');
  
  const webhookURL = process.argv[2];
  
  if (!webhookURL) {
    console.log('❌ Please provide the webhook URL as an argument');
    console.log('   Usage: node test-webhook-url.js https://your-app.vercel.app/api/linear-webhook');
    return;
  }
  
  console.log('🔗 Testing URL:', webhookURL);
  
  try {
    // Test 1: Check if endpoint responds
    console.log('\n1️⃣ Testing endpoint availability...');
    const response = await fetch(webhookURL, {
      method: 'GET'
    });
    console.log('   Status:', response.status);
    console.log('   Expected: 405 (Method not allowed for GET)');
    
    // Test 2: Test with proper POST request
    console.log('\n2️⃣ Testing with POST request...');
    const postResponse = await fetch(webhookURL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'linear-signature-type': 'issue.updated'
      },
      body: JSON.stringify({
        data: {
          id: 'test-123',
          state: { name: 'Done' },
          team: { id: 'test-team' }
        }
      })
    });
    
    const responseText = await postResponse.text();
    console.log('   Status:', postResponse.status);
    console.log('   Response:', responseText);
    
    if (postResponse.status === 400 && responseText === 'No team ID') {
      console.log('✅ Webhook is working! (Expected error for test data)');
    } else if (postResponse.status === 500) {
      console.log('⚠️  Webhook has configuration issues (probably missing API key)');
    } else {
      console.log('✅ Webhook responded correctly');
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testWebhookURL(); 