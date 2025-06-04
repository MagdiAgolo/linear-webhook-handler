// Simple test script for the webhook handler
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

async function testSimpleWebhook() {
  console.log('🧪 Testing Simple Linear Webhook Handler');
  console.log('=====================================');
  
  // Check if API key is loaded
  if (!process.env.LINEAR_API_KEY) {
    console.error('❌ LINEAR_API_KEY not found in environment');
    return;
  }
  
  console.log('✅ API Key loaded:', process.env.LINEAR_API_KEY.slice(0, 15) + '...');
  
  // Import the handler
  const { default: handler } = await import('./api/linear-webhook.js');
  
  // Create test payload
  const mockPayload = {
    data: {
      id: 'test-issue-' + Date.now(),
      identifier: 'TEST-123',
      title: 'Test Issue for Simple Webhook',
      state: {
        name: 'Done'
      },
      team: {
        id: 'b77856ac-378b-41c3-895d-712cab04b6fd' // Customer Support team ID
      }
    }
  };
  
  // Mock request
  const mockReq = {
    method: 'POST',
    headers: {
      'linear-signature-type': 'issue.updated'
    },
    body: mockPayload
  };

  // Mock response
  const mockRes = {
    status: (code) => ({
      end: (message) => {
        console.log(`📤 Response: ${code} - ${message}`);
        return mockRes;
      }
    })
  };

  console.log('\n🧪 Testing webhook handler...');
  console.log('📝 Payload:', JSON.stringify(mockPayload, null, 2));
  
  try {
    await handler(mockReq, mockRes);
    console.log('✅ Simple webhook test completed!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testSimpleWebhook(); 