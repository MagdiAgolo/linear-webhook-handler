// Helper script to get team info from Linear
const fetch = require('node-fetch');

async function getTeamInfo() {
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
  console.log("Your teams:", JSON.stringify(data.data.teams.nodes, null, 2));
}

getTeamInfo().catch(console.error); 