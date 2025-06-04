import crypto from 'crypto';

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end("Method not allowed");

  // Verify webhook signature if secret is provided
  if (process.env.WEBHOOK_SECRET) {
    const signature = req.headers['linear-signature'];
    const timestamp = req.headers['x-linear-timestamp'] || req.headers['linear-timestamp'];
    
    if (!signature) {
      console.error("Missing Linear-Signature header");
      return res.status(401).end("Missing signature");
    }

    try {
      // Get raw body for signature verification
      const rawBody = JSON.stringify(req.body);
      
      // Calculate expected signature
      const expectedSignature = crypto
        .createHmac('sha256', process.env.WEBHOOK_SECRET)
        .update(rawBody)
        .digest('hex');

      // Handle signature comparison - Linear may send with or without prefix
      let receivedSignature = signature;
      if (signature.startsWith('sha256=')) {
        receivedSignature = signature.replace('sha256=', '');
      }

      // Compare signatures securely (both as hex strings)
      if (expectedSignature !== receivedSignature) {
        console.error("Invalid webhook signature");
        console.error("Expected:", expectedSignature.slice(0, 16) + '...');
        console.error("Received:", receivedSignature.slice(0, 16) + '...');
        return res.status(401).end("Invalid signature");
      }

      // Optional: Check timestamp to prevent replay attacks (within 5 minutes)
      if (timestamp) {
        const currentTime = Math.floor(Date.now() / 1000);
        const webhookTime = Math.floor(Number(timestamp) / 1000);
        const timeDiff = Math.abs(currentTime - webhookTime);
        
        // Allow up to 5 minutes (300 seconds) difference
        if (timeDiff > 300) {
          console.error(`Webhook timestamp too old: ${timeDiff} seconds difference`);
          return res.status(401).end("Request too old");
        }
      }

      console.log("✅ Webhook signature verified successfully");

    } catch (error) {
      console.error("Signature verification error:", error);
      return res.status(401).end("Signature verification failed");
    }
  } else {
    console.log("⚠️  Webhook secret not configured - signature verification skipped");
  }

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
      // First, get the latest label from "Release version" group
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
        console.log("No labels found in 'Release version' group");
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