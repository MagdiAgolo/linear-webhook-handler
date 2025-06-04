// Final test script with proper environment loading
import dotenv from 'dotenv';
import fetch from 'node-fetch';

// Load environment variables
dotenv.config({ path: '.env.local' });

async function testWebhookFunction() {
  console.log('🧪 Testing Linear Webhook Handler');
  console.log('================================');
  
  // Check if API key is loaded
  if (!process.env.LINEAR_API_KEY) {
    console.error('❌ LINEAR_API_KEY not found in environment');
    return;
  }
  
  console.log('✅ API Key loaded:', process.env.LINEAR_API_KEY.slice(0, 15) + '...');
  
  // First, test getting teams
  console.log('\n🔍 Step 1: Getting your Linear teams...');
  
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
              }
            }
          }
        `,
      }),
    });

    const teamsData = await teamsResponse.json();
    
    if (teamsData.errors) {
      console.error('❌ Error getting teams:', teamsData.errors[0].message);
      return;
    }
    
    console.log('✅ Found teams:');
    teamsData.data.teams.nodes.forEach(team => {
      console.log(`   - ${team.name} (${team.key}): ${team.id}`);
    });
    
    const testTeam = teamsData.data.teams.nodes[0];
    console.log(`\n🎯 Using team "${testTeam.name}" for testing`);
    
    // Test getting Release version labels
    console.log('\n🔍 Step 2: Checking for "Release version" labels...');
    
    const labelsResponse = await fetch("https://api.linear.app/graphql", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": process.env.LINEAR_API_KEY,
      },
      body: JSON.stringify({
        query: `
          query GetTeamLabels($teamId: String!) {
            team(id: $teamId) {
              labels(
                filter: { parent: { name: { eq: "Release version" } } }
                orderBy: createdAt
                last: 10
              ) {
                nodes {
                  id
                  name
                  createdAt
                }
              }
            }
          }
        `,
        variables: { teamId: testTeam.id }
      }),
    });

    const labelsData = await labelsResponse.json();
    
    if (labelsData.errors) {
      console.error('❌ Error getting labels:', labelsData.errors[0].message);
      return;
    }
    
    const labels = labelsData.data?.team?.labels?.nodes || [];
    
    if (labels.length === 0) {
      console.log('⚠️  No "Release version" labels found');
      console.log('   Make sure you have a label group called "Release version" with at least one label');
      console.log('   You can create this in Linear → Settings → Labels');
    } else {
      console.log('✅ Found Release version labels:');
      labels.forEach(label => {
        console.log(`   - ${label.name} (created: ${label.createdAt})`);
      });
      
      const latestLabel = labels[0];
      console.log(`🎯 Latest label: "${latestLabel.name}"`);
    }
    
    // Now test the actual webhook handler
    console.log('\n🧪 Step 3: Testing webhook handler...');
    
    const { default: handler } = await import('./api/linear-webhook.js');
    
    const mockReq = {
      method: 'POST',
      headers: {
        'linear-signature-type': 'issue.updated'
      },
      body: {
        data: {
          id: 'test-issue-' + Date.now(),
          identifier: 'TEST-123',
          title: 'Test Issue for Webhook',
          state: {
            name: 'Done'
          },
          team: {
            id: testTeam.id
          }
        }
      }
    };

    const mockRes = {
      status: (code) => ({
        end: (message) => {
          console.log(`📤 Webhook Response: ${code} - ${message}`);
          return mockRes;
        }
      })
    };

    await handler(mockReq, mockRes);
    console.log('✅ Webhook handler test completed!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testWebhookFunction(); 