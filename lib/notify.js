const { logger } = require("@simpleanalytics/common");

const { query } = require("../db/sqlite");
const { sendToTelegram } = require("./telegram");
const { sendToMattermost } = require("./mattermost");

const { INTERESTING_THRESHOLD } = process.env;

const interestingThreshold = parseInt(INTERESTING_THRESHOLD);

module.exports = async () => {
  const importantArticles = await query(
    `
      SELECT
        *
      FROM
        articles
      WHERE
        (alerted_at IS NULL OR alerted_at = '')
        AND website_description NOT LIKE $cookiebanner
        AND interesting_index >= $interestingThreshold
    `,
    {
      $cookiebanner: "%site%use%cookies%",
      $interestingThreshold: interestingThreshold,
    }
  );

  for (const article of importantArticles) {
    const {
      id: article_id,
      platform_name: name,
      platform_id: id,
      platform_title: title,
      platform_rank: rank,
      platform_points: points,
      website_link: link,
      website_description: description,
      interesting_index: index,
      interesting_reason: reason,
    } = article;

    try {
      const { hostname: host } = new URL(link);
      const hostname = host.replace(/^www\./g, "");

      const hnLink =
        name === "hackernews"
          ? `https://news.ycombinator.com/item?id=${id}`
          : null;

      const serviceMd =
        name === "googlealerts"
          ? "Google Alert - "
          : `[Hacker News](${hnLink}) #${rank} (${points} votes)\n`;

      const markdown = [
        `${serviceMd}**${title}** - [${hostname}](${link})`,
        description?.length > 25
          ? `_${description.slice(0, 200)}${
              description?.length > 201 ? "..." : ""
            }_`
          : null,
      ]
        .filter(Boolean)
        .join("\n");

      const service =
        name === "googlealerts"
          ? "Google Alert"
          : `<a href="${hnLink}">Hacker News</a> #${rank} (${points} votes)`;

      const message = [
        `${service}: <b>${title}</b> - <a href="${link}">${hostname}</a>`,
        description?.length > 25
          ? `<i>${description.slice(0, 100)}${
              description?.length > 101 ? "..." : ""
            }</i>`
          : null,
      ]
        .filter(Boolean)
        .join("\n");

      // Send alert to Telegram (HTML)
      const silent = name === "googlealerts" || (index && index < 50);
      await sendToTelegram(message, { silent });

      // Send alert to Mattermost (markdown)
      await sendToMattermost(markdown);

      // Update alerted_at
      await query(
        `
        UPDATE
          articles
        SET
          alerted_at = CURRENT_TIMESTAMP
        WHERE
          id = ?
      `,
        article.id
      );
    } catch (error) {
      logger.error(error, "notify", article_id);
    }
  }
};
