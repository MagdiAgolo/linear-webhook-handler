// Local test script to test the webhook handler directly
import handler from './api/linear-webhook.js';

// Mock request and response objects
const mockReq = {
  method: 'POST',
  headers: {
    'linear-signature-type': 'issue.updated'
  },
  body: {
    data: {
      id: 'test-issue-id-123',
      identifier: 'TEST-123',
      title: 'Test Issue for Webhook',
      state: {
        name: 'Done'
      },
      team: {
        id: 'test-team-id-456'  // You'll need to replace this with a real team ID
      }
    }
  }
};

const mockRes = {
  status: (code) => ({
    end: (message) => console.log(`Response: ${code} - ${message}`)
  })
};

console.log('🧪 Testing webhook handler locally...');
console.log('📝 Mock payload:', JSON.stringify(mockReq.body, null, 2));
console.log('');

// Test the handler
handler(mockReq, mockRes)
  .then(() => console.log('✅ Test completed'))
  .catch(err => console.error('❌ Test failed:', err)); 