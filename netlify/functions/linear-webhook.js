import fetch from 'node-fetch';

export const handler = async (event, context) => {
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      body: "Method not allowed"
    };
  }

  const payload = JSON.parse(event.body);
  const eventType = event.headers["linear-signature-type"];
  
  if (eventType !== "issue.updated") {
    return {
      statusCode: 200,
      body: "Ignored"
    };
  }

  const issue = payload.data;
  const newState = issue.state?.name;

  if (newState === "Done") {
    const issueId = issue.id;
    const teamId = issue.team?.id;

    if (!teamId) {
      console.error("No team ID found for issue");
      return {
        statusCode: 400,
        body: "No team ID"
      };
    }

    try {
      // First, get the latest label from "Release Version" group
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
                  filter: { parent: { name: { eq: "Release Version" } } }
                  orderBy: createdAt
                  last: 1
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
          variables: { teamId }
        }),
      });

      const labelsData = await labelsResponse.json();
      
      if (labelsData.errors) {
        console.error("GraphQL errors:", labelsData.errors);
        return {
          statusCode: 500,
          body: "Failed to fetch labels"
        };
      }

      const labels = labelsData.data?.team?.labels?.nodes;
      
      if (!labels || labels.length === 0) {
        console.log("No labels found in 'Release Version' group");
        return {
          statusCode: 200,
          body: "No release version labels found"
        };
      }

      const latestLabel = labels[0];
      console.log(`Using latest release label: ${latestLabel.name} (${latestLabel.id})`);

      // Now update the issue with the latest label
      const updateResponse = await fetch("https://api.linear.app/graphql", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": process.env.LINEAR_API_KEY,
        },
        body: JSON.stringify({
          query: `
            mutation UpdateIssue($issueId: String!, $labelId: String!) {
              issueUpdate(
                id: $issueId,
                input: { labelIds: [$labelId] }
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
          variables: { 
            issueId,
            labelId: latestLabel.id
          }
        }),
      });

      const updateData = await updateResponse.json();
      
      if (updateData.errors) {
        console.error("Failed to update issue:", updateData.errors);
        return {
          statusCode: 500,
          body: "Failed to update issue"
        };
      }

      if (updateData.data?.issueUpdate?.success) {
        console.log(`Successfully added label "${latestLabel.name}" to issue ${updateData.data.issueUpdate.issue.identifier}`);
      }

    } catch (error) {
      console.error("Error processing webhook:", error);
      return {
        statusCode: 500,
        body: "Internal server error"
      };
    }
  }

  return {
    statusCode: 200,
    body: "Webhook handled"
  };
}; 