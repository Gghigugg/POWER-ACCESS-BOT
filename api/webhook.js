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
    "🦊 <b>POWER ACCESS — DEMO CENTER</b>",
    "",
    "Choose a demo category to preview how a social-media offer or promotion screen might appear.",
    "",
    "⚠️ <b>TRAINING SIMULATION ONLY</b>",
    "No followers, verification badge, paid plan, or account upgrade is provided here.",
    "We never ask for passwords, OTPs, or recovery codes."
  ].join("\n");
}

function mainMenu() {
  return keyboard([
    [{ text: "👥 Followers Demo", callback_data: "followers_menu" }],
    [{ text: "☑️ Blue Tick / Verified Demo", callback_data: "blue_tick" }],
    [{ text: "✨ Instagram Plus / Meta One", callback_data: "meta_one" }],
    [{ text: "🎬 Creator & Business Features", callback_data: "creator_features" }],
    [{ text: "🛡️ Phishing Safety Guide", callback_data: "warnings" }]
  ]);
}

function followersMenu() {
  return keyboard([
    [{ text: "1K Followers", callback_data: "followers_1k" }, { text: "2K Followers", callback_data: "followers_2k" }],
    [{ text: "5K Followers", callback_data: "followers_5k" }, { text: "10K Followers", callback_data: "followers_10k" }],
    [{ text: "↩️ Main Menu", callback_data: "home" }]
  ]);
}

function followersPreview(amount) {
  return [
    "⚠️ <b>TRAINING SIMULATION — FOLLOWERS OFFER</b>",
    "",
    `<b>Selected preview:</b> ${amount} followers`,
    "",
    "A suspicious promotion might promise fast follower growth or guaranteed results.",
    "",
    "🔎 <b>Check before trusting:</b>",
    "• Is the seller asking for your Instagram password?",
    "• Are they promising instant or guaranteed followers?",
    "• Are they asking for payment through an unverified account?",
    "• Could the offer use bots or fake engagement?",
    "",
    "✅ This is only a visual training preview. No followers are added, no payment is taken, and no account is connected."
  ].join("\n");
}

function blueTickPreview() {
  return [
    "⚠️ <b>TRAINING SIMULATION — VERIFIED BADGE</b>",
    "",
    "A suspicious offer may claim it can provide a guaranteed blue verification badge.",
    "",
    "🔎 <b>Warning signs:</b>",
    "• “Guaranteed blue tick” from an unofficial seller.",
    "• Requests for password, OTP, or recovery code.",
    "• Pressure to pay immediately.",
    "• Fake support accounts or unofficial links.",
    "",
    "✅ Verification must be handled through official Instagram / Meta processes. This demo cannot verify an account or issue a badge."
  ].join("\n");
}

function metaOnePreview() {
  return [
    "✨ <b>TRAINING SIMULATION — INSTAGRAM PLUS / META ONE</b>",
    "",
    "Choose a feature group to preview:",
    "",
    "• Story tools and audience controls",
    "• Story insights and previews",
    "• Profile and app customisation",
    "• AI creation tools",
    "• Creator / Business tools",
    "",
    "Meta's plans and features can vary by country, account, and rollout. Check availability and pricing inside the official app.",
    "",
    "This is an informational preview only. It does not activate a subscription."
  ].join("\n");
}

function creatorPreview() {
  return [
    "🎬 <b>TRAINING SIMULATION — CREATOR / BUSINESS</b>",
    "",
    "Example feature categories:",
    "• Enhanced profile and links",
    "• Follow and audience tools",
    "• Scheduling and publishing",
    "• Insights and analytics",
    "• Team access and business support",
    "",
    "Availability depends on the official Meta plan and account eligibility.",
    "",
    "⚠️ This is not an official Meta checkout or subscription page."
  ].join("\n");
}

function warningText() {
  return [
    "🛡️ <b>PHISHING SAFETY GUIDE</b>",
    "",
    "1️⃣ Be careful with guaranteed followers or instant blue-tick offers.",
    "2️⃣ Never share your password, OTP, or recovery code.",
    "3️⃣ Avoid unknown links and unofficial payment requests.",
    "4️⃣ Verify subscriptions and account notices inside the official app.",
    "5️⃣ Report suspicious sellers and messages.",
    "",
    "🎓 <b>Stay safe — think before you tap.</b>"
  ].join("\n");
}

async function sendStart(chatId, token) {
  return telegram("sendMessage", token, {
    chat_id: chatId,
    text: welcomeText(),
    parse_mode: "HTML",
    reply_markup: mainMenu()
  });
}

async function handleCallback(query, token) {
  await telegram("answerCallbackQuery", token, { callback_query_id: query.id });
  const chatId = query.message && query.message.chat && query.message.chat.id;
  const messageId = query.message && query.message.message_id;
  if (!chatId || !messageId) return;

  let text;
  let markup;
  const data = query.data || "";

  if (data === "home") {
    text = welcomeText();
    markup = mainMenu();
  } else if (data === "followers_menu") {
    text = "👥 <b>FOLLOWERS DEMO</b>\n\nSelect a quantity to preview the corresponding training screen.\n\n⚠️ No followers are delivered.";
    markup = followersMenu();
  } else if (data === "followers_1k" || data === "followers_2k" || data === "followers_5k" || data === "followers_10k") {
    const amount = data.replace("followers_", "");
    text = followersPreview(amount);
    markup = keyboard([
      [{ text: "↩️ Choose Another Amount", callback_data: "followers_menu" }],
      [{ text: "🏠 Main Menu", callback_data: "home" }]
    ]);
  } else if (data === "blue_tick") {
    text = blueTickPreview();
    markup = keyboard([[{ text: "🏠 Main Menu", callback_data: "home" }]]);
  } else if (data === "meta_one") {
    text = metaOnePreview();
    markup = keyboard([
      [{ text: "✨ Story & Profile Preview", callback_data: "meta_story" }],
      [{ text: "🤖 AI Tools Preview", callback_data: "meta_ai" }],
      [{ text: "🎬 Creator / Business Preview", callback_data: "creator_features" }],
      [{ text: "🏠 Main Menu", callback_data: "home" }]
    ]);
  } else if (data === "meta_story") {
    text = "✨ <b>STORY & PROFILE — TRAINING PREVIEW</b>\n\nPossible feature categories include story audience lists, story previews and insights, custom fonts, app icons, and profile customisation. Exact availability varies.\n\n⚠️ This does not unlock Instagram Plus.";
    markup = keyboard([[{ text: "↩️ Back to Meta One", callback_data: "meta_one" }], [{ text: "🏠 Main Menu", callback_data: "home" }]]);
  } else if (data === "meta_ai") {
    text = "🤖 <b>AI TOOLS — TRAINING PREVIEW</b>\n\nMeta subscription bundles may provide higher usage limits for selected AI image, video, and creative tools. Features and limits vary by plan and region.\n\n⚠️ This does not activate a Meta One plan.";
    markup = keyboard([[{ text: "↩️ Back to Meta One", callback_data: "meta_one" }], [{ text: "🏠 Main Menu", callback_data: "home" }]]);
  } else if (data === "creator_features") {
    text = creatorPreview();
    markup = keyboard([[{ text: "🏠 Main Menu", callback_data: "home" }]]);
  } else if (data === "warnings") {
    text = warningText();
    markup = keyboard([[{ text: "🏠 Main Menu", callback_data: "home" }]]);
  } else {
    text = "Choose an option from the main menu to continue.";
    markup = mainMenu();
  }

  return telegram("editMessageText", token, {
    chat_id: chatId,
    message_id: messageId,
    text,
    parse_mode: "HTML",
    reply_markup: markup
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
          text: "Use /start to open the demo menu. This training bot never asks for passwords or OTPs."
        });
      }
    }
    res.status(200).json({ ok: true });
  } catch (error) {
    // Do not log message contents or secrets.
    res.status(200).json({ ok: false });
  }
};
