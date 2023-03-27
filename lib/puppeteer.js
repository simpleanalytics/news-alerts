const { ms } = require("@simpleanalytics/common");
const { Cluster } = require("puppeteer-cluster");
const puppeteer = require("puppeteer-extra");
const stealth = require("puppeteer-extra-plugin-stealth");
const { transcribeYoutubeVideo } = require("./request");

module.exports.args = [
  "--allow-running-insecure-content",
  "--autoplay-policy=user-gesture-required",
  "--disable-background-networking",
  "--disable-background-timer-throttling",
  "--disable-backgrounding-occluded-windows",
  "--disable-breakpad",
  "--disable-client-side-phishing-detection",
  "--disable-component-update",
  "--disable-default-apps",
  "--disable-dev-shm-usage",
  "--disable-domain-reliability",
  "--disable-extensions",
  "--disable-features=AudioServiceOutOfProcess",
  "--disable-gpu",
  "--disable-hang-monitor",
  "--disable-infobars",
  "--disable-ipc-flooding-protection",
  "--disable-notifications",
  "--disable-offer-store-unmasked-wallet-cards",
  "--disable-popup-blocking",
  "--disable-print-preview",
  "--disable-prompt-on-repost",
  "--disable-renderer-backgrounding",
  "--disable-setuid-sandbox",
  "--disable-speech-api",
  "--disable-sync",
  "--disable-web-security",
  "--hide-scrollbars",
  "--ignore-certificate-errors-spki-list",
  "--ignore-certificate-errors",
  "--ignore-gpu-blacklist",
  "--metrics-recording-only",
  "--mute-audio",
  "--no-default-browser-check",
  "--no-first-run",
  "--no-pings",
  "--no-sandbox",
  "--no-zygote",
  "--password-store=basic",
  "--use-gl=swiftshader",
  "--use-mock-keychain",
  "--window-position=0,0",
];

puppeteer.use(stealth());

const puppeteerOptions = {
  headless: true,
  args: this.args,
  ignoreHTTPSErrors: true,
  acceptInsecureCerts: true,
};

const defaultOptions = {
  puppeteer,
  concurrency: Cluster.CONCURRENCY_PAGE,
  timeout: ms.second * 20,
  retryLimit: 1,
  retryDelay: 500,
  workerCreationDelay: 100,
  maxConcurrency: 4,
  puppeteerOptions,
};

module.exports.launch = (options = {}) => {
  return Cluster.launch({
    ...defaultOptions,
    ...options,
  });
};

module.exports.launchProxy = (options = {}) => {
  return this.launch({ ...options, puppeteerOptions: {} });
};

const USER_AGENT =
  "Mozilla/5.0 (compatible; SimpleAnalyticsBot/1.0; +https://docs.simpleanalytics.com/bots)";

const TRIM = /^\s+|\s+$/gm;

const setDefaults = async (page) => {
  page.setUserAgent(USER_AGENT);
  await page.setViewport({ width: 1440, height: 900 });
};

module.exports.getPageTextContents = async ({ link, cluster }) => {
  const { hostname } = new URL(link);
  if (["youtu.be", "youtube.com", "www.youtube.com"].includes(hostname))
    return await transcribeYoutubeVideo({ link });

  const taskFunction = async ({ page, data: url }) => {
    await setDefaults(page);

    await page.goto(url, { timeout: 60000, waitUntil: "networkidle2" });
    const text = await page.evaluate(() => document.body.innerText);
    return text || "";
  };

  return await cluster.execute(link, taskFunction);
};

module.exports.getMetaTags = async ({ page, data: url }) => {
  await setDefaults(page);

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
