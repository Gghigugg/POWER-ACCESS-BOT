# POWER ACCESS BOT — Social Media Safety Demo

Telegram bot with selectable training previews:
- Followers demo: 1K, 2K, 5K, 10K
- Blue Tick / Verified Badge awareness demo
- Instagram Plus / Meta One feature previews
- Creator and Business feature preview
- Phishing safety guide

All screens are clearly marked as training simulations. The bot does not provide followers, verification, subscriptions, or account upgrades. It never requests passwords, OTPs, recovery codes, or payment details. It is not an official Instagram or Meta bot.

## Setup
Create a Telegram bot using @BotFather. Deploy this repository as a Node.js serverless project and set `TELEGRAM_BOT_TOKEN` in the hosting provider's environment variables. Optionally set `TELEGRAM_WEBHOOK_SECRET`. Configure the Telegram webhook to point to `/api/webhook` on your deployed domain. Keep the bot token private and never commit it to GitHub.

This repository contains source code only. The bot is not live until deployment and webhook setup are complete. Plan features and availability can vary by region and account; check details in the official app.
