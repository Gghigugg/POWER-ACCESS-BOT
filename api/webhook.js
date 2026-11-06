const TELEGRAM_API = "https://api.telegram.org";

function keyboard(rows) {
  return { inline_keyboard: rows };
}

async function telegram(method, token, payload) {
  const response = await fetch(`${TELEGRAM_API}/bot${token}/${method}`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(payload)
  });
  const data = await response.json();
  if (!response.ok || !data.ok) {
    throw new Error(data.description || `Telegram API error: ${response.status}`);
  }
  return data;
}

function welcomeText() {
  return [
    "🛡️ <b>POWER ACCESS — SECURITY LAB</b>",
    "",
    "Welcome to a short phishing-awareness exercise.",
    "Everything in this bot is a fictional <b>TRAINING SIMULATION</b>.",
    "",
    "You will inspect a suspicious social-media message and learn how to spot red flags.",
    "",
    "🔒 We will never ask for your password, OTP, or recovery code."
  ].join("\n");
}

function demoText() {
  return [
    "⚠️ <b>TRAINING SIMULATION — FICTIONAL MESSAGE</b>",
    "",
    "<b>Sender:</b> Social Account Alert (unverified)",
    "<b>Message:</b>",
    "“Your account may be restricted today. Verify immediately using the link below to avoid losing access.”",
    "",
    "<i>Example link:</i> [suspicious link hidden]",
    "",
    "This message is invented for training. Do not open unexpected links or share account details.",
    "",
    "What would you do next?"
  ].join("\n");
}

function previewText() {
  return [
    "🔍 <b>SIMULATED LINK PREVIEW</b>",
    "",
    "The message pressures you to act immediately and pushes you toward an unexpected link.",
    "",
    "A real phishing page may imitate a familiar brand to trick people. This demo deliberately does <b>not</b> create a login page or ask for any details.",
    "",
    "Choose <b>Warning Signs</b> to learn how to check the message safely."
  ].join("\n");
}

function warningText() {
  return [
    "🚨 <b>5 PHISHING RED FLAGS</b>",
    "",
    "1️⃣ <b>Urgency:</b> “Act now” or threats of immediate suspension.",
    "2️⃣ <b>Unknown sender:</b> The account is unverified or unexpected.",
    "3️⃣ <b>Unexpected link:</b> The message asks you to visit a link instead of opening the official app yourself.",
    "4️⃣ <b>Secret requests:</b> Passwords, OTPs, and recovery codes should never be shared in a message.",
    "5️⃣ <b>Pressure and fear:</b> Scammers try to stop you from thinking or checking.",
    "",
    "✅ <b>Stay safe:</b> Close the message, open the official app directly, review alerts there, and report suspicious messages.",
    "",
    "🎓 <b>TRAINING COMPLETE</b> — Think before you tap."
  ].join("\n");
}

async function sendStart(chatId, token) {
  return telegram("sendMessage", token, {
    chat_id: chatId,
    text: welcomeText(),
    parse_mode: "HTML",
    reply_markup: keyboard([[{ text: "▶️ Start Demo", callback_data: "start_demo" }]])
  });
}

async function handleCallback(query, token) {
  await telegram("answerCallbackQuery", token, { callback_query_id: query.id });
  const chatId = query.message && query.message.chat && query.message.chat.id;
  const messageId = query.message && query.message.message_id;
  if (!chatId || !messageId) return;

  let text;
  let rows;
  switch (query.data) {
    case "start_demo":
      text = demoText();
      rows = [[{ text: "🔍 Inspect Message", callback_data: "inspect" }], [{ text: "↩️ Main Menu", callback_data: "home" }]];
      break;
    case "inspect":
      text = previewText();
      rows = [[{ text: "🚨 Warning Signs", callback_data: "warnings" }], [{ text: "↩️ Back", callback_data: "start_demo" }]];
      break;
    case "warnings":
      text = warningText();
      rows = [[{ text: "🔁 Restart Demo", callback_data: "start_demo" }], [{ text: "🏠 Main Menu", callback_data: "home" }]];
      break;
    case "home":
      text = welcomeText();
      rows = [[{ text: "▶️ Start Demo", callback_data: "start_demo" }]];
      break;
    default:
      text = "This demo action is not available. Tap Restart Demo to begin again.";
      rows = [[{ text: "🔁 Restart Demo", callback_data: "start_demo" }]];
  }

  return telegram("editMessageText", token, {
    chat_id: chatId,
    message_id: messageId,
    text,
    parse_mode: "HTML",
    reply_markup: keyboard(rows)
  });
}

module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    res.status(405).json({ ok: false, message: "Method not allowed" });
    return;
  }

  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token) {
    res.status(500).json({ ok: false, message: "Bot token is not configured" });
    return;
  }

  const expectedSecret = process.env.TELEGRAM_WEBHOOK_SECRET;
  if (expectedSecret) {
    const suppliedSecret = req.headers["x-telegram-bot-api-secret-token"];
    if (suppliedSecret !== expectedSecret) {
      res.status(401).json({ ok: false, message: "Unauthorized webhook" });
      return;
    }
  }

  try {
    const update = req.body || {};
    if (update.callback_query) {
      await handleCallback(update.callback_query, token);
    } else if (update.message && update.message.chat) {
      const chatId = update.message.chat.id;
      const command = (update.message.text || "").trim().split(/\s+/)[0].toLowerCase();
      if (command === "/start" || command === "/help") {
        await sendStart(chatId, token);
      } else {
        await telegram("sendMessage", token, {
          chat_id: chatId,
          text: "Use /start to open the phishing-awareness training demo. This bot never asks for passwords or OTPs."
        });
      }
    }
    res.status(200).json({ ok: true });
  } catch (error) {
    // Do not log message contents or secrets.
    res.status(200).json({ ok: false });
  }
};
