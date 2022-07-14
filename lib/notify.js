const { logger } = require("@simpleanalytics/common");
const { query } = require("../db/sqlite");
const { sendmessage } = require("./telegram");

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
    } = article;

    try {
      const service =
        name === "googlealerts"
          ? "Google Alert"
          : `<a href="https://news.ycombinator.com/item?id=${id}">Hacker News</a> #${rank} (${points} votes)`;
      const { hostname } = new URL(link);
      const message = [
        `${service}: <b>${title}</b> - <a href="${link}">${hostname.replace(
          /^www\./g,
          ""
        )}</a>`,
        description?.length > 25
          ? `<i>${description.slice(0, 100)}${
              description?.length > 101 ? "..." : ""
            }</i>`
          : null,
      ]
        .filter(Boolean)
        .join("\n");

      // Send alert to Telegram
      const silent = name === "googlealerts";
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
