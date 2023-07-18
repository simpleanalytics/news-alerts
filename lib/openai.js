const { logger } = require("@simpleanalytics/common");
const { Configuration, OpenAIApi } = require("openai");

const { OPENAI_API_KEY } = process.env;

const configuration = new Configuration({ apiKey: OPENAI_API_KEY });

const openai = new OpenAIApi(configuration);

const askChatGPT = async ({ prompt }) => {
  try {
    const completion = await openai.createChatCompletion({
      model: "gpt-4",
      messages: [{ role: "user", content: prompt }],
    });

    const text = completion?.data?.choices?.[0]?.message.content;
    if (!text) return "";

    const trimmed = text.trim().replace(/^(\n)+/g, "");

    return trimmed;
  } catch (error) {
    logger.error(error);
    return "";
  }
};

module.exports.interestingIndexArticle = async ({ link, content }) => {
  try {
    if (!content) return { index: null, reason: "No crawled content" };

    const prompt = `We are a business called Simple Analytics (simpleanalytics.com). It's a privacy friendly analytics tool for customers who care about privacy on the web. We like articles about: people writing about us, competitors in the privacy space, something related to privacy web analytics, or when Google Analytics gets negative press. Some of our competitors are Fathom (usefathom.com), Plausible (plausible.io), Matomo (matomo.org), and Piwik (piwik.pro). Articles about Google Analytics 4 specifically are not relevant to us. Is the following article interesting for us? Reply with a single number between 0 and 100. 0 being not interesting at all, 100 being super interesting. After this number, add a dash (-), following by a short explanation. This is the crawled article:\n\n${content}`;

    const reply = await askChatGPT({ prompt });
    if (!reply) return { index: null, reason: "No ChatGPT reply" };

    const index = /^[0-9]+$/.test(reply)
      ? parseInt(reply, 10)
      : reply.match(/^[0-9]+/)?.[0]
      ? parseInt(reply.match(/^[0-9]+/)[0], 10)
      : null;

    const reason = reply.match(/- ?(.*)$/m)?.[1] || null;

    return { index, reason };
  } catch (error) {
    logger.error(error);
    return { index: null, reason: error.message };
  }
};

module.exports.getKeywordsAI = async ({ link, content }) => {
  try {
    const prompt = `Extract 15 keywords from the content of this URL:\n\n${link}${
      content ? `\n\nContents:\n\n${content}\n\n` : ""
    }`;

    const reply = await askChatGPT({ prompt });
    if (!reply) return [];

    // It returns a list with 1. 2. 3. n.
    if (reply.startsWith("1. ")) {
      return reply
        .split("\n")
        .map((line) =>
          line
            .replace(/^[0-9]+\. ?/, "")
            .replace(/(\n)+/g, " ")
            .trim()
            .toLowerCase()
        )
        .filter(Boolean);
    }

    // It returns a comma separated list with 1, 2, 3, n
    return reply
      .replace(/(\n)+/g, " ")
      .split(/, ?/)
      .map((word) => word.trim().toLowerCase());
  } catch (error) {
    logger.error(error);
    return [];
  }
};
