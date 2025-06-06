import crypto from 'crypto';

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end("Method not allowed");

  const payload = req.body;

  const eventType = req.headers["linear-signature-type"];
  if (eventType !== "issue.updated") return res.status(200).end("Ignored");

  const issue = payload.data;
  const newState = issue.state?.name;

  if (newState === "Done") {
    const issueId = issue.id;
    const teamId = issue.team?.id;

    if (!teamId) {
      console.error("No team ID found for issue");
      return res.status(400).end("No team ID");
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
        return res.status(500).end("Failed to fetch labels");
      }

      const labels = labelsData.data?.team?.labels?.nodes;
      
      if (!labels || labels.length === 0) {
        console.log("No labels found in 'Release Version' group");
        return res.status(200).end("No release version labels found");
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
        return res.status(500).end("Failed to update issue");
      }

      if (updateData.data?.issueUpdate?.success) {
        console.log(`Successfully added label "${latestLabel.name}" to issue ${updateData.data.issueUpdate.issue.identifier}`);
      }

    } catch (error) {
      console.error("Error processing webhook:", error);
      return res.status(500).end("Internal server error");
    }
  }

  res.status(200).end("Webhook handled");
} 