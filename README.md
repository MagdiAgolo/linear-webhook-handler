# Linear Webhook Handler

Automatically adds the latest "Release Version" label to Linear issues when they're marked as "Done".

## 🚀 One-Click Deploy (Zero Manual Setup Required)

### Option 1: Render.com (Recommended - Completely Free)
[![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy?repo=https://github.com/MagdiAgolo/linear-webhook-handler)

### Option 2: Railway  
[![Deploy on Railway](https://railway.app/button.svg)](https://railway.app/new/template/7WjX9y)

### Option 3: Heroku
[![Deploy to Heroku](https://www.herokucdn.com/deploy/button.svg)](https://heroku.com/deploy?template=https://github.com/MagdiAgolo/linear-webhook-handler)

## 📋 Setup Instructions

1. Click any deploy button above
2. Enter your Linear API Key when prompted (use your existing API key with read/write permissions)
3. Copy the deployed URL (e.g., `https://your-app.render.com`)
4. In Linear, go to Settings → API → Webhooks
5. Create a new webhook with URL: `https://your-app.render.com/api/linear-webhook`
6. Select events: "Issues" → "Updated"

## ✨ Features

- Automatically detects when issues are marked as "Done"
- Finds the latest "Release Version" label in your workspace  
- Adds the label to completed issues
- Works across all teams in your Linear workspace
- Zero configuration needed

## 🔧 How it Works

1. Listens for Linear webhook events
2. When an issue state changes to "Done"
3. Queries Linear API for the latest label in "Release Version" group
4. Adds that label to the completed issue

## 🧪 Testing

The webhook handler includes comprehensive error handling and logging. All requests are logged for debugging purposes.

## 📝 Environment Variables

- `LINEAR_API_KEY`: Your Linear API key with read/write permissions

## 🔒 Security

- Uses HTTPS for all API communications
- Validates webhook payloads
- Minimal required permissions

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