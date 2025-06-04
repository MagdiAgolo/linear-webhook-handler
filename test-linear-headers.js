// Test with Linear-like headers
import fetch from 'node-fetch';

async function testWithLinearHeaders() {
  console.log('🧪 Testing with Linear-like Headers');
  console.log('==================================');
  
  const url = 'https://linear-webhook-handler-6zj47l8sx.vercel.app/api/linear-webhook';
  
  const payload = {
    action: "update",
    type: "Issue",
    data: {
      id: "test-issue-123",
      identifier: "TEST-123",
      title: "Test Issue",
      state: {
        name: "Done",
        id: "done-state-123"
      },
      team: {
        id: "b77856ac-378b-41c3-895d-712cab04b6fd", // Customer Support team
        name: "Customer Support"
      }
    },
    createdAt: new Date().toISOString()
  };
  
  console.log('🔗 Testing URL:', url);
  console.log('📦 Payload:', JSON.stringify(payload, null, 2));
  
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Linear-Webhook/1.0',
        'X-Linear-Signature': 'sha256=test-signature',
        'linear-signature-type': 'issue.updated',
        'X-Forwarded-For': '1.2.3.4',
        'Accept': 'application/json',
        'Cache-Control': 'no-cache'
      },
      body: JSON.stringify(payload)
    });
    
    const responseText = await response.text();
    console.log('\n📤 Response Status:', response.status);
    console.log('📄 Response:', responseText.slice(0, 200) + '...');
    
    if (response.status === 200) {
      console.log('✅ SUCCESS! Webhook worked with Linear headers!');
    } else if (response.status === 401) {
      console.log('❌ Still authentication required');
    } else {
      console.log('⚠️ Unexpected response status:', response.status);
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testWithLinearHeaders(); 