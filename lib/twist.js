const { logger } = require("@simpleanalytics/common");
const { default: axios } = require("axios");

const {
  TWIST_INTEGRATION_GENERAL_NEWS_ALERTS_ID,
  TWIST_INTEGRATION_GENERAL_NEWS_ALERTS_TOKEN,
} = process.env;

const integrationUrl = ({ id, token }) => {
  const api = "https://twist.com/api/v3/integration_incoming/post_data";
  const url = new URL(api);
  url.searchParams.set("install_id", id);
  url.searchParams.set("install_token", token);
  return url.toString();
};

module.exports.integrationUrls = {
  news_alerts: integrationUrl({
    id: TWIST_INTEGRATION_GENERAL_NEWS_ALERTS_ID,
    token: TWIST_INTEGRATION_GENERAL_NEWS_ALERTS_TOKEN,
  }),
};

module.exports.threadIntegration = async ({ url, content }) => {
  const body = { content };

  const options = {
    headers: {
      "Content-Type": "application/json",
      "User-Agent": "Simple Analytics Integration",
    },
  };

  try {
    const { data } = await axios.post(url, body, options);
    return data;
  } catch (error) {
    logger.error(error.response?.status, error.response?.data);
    return {};
  }
};

module.exports.channelIntegration = async ({ url, content, title }) => {
  const body = { content, title };

  const options = {
    headers: {
      "Content-Type": "application/json",
      "User-Agent": "Simple Analytics News Alerts Integration",
    },
  };

  try {
    const { data } = await axios.post(url, body, options);
    return data;
  } catch (error) {
    logger.error(error.response?.status, error.response?.data);
    return {};
  }
};
