const TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const SECRET = process.env.TELEGRAM_WEBHOOK_SECRET;
const ADMINS = new Set((process.env.ADMIN_IDS || "").split(",").map(x => x.trim()).filter(Boolean));
const API = TOKEN ? `https://api.telegram.org/bot${TOKEN}` : "";
const BOT_NAME = process.env.BOT_NAME || "POWER ACCESS";
const DEVELOPER = process.env.DEVELOPER_NAME || "SOMESH";

async function telegram(method, body) {
  if (!API) throw new Error("Bot token is not configured");
  const response = await fetch(`${API}/${method}`, {
    method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body)
  });
  const data = await response.json();
  if (!data.ok) throw new Error(data.description || "Telegram API error");
  return data.result;
}
async function send(chat_id, text, extra = {}) {
  return telegram("sendMessage", { chat_id, text, parse_mode: "HTML", ...extra });
}
function esc(value = "") {
  return String(value).replace(/[&<>"]/g, c => ({ "&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;" }[c]));
}
function isAdmin(userId) { return ADMINS.has(String(userId)); }
async function aiReply(prompt) {
  const key = process.env.GEMINI_API_KEY;
  if (!key) return "AI chat is not configured yet. Admin can add GEMINI_API_KEY in Vercel Environment Variables.";
  const model = process.env.GEMINI_MODEL || "gemini-2.5-flash";
  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`, {
    method: "POST", headers: { "content-type": "application/json" },
    body: JSON.stringify({ contents: [{ parts: [{ text: prompt.slice(0, 8000) }] }] })
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error?.message || "AI request failed");
  return data.candidates?.[0]?.content?.parts?.map(p => p.text || "").join("") || "I couldn't generate a reply.";
}
async function handle(update) {
  const msg = update.message;
  if (!msg?.chat?.id) return;
  const chatId = msg.chat.id;
  const userId = msg.from?.id;
  const text = (msg.text || "").trim();
  const parts = text.split(/\s+/);
  const command = (parts[0] || "").split("@")[0].toLowerCase();

  if (msg.new_chat_members) {
    await send(chatId, `Welcome to <b>${esc(BOT_NAME)}</b>! Please follow the group rules.`);
    return;
  }
  if (command === "/start") {
    const referral = parts[1] || "";
    const first = esc(msg.from?.first_name || "there");
    await send(chatId,
      `👋 Hello ${first}!\n\n<b>🤖 ${esc(BOT_NAME)}</b>\nYour all-in-one Telegram assistant.\n\nChoose a feature:\n• /help — commands\n• /ai — ask AI\n• /id — your Telegram ID\n• /premium — premium information\n• /refer — referral link\n\n<i>Developer: ${esc(DEVELOPER)}</i>`,
      { reply_markup: { inline_keyboard: [[{text:"🤖 AI Chat",callback_data:"ai_help"},{text:"⭐ Premium",callback_data:"premium"}],[{text:"📚 Help",callback_data:"help"}]] } }
    );
    return;
  }
  if (command === "/help") {
    await send(chatId, "<b>POWER ACCESS commands</b>\n/start — Start bot\n/help — Help\n/ai your question — AI reply\n/id — Show your ID\n/premium — Premium info\n/refer — Referral link\n\nAdmin: /stats, /broadcast message, /premium_add USER_ID");
    return;
  }
  if (command === "/id") { await send(chatId, `Your ID: <code>${userId}</code>\nChat ID: <code>${chatId}</code>`); return; }
  if (command === "/premium") {
    await send(chatId, "⭐ <b>Premium Access</b>\nPremium features are managed by the bot administrator. Contact the admin for activation.");
    return;
  }
  if (command === "/refer") {
    const me = await telegram("getMe", {});
    await send(chatId, `🔗 Your referral link:\nhttps://t.me/${me.username}?start=ref_${userId}\n\nShare it with friends!`);
    return;
  }
  if (command === "/ai") {
    const prompt = text.replace(/^\/ai(?:@\w+)?\s*/i, "");
    if (!prompt) { await send(chatId, "Send your question like this:\n/ai Explain quantum physics"); return; }
    await telegram("sendChatAction", {chat_id:chatId,action:"typing"});
    try { await send(chatId, esc(await aiReply(prompt))); }
    catch (error) { console.error("AI error:", error.message); await send(chatId, "AI is temporarily unavailable. Please try again."); }
    return;
  }
  if (command === "/stats" && isAdmin(userId)) {
    await send(chatId, "📊 <b>Bot status</b>\nWebhook is active. User analytics storage is not enabled in this starter build.");
    return;
  }
  if (command === "/broadcast" && isAdmin(userId)) {
    await send(chatId, "Broadcast needs a persistent user database. Connect a database before enabling mass messaging.");
    return;
  }
  if (command === "/premium_add" && isAdmin(userId)) {
    await send(chatId, "Premium activation storage is not enabled yet. Connect a database before using this command.");
    return;
  }
  if (msg.document || msg.photo || msg.video || msg.audio) {
    await send(chatId, "📁 File received. This starter bot can receive Telegram files; persistent file catalog and sharing links need database/storage configuration.");
    return;
  }
  if (text && !text.startsWith("/")) {
    await send(chatId, "I received your message. To chat with AI, use /ai followed by your question.");
  }
}

export default async function handler(req, res) {
  if (req.method === "GET") return res.status(200).json({ ok: true, bot: BOT_NAME, developer: DEVELOPER, status: "webhook endpoint ready" });
  if (req.method !== "POST") return res.status(405).json({ ok: false, error: "Method not allowed" });
  if (SECRET && req.headers["x-telegram-bot-api-secret-token"] !== SECRET) return res.status(401).json({ ok: false });
  try {
    await handle(req.body || {});
    return res.status(200).json({ ok: true });
  } catch (error) {
    console.error("Webhook error:", error.message);
    return res.status(200).json({ ok: true });
  }
}
