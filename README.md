# POWER ACCESS BOT — Phishing Awareness

A Telegram chat bot that teaches users to recognize social-engineering and phishing attempts.

## Demo flow
- Send /start to open the training menu.
- Tap **Start Demo** to view a clearly labelled fictional suspicious message.
- Tap **Inspect Message** to see the safe simulated preview.
- Tap **Warning Signs** to learn what makes the message suspicious.
- Use **Restart Demo** to repeat the exercise.

## Safety
- Training simulation only; it does not impersonate Instagram or any other service.
- No username, password, OTP, recovery code, or payment details are requested.
- No credential collection, storage, or forwarding.
- No database or user tracking is included.

## Project structure
- api/webhook.js — Telegram webhook handler
- vercel.json — routes Telegram updates to the handler
- .env.example — required environment variable names

## Deploy
1. Create a bot with **@BotFather** on Telegram and copy its bot token.
2. Import this repository into Vercel and deploy it as a Node.js serverless project.
3. In Vercel Project Settings → Environment Variables, add:
   - TELEGRAM_BOT_TOKEN = your BotFather token
   - Optional: TELEGRAM_WEBHOOK_SECRET = a random 32–64 character secret using letters, numbers, underscores, or hyphens
4. Redeploy after adding environment variables.
5. Set the Telegram webhook to:
   https://api.telegram.org/botYOUR_BOT_TOKEN/setWebhook?url=https://YOUR-VERCEL-DOMAIN/api/webhook
   If you set TELEGRAM_WEBHOOK_SECRET, include &secret_token=YOUR_SECRET in that URL.
6. Open your bot in Telegram and send /start.

Keep the bot token private. Never commit it to GitHub or paste it into public chats. This repository contains source code only; the bot is not live until deployment and webhook setup are complete.
