const { ms } = require("@simpleanalytics/common");
const { Cluster } = require("puppeteer-cluster");
const puppeteer = require("puppeteer-extra");
const stealth = require("puppeteer-extra-plugin-stealth");

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
