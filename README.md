# POWER ACCESS Bot

Telegram bot starter for **POWER ACCESS** — Developer: **SOMESH**.

## Included
- Telegram webhook endpoint for Vercel
- /start, /help, /id, /premium and /refer commands
- Optional Gemini AI replies using `/ai your question`
- Admin ID allowlist and starter admin commands
- Basic file-message acknowledgement

## Deploy on Vercel
1. Import this GitHub repository into Vercel.
2. Add the environment variables below in Project Settings → Environment Variables.
3. Deploy the project.
4. In Telegram, create a bot with BotFather and copy its token directly into Vercel. Never publish it in GitHub or send it in chat.
5. Set the Telegram webhook by opening this URL in a browser, replacing the placeholders:
   `https://api.telegram.org/bot<TELEGRAM_BOT_TOKEN>/setWebhook?url=https://<YOUR_VERCEL_DOMAIN>/webhook&secret_token=<TELEGRAM_WEBHOOK_SECRET>`

## Environment variables
- `TELEGRAM_BOT_TOKEN` — required, from BotFather
- `TELEGRAM_WEBHOOK_SECRET` — random secret string used to verify webhook requests
- `ADMIN_IDS` — comma-separated Telegram numeric user IDs
- `BOT_NAME` — optional, defaults to POWER ACCESS
- `DEVELOPER_NAME` — optional, defaults to SOMESH
- `GEMINI_API_KEY` — optional, enables AI replies
- `GEMINI_MODEL` — optional, defaults to gemini-2.5-flash

## Important limitations
This is a webhook-based serverless starter. Persistent user analytics, broadcast lists, premium entitlements, payment verification, durable file storage, and long-running download jobs are not implemented yet. Add a database/storage service before enabling those features. Do not use this bot to distribute copyrighted or unsafe files.

## Local checks
Run `npm install` and `vercel dev` in a Node.js 22+ environment.
