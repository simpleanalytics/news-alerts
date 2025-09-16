const { logger } = require("@simpleanalytics/common");
const https = require("https");

const { NODE_ENV, MATTERMOST_URL, MATTERMOST_TOKEN, MATTERMOST_CHANNEL_ID } =
  process.env;

module.exports.sendToMattermost = async (message) => {
  if (NODE_ENV !== "production") return logger.info(`Mattermost: ${message}`);
  else logger.info(`Mattermost: ${message}`);

  if (!MATTERMOST_URL) throw new Error("No MATTERMOST_URL defined");
  if (!MATTERMOST_TOKEN) throw new Error("No MATTERMOST_TOKEN defined");
  if (!MATTERMOST_CHANNEL_ID)
    throw new Error("No MATTERMOST_CHANNEL_ID defined");

  const url = new URL("/api/v4/posts", MATTERMOST_URL);

  const body = JSON.stringify({
    channel_id: MATTERMOST_CHANNEL_ID,
    message,
  });

  try {
    const options = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${MATTERMOST_TOKEN}`,
        "User-Agent": "Simple Analytics News Alerts",
      },
    };
    const req = https.request(url, options);
    req.on("error", (error) => logger.error(error));
    req.write(body);
    req.end();
  } catch (error) {
    logger.error(error);
  }

  return true;
};
