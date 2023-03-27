const { logger } = require("@simpleanalytics/common");

const { query } = require("../db/sqlite");
const {
  launch,
  getPageTextContents,
  getMetaTags,
} = require("../lib/puppeteer");

const hackernews = require("./hackernews");
const googlealerts = require("./googlealerts");
const { getKeywordsAI, interestingIndexArticle } = require("../lib/openai");

module.exports = async () => {
  let cluster = null;

  try {
    cluster = await launch({ maxConcurrency: 10 });

    const articles = [];

    try {
      const hackernewsArticles = await hackernews();
      if (Array.isArray(hackernewsArticles))
        articles.push(...hackernewsArticles);
    } catch (error) {
      logger.error(error);
    }

    try {
      const googlealertsArticles = await googlealerts();
      if (Array.isArray(googlealertsArticles))
        articles.push(...googlealertsArticles);
    } catch (error) {
      logger.error(error);
    }

    const wheres = articles.map(({ platform_id, platform_name }) => {
      return `(platform_id = '${platform_id}' AND platform_name = '${platform_name}')`;
    });

    const savedArticles = await query(
      `
        SELECT
          *
        FROM
          articles
        WHERE
          ${wheres.join(" OR ")}
      `
    );

    for (const article of articles) {
      const savedArticle = savedArticles.find(
        ({ platform_name, platform_id }) =>
          platform_id === article.platform_id &&
          platform_name === article.platform_name
      );

      if (
        savedArticle &&
        article.platform_points === savedArticle.platform_points &&
        article.platform_title === savedArticle.platform_title &&
        article.website_link === savedArticle.website_link &&
        article.platform_rank >= savedArticle.platform_rank
      ) {
        continue;
      } else if (savedArticle) {
        const rank = Math.min(
          savedArticle.platform_rank,
          article.platform_rank
        );
        await query(
          `
            UPDATE
              articles
            SET
              platform_rank = ?,
              platform_points = ?,
              platform_title = ?,
              website_link = ?
            WHERE
              platform_name = ?
              AND platform_id = ?
          `,
          rank,
          article.platform_points,
          article.platform_title,
          article.website_link,
          article.platform_name,
          article.platform_id
        );
      } else if (!savedArticle) {
        let title = null;
        let description = null;

        const isHackerNews =
          article.platform_name === "hackernews" &&
          article.website_link?.startsWith("https://news.ycombinator.com/");

        if (!isHackerNews) {
          try {
            const meta = await cluster.execute(
              article.website_link,
              getMetaTags
            );
            if (meta.title) title = meta.title;
            if (meta.description) description = meta.description;
          } catch (error) {
            logger.error(error);
          }
        }

        const content = await getPageTextContents({
          link: article.website_link,
          cluster,
        });

        const keywords = await getKeywordsAI({
          link: article.website_link,
          content: content?.slice?.(0, 3000) || "",
        });

        const interesting = await interestingIndexArticle({
          link: article.website_link,
          content: content?.slice?.(0, 3000) || "",
        });

        await query(
          `
            INSERT INTO articles
              (
                "platform_name",
                "platform_id",
                "platform_rank",
                "platform_title",
                "website_link",
                "platform_points",
                "website_title",
                "website_description",
                "keywords",
                "interesting_index",
                "interesting_reason"
              )
            VALUES
              (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          `,
          article.platform_name,
          article.platform_id,
          article.platform_rank,
          article.platform_title,
          article.website_link,
          article.platform_points,
          title,
          description,
          keywords.join(","),
          interesting.index,
          interesting.reason
        );
      }
    }
  } catch (error) {
    logger.error(error);
  } finally {
    if (!cluster) return;
    await cluster.idle();
    await cluster.close();
  }
};
