# Cloudflare Pages Setup

Deploy this folder to Cloudflare Pages.

## Build Settings

Use these settings:

```text
Framework preset: None
Build command: leave empty
Build output directory: .
Root directory: /
```

Cloudflare Pages will serve `index.html` and automatically deploy the Function in `functions/api/[[path]].js`.

## Environment Variables

Add these in Cloudflare Pages:

```env
GOWA_BASE_URL=https://whatsapp.apps.tirupatihost.in
GOWA_BASIC_AUTH=your-coolify-gowa-user:your-coolify-gowa-password
GOWA_DEVICE_ID=official bharath
```

Optional but recommended if you give the API to other people:

```env
PUBLIC_API_KEY=change-this-to-a-long-random-key
```

If `PUBLIC_API_KEY` is set, every public API request must include:

```text
X-Api-Key: change-this-to-a-long-random-key
```

## Public API Base URL

After deploy, your public API is:

```text
https://your-project.pages.dev/api
```

Examples:

```text
POST https://your-project.pages.dev/api/send/message
POST https://your-project.pages.dev/api/send/image
POST https://your-project.pages.dev/api/send/video
POST https://your-project.pages.dev/api/send/file
GET  https://your-project.pages.dev/api/devices
```

The browser will not hit Gowa directly. It calls Cloudflare, and Cloudflare calls your Coolify Gowa API.
