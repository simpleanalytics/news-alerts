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
              OR platform_title LIKE $cookie
              OR website_title LIKE $cookie)
          )
          OR keywords LIKE $cookie
          OR keywords LIKE $privacy
          OR keywords LIKE $gdpr
        )
    `,
    {
      $ga: "%google analytics%",
      $sa: "%simple analytics%",
      $hackernews: "hackernews",
      $privacy: "%privacy%",
      $cookie: "%cookie%",
      $gdpr: "%gdpr%",
    }
  );

  for (const article of importantArticles) {
    const {
      platform_name: name,
      platform_id: id,
      platform_title: title,
      platform_rank: rank,
      platform_points: points,
      website_link: link,
      website_description: description,
    } = article;

    const service =
      name === "googlealerts"
        ? "Google Alert"
        : `<a href="https://news.ycombinator.com/item?id=${id}">Hacker News #${rank}</a> ${points}`;
    const { hostname } = new URL(link);
    const message = [
      `${service}: <b>${title}</b> - <a href="${link}">${hostname.replace(
        /^www\./g,
        ""
      )}</a>`,
      description.length > 25
        ? `<i>${description?.slice(0, 100)}${
            description.length > 101 ? "..." : ""
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
  }
};
