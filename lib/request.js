const https = require("https");
const http = require("http");
const fetch = require("node-fetch");
const { logger } = require("@simpleanalytics/common");

const USER_AGENT =
  "Mozilla/5.0 (compatible; SimpleAnalyticsBot/1.0; +https://docs.simpleanalytics.com/bots)";
const DEFAULT_HEADERS = { "User-Agent": USER_AGENT };
const DEFAULT_CRAWL_TIMEOUT = 5000;

const getBody = (req) => {
  return new Promise((resolve) => {
    let body = "";
    req.on("data", (chunk) => {
      body += chunk.toString();
    });
    req.on("end", () => {
      resolve(body);
    });
  });
};

const getJSON = async (req) => {
  const body = await getBody(req);
  return JSON.parse(body);
};

module.exports.getStatusCode = (url) => {
  return new Promise((resolve, reject) => {
    https
      .get(url, (res) => {
        resolve(res.statusCode);
      })
      .on("error", (e) => reject(e));
  });
};

module.exports.getContent = (url) => {
  return new Promise((resolve, reject) => {
    https
      .get(url, async (res) => {
        if (res.statusCode !== 200) resolve(false);
        const json = await getBody(res);
        resolve(json);
      })
      .on("error", (e) => reject(e));
  });
};

module.exports.getJSON = (
  url,
  { headers, timeout = DEFAULT_CRAWL_TIMEOUT, ...rest } = { method: "GET" }
) => {
  const module = url.startsWith("https://") ? https : http;

  const options = {
    timeout,
    ...rest,
    headers: {
      ...DEFAULT_HEADERS,
      ...headers,
    },
  };

  return new Promise((resolve, reject) => {
    const req = module.request(url, options, async (res) => {
      try {
        const json = await getJSON(res);
        if (res.statusCode !== 200) reject(json);
        else resolve(json);
      } catch (error) {
        reject(error);
      }
    });

    req.on("timeout", () => {
      req.destroy();
    });

    // When using http.request you need to end the request yourself
    req.end();

    req.on("error", (e) => reject(e));
  });
};

module.exports.post = (custom) => {
  const options = { method: "POST", timeout: DEFAULT_CRAWL_TIMEOUT, ...custom };
  return new Promise((resolve, reject) => {
    const request = options.port == 443 ? https.request : http.request;
    const req = request(options, async (res) => {
      try {
        const json = await getJSON(res);
        if (res.statusCode !== 200) reject(json);
        else resolve(json);
      } catch (error) {
        reject(error);
      }
    });

    req.on("timeout", () => {
      req.destroy();
    });

    req.on("error", (e) => reject(e));

    if (options.data) req.write(options.data);

    req.end();
  });
};

module.exports.checkSSLCertificate = ({ hostname }) => {
  const daysBetween = (from, to) => Math.round(Math.abs(+from - +to) / 8.64e7);

  const options = {
    agent: false,
    rejectUnauthorized: false,
    port: 443,
    protocol: "https:",
    timeout: DEFAULT_CRAWL_TIMEOUT,
  };

  return new Promise(function (resolve) {
    try {
      const url = `https://${hostname}`;
      const req = https.request(url, options, (res) => {
        const cert = res.socket.getPeerCertificate();
        const { valid_to: validTo } = cert;
        const daysRemaining = daysBetween(new Date(), new Date(validTo));
        return resolve(daysRemaining);
      });
      req.on("error", (error) => {
        logger.warn(error, hostname);
        resolve(false);
      });
      req.end();
    } catch (e) {
      resolve(false);
    }
  });
};

const getHeaders = ({ url } = {}) => {
  if (!/https?:\/\//.test(url))
    throw new Error(`Invalid URL in getHeaders: ${url}`);

  const module = url.startsWith("https://") ? https : http;

  return new Promise((resolve, reject) => {
    try {
      const req = module.request(
        url,
        {
          headers: DEFAULT_HEADERS,
          timeout: DEFAULT_CRAWL_TIMEOUT,
        },
        (res) => {
          resolve(res.headers);
        }
      );

      req.on("timeout", () => {
        req.destroy();
      });

      req.on("error", (error) => {
        reject(error);
      });

      req.end();
    } catch (error) {
      reject(error);
    }
  });
};

module.exports.getHeaders = getHeaders;

module.exports.resolveRedirectUrl = async ({ url, times = 3 } = {}) => {
  if (!/https?:\/\//.test(url))
    throw new Error(`Invalid URL in resolveRedirectUrl: ${url}`);

  let resolved = url;

  try {
    for (let index = 0; index < times; index++) {
      const headers = await getHeaders({ url: resolved });
      if (headers.location) {
        let nextResolved = headers.location;
        if (nextResolved.startsWith("/")) {
          nextResolved =
            resolved.split("/").slice(0, 3).join("/") + nextResolved;
        }
        resolved = nextResolved;
      } else {
        break;
      }
    }
  } catch (error) {
    if (error.message !== "socket hang up" && error.code !== "ECONNRESET") {
      logger.error(error);
    }
  }

  return resolved;
};

module.exports.transcribeYoutubeVideo = async ({ link }) => {
  try {
    const url = "https://youtube-transcriber.adriaanvanrossum.nl/transcribe";
    const options = {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: `youtube_url_or_id=${encodeURIComponent(link)}&model=tiny`,
    };

    const response = await fetch(url, options);
    const json = await response.json();

    return json?.text?.trim();
  } catch (error) {
    logger.error(error);
    return null;
  }
};
