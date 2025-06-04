export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end("Method not allowed");

  const payload = req.body;

  const eventType = req.headers["linear-signature-type"];
  if (eventType !== "issue.updated") return res.status(200).end("Ignored");

  const issue = payload.data;
  const newState = issue.state?.name;

  if (newState === "Done") {
    const labelId = process.env.LABEL_ID; // better than hardcoding
    const issueId = issue.id;

    await fetch("https://api.linear.app/graphql", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.LINEAR_API_KEY}`,
      },
      body: JSON.stringify({
        query: `
          mutation {
            issueUpdate(
              id: "${issueId}",
              input: { labelIds: ["${labelId}"] }
            ) {
              success
            }
          }
        `,
      }),
    });
  }

  res.status(200).end("Webhook handled");
} 