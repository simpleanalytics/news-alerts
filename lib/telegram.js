const { logger } = require("@simpleanalytics/common");
const { getJSON } = require("./request");

const { NODE_ENV, TELEGRAM_BOT_TOKEN, TELEGRAM_CHAT_ID } = process.env;

module.exports.sendToTelegram = async (
  message,
  { silent = false, preview = false } = {}
) => {
  if (NODE_ENV !== "production") return logger.info(`Telegram: ${message}`);
  else logger.info(`Telegram: ${message}`);
  if (!TELEGRAM_BOT_TOKEN) throw new Error("No TELEGRAM_BOT_TOKEN defined");
  if (!TELEGRAM_CHAT_ID) throw new Error("No TELEGRAM_CHAT_ID defined");

  const params = new URLSearchParams();
  params.set("chat_id", TELEGRAM_CHAT_ID);
  params.set("text", message);
  params.set("parse_mode", "HTML");
  params.set("disable_web_page_preview", preview ? "false" : "true");
  params.set("disable_notification", silent ? "true" : "false");

  const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendmessage?${params}`;

  try {
    return await getJSON(url);
  } catch (error) {
    logger.error(error);
    return error;
  }
};
