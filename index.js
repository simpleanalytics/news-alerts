require("dotenv").config();

const { ms, logger } = require("@simpleanalytics/common");

const crawlers = require("./crawlers/index");
const notify = require("./lib/notify");
const { loop } = require("./lib/utils");
const { sendToTelegram } = require("./lib/telegram");
const { sendToMattermost } = require("./lib/mattermost");

const { NODE_ENV = "development", INTERESTING_THRESHOLD } = process.env;

if (!INTERESTING_THRESHOLD) throw new Error("INTERESTING_THRESHOLD is not set");

(async () => {
  if (NODE_ENV === "production") {
    let message = "News alerts app just started up";
    try {
      const current = require("./commits/current.json");
      const previous = require("./commits/previous.json");

      const url =
        previous.commit && current.commit
          ? `https://github.com/${current.repo}/compare/${previous.commit}...${current.commit}`
          : null;

      const commit = current?.message?.replace(/-/g, " ");
      message = `Deployed "${commit}" ${
        url ? `<a href="${url}">GitHub</a>` : ""
      }`;
    } catch (error) {
      logger.error(error);
    }

    // Telegram
    sendToTelegram(message, { silent: true });

    // Mattermost (send plain text)
    const mattermostMessage = message.replace(/<[^>]+>/g, "");
    sendToMattermost(mattermostMessage);
  }

  loop(crawlers, { interval: ms.second * 90 });
  loop(notify, { interval: ms.second * 30 });
})();
