const removeTags = (str) => {
  return str?.replace?.(/<[^>]*>/g, "").replace(/&nbsp;\.\.\./g, "");
};

const decodeHTML = (str) => {
  var map = { gt: ">" /* , … */ };
  return str.replace(/&(#(?:x[0-9a-f]+|\d+)|[a-z]+);?/gi, function ($0, $1) {
    if ($1[0] === "#") {
      return String.fromCharCode(
        $1[1].toLowerCase() === "x"
          ? parseInt($1.substr(2), 16)
          : parseInt($1.substr(1), 10)
      );
    } else {
      return map.hasOwnProperty($1) ? map[$1] : $0;
    }
  });
};

const cleanText = (str) => {
  return removeTags(decodeHTML(str));
};

const USER_AGENT =
  "Mozilla/5.0 (compatible; SimpleAnalyticsBot/1.0; +https://docs.simpleanalytics.com/bots)";

const TRIM = /^\s+|\s+$/gm;

const getMetaTags = async ({ page, data: url }) => {
  page.setUserAgent(USER_AGENT);
  await page.setViewport({ width: 1440, height: 900 });

  let title, description;

  for (const javascript of [false, true]) {
    page.setJavaScriptEnabled(javascript);

    if (javascript) await page.goto(url);
    else await page.goto(url, { waitUntil: "networkidle2" });

    title =
      title ||
      (await page.evaluate(() => {
        return (
          document.querySelector('meta[name="og:title"')?.content ||
          document.querySelector('meta[name="twitter:title"')?.content ||
          document.querySelector('meta[property="og:title"')?.content ||
          document.querySelector("title")?.textContent
        );
      }));

    description =
      description ||
      (await page.evaluate(() => {
        return (
          document.querySelector('meta[name="description"')?.content ||
          document.querySelector('meta[property="description"')?.content ||
          document.querySelector('meta[name="og:description"')?.content ||
          document.querySelector('meta[name="twitter:description"')?.content ||
          document.querySelector('meta[property="og:description"')?.content ||
          document.querySelector("description")?.textContent ||
          document.querySelector("p")?.textContent?.slice(0, 500)
        );
      }));

    if (title && description) break;
  }

  return {
    title: title ? title.replace(TRIM, "") : null,
    description: description ? description.replace(TRIM, "") : null,
  };
};

const loop = (func, { start, interval }) => {
  if (!start) start = Date.now() - interval;
  const now = Date.now();
  const elapsed = now - start;
  start = Date.now();
  const waiting = Math.max(interval - elapsed, 0);

  setTimeout(async () => {
    func()
      .then(() => loop(func, { start, interval }))
      .catch(() => loop(func, { start, interval }));
  }, waiting);
};

module.exports = {
  removeTags,
  decodeHTML,
  cleanText,
  getMetaTags,
  loop,
};
