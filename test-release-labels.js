// Test script to find Release Version labels and test webhook
import dotenv from 'dotenv';
import fetch from 'node-fetch';

// Load environment variables
dotenv.config({ path: '.env.local' });

async function findReleaseVersionLabels() {
  console.log('🔍 Finding teams with "Release Version" labels...');
  
  try {
    const teamsResponse = await fetch("https://api.linear.app/graphql", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": process.env.LINEAR_API_KEY,
      },
      body: JSON.stringify({
        query: `
          query {
            teams {
              nodes {
                id
                name
                key
                labels(
                  filter: { parent: { name: { eq: "Release Version" } } }
                  orderBy: createdAt
                ) {
                  nodes {
                    id
                    name
                    parent {
                      name
                    }
                    createdAt
                  }
                }
              }
            }
          }
        `,
      }),
    });

    const data = await teamsResponse.json();
    
    if (data.errors) {
      console.error('❌ Error:', data.errors[0].message);
      return null;
    }
    
    // Find teams that have Release Version labels
    const teamsWithReleaseLabels = data.data.teams.nodes.filter(team => 
      team.labels.nodes.length > 0
    );
    
    if (teamsWithReleaseLabels.length === 0) {
      console.log('❌ No teams found with "Release Version" labels');
      console.log('📝 Make sure you have:');
      console.log('   1. Created a label group called "Release Version" (exact name)');
      console.log('   2. Added some version labels to this group');
      console.log('   3. The labels are associated with a team');
      return null;
    }
    
    console.log('✅ Found teams with Release Version labels:');
    teamsWithReleaseLabels.forEach(team => {
      console.log(`\n📋 Team: ${team.name} (${team.key})`);
      console.log(`   ID: ${team.id}`);
      console.log('   Release Version labels:');
      team.labels.nodes.forEach(label => {
        console.log(`     - ${label.name} (created: ${new Date(label.createdAt).toLocaleDateString()})`);
      });
    });
    
    return teamsWithReleaseLabels[0]; // Return first team with labels
    
  } catch (error) {
    console.error('❌ Error finding labels:', error.message);
    return null;
  }
}

async function testWebhookWithReleaseLabels() {
  console.log('🧪 Testing Linear Webhook Handler with Release Version Labels');
  console.log('============================================================');
  
  // Check if API key is loaded
  if (!process.env.LINEAR_API_KEY) {
    console.error('❌ LINEAR_API_KEY not found in environment');
    return;
  }
  
  console.log('✅ API Key loaded');
  
  // Find team with Release Version labels
  const teamWithLabels = await findReleaseVersionLabels();
  
  if (!teamWithLabels) {
    return;
  }
  
  console.log(`\n🎯 Testing with team: ${teamWithLabels.name}`);
  console.log(`📦 Latest label will be: ${teamWithLabels.labels.nodes[0].name}`);
  
  // Import the handler
  const { default: handler } = await import('./api/linear-webhook.js');
  
  // Create test payload with the correct team
  const mockPayload = {
    data: {
      id: 'test-issue-' + Date.now(),
      identifier: 'TEST-123',
      title: 'Test Issue for Release Version Labels',
      state: {
        name: 'Done'
      },
      team: {
        id: teamWithLabels.id
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
        console.log(`📤 Webhook Response: ${code} - ${message}`);
        return mockRes;
      }
    })
  };

  console.log('\n🧪 Testing webhook handler...');
  
  try {
    await handler(mockReq, mockRes);
    console.log('✅ Release Version labels test completed!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testWebhookWithReleaseLabels(); 