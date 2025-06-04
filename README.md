# Linear Webhook Handler

A webhook handler for Linear that automatically adds the latest label from the "Release version" group to issues when they are marked as "Done".

## Environment Variables

This project requires the following environment variables:

### Required Variables

- `LINEAR_API_KEY` - Your Linear API key

### Optional Variables (Recommended for Production)

- `WEBHOOK_SECRET` - Secret for webhook signature verification (enhances security)

### How to Get Your Linear API Key

1. Go to [Linear Settings](https://linear.app/settings/api)
2. Click "Create new API key"
3. Give it a name (e.g., "Webhook Handler")
4. Copy the generated API key

### How to Set Up Webhook Secret

When creating your webhook in Linear:
1. In the webhook creation form, you can set a "Secret" field
2. Use a strong, random string (recommended: 32+ characters)
3. Add this same value to your `WEBHOOK_SECRET` environment variable

## Local Development

1. Create a `.env.local` file in the root directory:
```bash
LINEAR_API_KEY=your_actual_linear_api_key
WEBHOOK_SECRET=your_webhook_secret_here
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
   - `WEBHOOK_SECRET`: Your webhook secret (optional but recommended)
5. Deploy the project

### Setting up the Webhook in Linear

1. Go to Linear Settings → Webhooks
2. Click "Create webhook"
3. Set the URL to your deployed endpoint: `https://your-app.vercel.app/api/linear-webhook`
4. Select "Issues" events
5. **Recommended**: Set a secret key for enhanced security
6. Save the webhook

## Security Features

- **Signature Verification**: When `WEBHOOK_SECRET` is set, the webhook verifies request signatures
- **Replay Attack Prevention**: Timestamps are validated to prevent old requests
- **Secure Comparison**: Uses timing-safe comparison to prevent timing attacks

## How It Works

The webhook handler:

1. Receives webhook events from Linear
2. **Verifies signature** (if webhook secret is configured)
3. Filters for "issue.updated" events
4. Checks if the issue state changed to "Done"
5. Automatically queries for the latest label in the "Release version" group
6. Adds that label to the completed issue

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