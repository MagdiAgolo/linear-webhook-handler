// Test script with signature verification
import dotenv from 'dotenv';
import crypto from 'crypto';

// Load environment variables
dotenv.config({ path: '.env.local' });

async function testWebhookWithSignature() {
  console.log('🧪 Testing Linear Webhook Handler with Signature Verification');
  console.log('==========================================================');
  
  // Check if required env vars are loaded
  if (!process.env.LINEAR_API_KEY) {
    console.error('❌ LINEAR_API_KEY not found in environment');
    return;
  }
  
  const webhookSecret = process.env.WEBHOOK_SECRET || 'test-secret-for-local-testing';
  console.log('✅ API Key loaded');
  console.log('✅ Webhook Secret:', webhookSecret.slice(0, 10) + '...');
  
  // Import the handler
  const { default: handler } = await import('./api/linear-webhook.js');
  
  // Create test payload
  const mockPayload = {
    data: {
      id: 'test-issue-' + Date.now(),
      identifier: 'TEST-123',
      title: 'Test Issue for Webhook with Signature',
      state: {
        name: 'Done'
      },
      team: {
        id: 'b77856ac-378b-41c3-895d-712cab04b6fd' // Customer Support team ID from previous test
      }
    }
  };
  
  const rawBody = JSON.stringify(mockPayload);
  const timestamp = Date.now(); // Use current timestamp in milliseconds
  
  // Generate signature
  const signature = crypto
    .createHmac('sha256', webhookSecret)
    .update(rawBody)
    .digest('hex');
  
  console.log('\n🔐 Generated signature for testing:', signature.slice(0, 16) + '...');
  console.log('🕐 Using timestamp:', new Date(timestamp).toISOString());
  
  // Mock request with signature
  const mockReq = {
    method: 'POST',
    headers: {
      'linear-signature-type': 'issue.updated',
      'linear-signature': signature,
      'linear-timestamp': timestamp.toString()
    },
    body: mockPayload
  };

  // Mock response
  const mockRes = {
    status: (code) => ({
      end: (message) => {
        console.log(`📤 Webhook Response: ${code} - ${message}`);
        return mockRes;
      }
    })
  };

  console.log('\n🧪 Test 1: Testing webhook with valid signature...');
  
  try {
    await handler(mockReq, mockRes);
    console.log('✅ Valid signature test completed!');
    
    // Test with invalid signature
    console.log('\n🧪 Test 2: Testing webhook with invalid signature...');
    
    const invalidReq = {
      ...mockReq,
      headers: {
        ...mockReq.headers,
        'linear-signature': 'invalid123abc'
      }
    };
    
    await handler(invalidReq, mockRes);
    
    // Test without signature (when secret is not set)
    console.log('\n🧪 Test 3: Testing webhook without secret verification...');
    
    // Temporarily remove the secret
    const originalSecret = process.env.WEBHOOK_SECRET;
    delete process.env.WEBHOOK_SECRET;
    
    const noSecretReq = {
      method: 'POST',
      headers: {
        'linear-signature-type': 'issue.updated'
      },
      body: mockPayload
    };
    
    await handler(noSecretReq, mockRes);
    
    // Restore the secret
    process.env.WEBHOOK_SECRET = originalSecret;
    
    console.log('✅ All signature verification tests completed!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testWebhookWithSignature(); 