require("dotenv").config();

const crawlers = require("./crawlers/index");
const notify = require("./lib/notify");
const { ms } = require("@simpleanalytics/common");
const { loop } = require("./lib/utils");
const { sendmessage } = require("./lib/telegram");

const { NODE_ENV = "development" } = process.env;

(async () => {
  if (NODE_ENV === "production")
    sendmessage("News alerts app just started up.", { silent: true });

  loop(crawlers, { interval: ms.second * 90 });
  loop(notify, { interval: ms.second * 30 });
})();
