# Linear Webhook Handler

A webhook handler for Linear that automatically adds labels to issues when they are marked as "Done".

## Environment Variables

This project requires the following environment variables:

### Required Variables

- `LINEAR_API_KEY` - Your Linear API key
- `LABEL_ID` - The ID of the label you want to add to completed issues

### How to Get These Values

#### 1. Get Your Linear API Key

1. Go to [Linear Settings](https://linear.app/settings/api)
2. Click "Create new API key"
3. Give it a name (e.g., "Webhook Handler")
4. Copy the generated API key

#### 2. Get Your Label ID

1. In Linear, go to your team settings
2. Navigate to Labels
3. Find the label you want to use
4. The label ID can be found in the URL or through the Linear API

## Local Development

1. Create a `.env.local` file in the root directory:
```bash
LINEAR_API_KEY=your_actual_linear_api_key
LABEL_ID=your_actual_label_id
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
4. Add the following variables:
   - `LINEAR_API_KEY`: Your Linear API key
   - `LABEL_ID`: Your label ID
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
4. Automatically adds the specified label to the completed issue

## Files Structure

```
linear-webhook-handler/
├── api/
│   └── linear-webhook.js    # Main webhook handler
├── package.json             # Project dependencies
└── README.md               # This file
``` 