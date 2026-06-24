# Cloudflare Gowa API Tester

This workspace contains a Cloudflare Pages frontend and API proxy for your Gowa WhatsApp API.

Deploy the folder to Cloudflare Pages, then open the Pages URL to test:

- Text messages
- Photo/image messages with captions
- Video messages with captions
- File/document messages with captions
- Device listing

The Cloudflare Function at `/api/*` forwards requests to your Coolify Gowa API and adds the hidden Basic Auth credentials server-side.

Start with `CLOUDFLARE_PAGES_SETUP.md`, then share `API_DOCS.md` with API users.
