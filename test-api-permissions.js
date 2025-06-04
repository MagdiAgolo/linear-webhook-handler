// Test API key permissions
import dotenv from 'dotenv';
import fetch from 'node-fetch';

// Load environment variables
dotenv.config({ path: '.env.local' });

async function testAPIPermissions() {
  console.log('🔑 Testing Linear API Key Permissions');
  console.log('====================================');
  
  if (!process.env.LINEAR_API_KEY) {
    console.error('❌ LINEAR_API_KEY not found in environment');
    return;
  }
  
  console.log('✅ API Key loaded:', process.env.LINEAR_API_KEY.slice(0, 15) + '...');
  
  try {
    // Test read permissions
    console.log('\n🔍 Testing READ permissions...');
    const readResponse = await fetch("https://api.linear.app/graphql", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": process.env.LINEAR_API_KEY,
      },
      body: JSON.stringify({
        query: `
          query {
            viewer {
              id
              name
              email
            }
          }
        `,
      }),
    });

    const readData = await readResponse.json();
    
    if (readData.errors) {
      console.error('❌ READ permission error:', readData.errors[0].message);
    } else {
      console.log('✅ READ permissions working');
      console.log('   User:', readData.data.viewer.name);
      console.log('   Email:', readData.data.viewer.email);
    }

    // Test write permissions by trying to get a team (this requires read)
    // and then checking if we can query for potential write operations
    console.log('\n✏️  Testing potential WRITE permissions...');
    const writeTestResponse = await fetch("https://api.linear.app/graphql", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": process.env.LINEAR_API_KEY,
      },
      body: JSON.stringify({
        query: `
          query {
            teams(first: 1) {
              nodes {
                id
                name
                labels(first: 1) {
                  nodes {
                    id
                    name
                  }
                }
              }
            }
          }
        `,
      }),
    });

    const writeTestData = await writeTestResponse.json();
    
    if (writeTestData.errors) {
      console.error('❌ Error querying teams:', writeTestData.errors[0].message);
    } else {
      console.log('✅ Team query working (read access confirmed)');
      
      if (writeTestData.data.teams.nodes.length > 0) {
        const team = writeTestData.data.teams.nodes[0];
        console.log('   Team found:', team.name);
        
        // Now let's try a mutation that would require write permissions
        console.log('\n📝 Testing actual WRITE permissions with a test issue creation...');
        
        const testMutationResponse = await fetch("https://api.linear.app/graphql", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": process.env.LINEAR_API_KEY,
          },
          body: JSON.stringify({
            query: `
              mutation TestWrite($teamId: String!) {
                issueCreate(
                  input: {
                    teamId: $teamId
                    title: "API Permission Test - DELETE ME"
                    description: "This is a test issue to verify write permissions. Please delete."
                  }
                ) {
                  success
                  issue {
                    id
                    identifier
                    title
                  }
                }
              }
            `,
            variables: { teamId: team.id }
          }),
        });

        const mutationData = await testMutationResponse.json();
        
        if (mutationData.errors) {
          console.error('❌ WRITE permission error:', mutationData.errors[0].message);
          if (mutationData.errors[0].message.includes('write')) {
            console.log('🔧 Your API key needs WRITE permissions!');
            console.log('   Go to Linear Settings → API and create a new key with write access.');
          }
        } else if (mutationData.data?.issueCreate?.success) {
          console.log('✅ WRITE permissions working!');
          console.log('   Created test issue:', mutationData.data.issueCreate.issue.identifier);
          console.log('   ⚠️  Don\'t forget to delete this test issue in Linear');
        }
      }
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testAPIPermissions(); 