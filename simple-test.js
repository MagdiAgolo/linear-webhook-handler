// Simple test script using built-in fetch
import fetch from 'node-fetch';

async function testGetTeams() {
  console.log('🔍 Getting your Linear teams...');
  
  try {
    const response = await fetch("https://api.linear.app/graphql", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.LINEAR_API_KEY}`,
      },
      body: JSON.stringify({
        query: `
          query {
            teams {
              nodes {
                id
                name
                key
              }
            }
          }
        `,
      }),
    });

    const data = await response.json();
    
    if (data.errors) {
      console.error('❌ GraphQL errors:', data.errors);
      return null;
    }
    
    console.log('✅ Your teams:');
    data.data.teams.nodes.forEach(team => {
      console.log(`  - ${team.name} (${team.key}): ${team.id}`);
    });
    
    return data.data.teams.nodes[0]; // Return first team for testing
    
  } catch (error) {
    console.error('❌ Error fetching teams:', error.message);
    return null;
  }
}

async function testWebhook(teamId) {
  console.log('\n🧪 Testing webhook handler...');
  
  // Import the handler
  const { default: handler } = await import('./api/linear-webhook.js');
  
  // Mock request
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
          id: teamId
        }
      }
    }
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

  console.log('📝 Testing with team ID:', teamId);
  
  try {
    await handler(mockReq, mockRes);
    console.log('✅ Webhook test completed');
  } catch (error) {
    console.error('❌ Webhook test failed:', error.message);
  }
}

// Run the tests
async function runTests() {
  const team = await testGetTeams();
  if (team) {
    await testWebhook(team.id);
  } else {
    console.log('❌ Cannot test webhook without valid team');
  }
}

runTests(); 