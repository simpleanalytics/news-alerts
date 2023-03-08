const { logger } = require("@simpleanalytics/common");

const { query } = require("../db/sqlite");
const { sendmessage } = require("./telegram");
const twist = require("./twist");

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
        AND (
          interesting_index > 30
          OR (
            interesting_index IS NULL
            AND (
              platform_title LIKE $ga OR website_title LIKE $ga OR website_description LIKE $ga
              OR platform_title LIKE $sa OR website_title LIKE $sa OR website_description LIKE $sa
              OR (
                platform_name = $hackernews
                AND (
                  platform_title LIKE $privacy
                  OR website_title LIKE $privacy
                  OR platform_title LIKE $gdpr
                  OR website_title LIKE $gdpr
                  OR website_title LIKE $vue
                  OR website_title LIKE $nuxt
                  OR platform_title LIKE $ethics
                  OR website_title LIKE $ethics
                  OR platform_title LIKE $cookie
                  OR website_title LIKE $cookie)
              )
              OR keywords LIKE $cookie
              OR keywords LIKE $privacy
              OR keywords LIKE $gdpr
              OR keywords LIKE $ethics
              OR website_link LIKE $simpleanalyticscom
            )
          )
        )
    `,
    {
      $ga: "%google analytics%",
      $sa: "%simple analytics%",
      $hackernews: "hackernews",
      $privacy: "%privacy%",
      $cookie: "%cookie%",
      $gdpr: "%gdpr%",
      $ethics: "%ethics%",
      $vue: "%vue%",
      $nuxt: "%nuxt%",
      $cookiebanner: "%site%use%cookies%",
      $simpleanalyticscom: "%simpleanalytics.com%",
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

      const markdown = `${serviceMd}**${title}** - [${hostname}](${link})${
        reason ? `\n> AI rating ${index}/100: ${reason}` : ""
      }`;

      // Send alert to Twist
      await twist.threadIntegration({
        url: twist.integrationUrls.news_alerts,
        content: markdown,
      });

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

      // Send alert to Telegram
      const silent = name === "googlealerts" || (index && index < 50);
      await sendmessage(message, { silent });

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
