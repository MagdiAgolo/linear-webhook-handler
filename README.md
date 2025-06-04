# Linear Webhook Handler

A webhook handler for Linear that automatically adds the latest label from the "Release version" group to issues when they are marked as "Done".

## Environment Variables

This project requires the following environment variable:

### Required Variables

- `LINEAR_API_KEY` - Your Linear API key

### How to Get Your Linear API Key

1. Go to [Linear Settings](https://linear.app/settings/api)
2. Click "Create new API key"
3. Give it a name (e.g., "Webhook Handler")
4. Copy the generated API key

## Local Development

1. Create a `.env.local` file in the root directory:
```bash
LINEAR_API_KEY=your_actual_linear_api_key
```

2. Install dependencies:
```bash
npm install
```

3. Run locally:
```bash
npm run dev
```

## Deployment

### Vercel Deployment

1. Connect your GitHub repository to Vercel
2. In Vercel dashboard, go to your project settings
3. Navigate to Environment Variables
4. Add the following variable:
   - `LINEAR_API_KEY`: Your Linear API key
5. Deploy the project

### Setting up the Webhook in Linear

1. Go to Linear Settings → Webhooks
2. Click "Create webhook"
3. Set the URL to your deployed endpoint: `https://your-app.vercel.app/api/linear-webhook`
4. Select "Issues" events
5. Save the webhook

## How It Works

The webhook handler:

1. Receives webhook events from Linear
2. Filters for "issue.updated" events
3. Checks if the issue state changed to "Done"
4. Automatically queries for the latest label in the "Release version" group
5. Adds that label to the completed issue

## Requirements

- Your Linear workspace must have a label group called "Release version"
- The webhook handler will use the most recently created label from this group
- Issues must belong to a team for the label lookup to work

## Files Structure

```
linear-webhook-handler/
├── api/
│   └── linear-webhook.js    # Main webhook handler
├── package.json             # Project dependencies
└── README.md               # This file
``` 