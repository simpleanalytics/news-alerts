const { logger } = require("@simpleanalytics/common");
const { Configuration, OpenAIApi } = require("openai");
const { jsonrepair } = require("jsonrepair");

const { OPENAI_API_KEY } = process.env;

const configuration = new Configuration({ apiKey: OPENAI_API_KEY });

const openai = new OpenAIApi(configuration);

const askChatGPT = async ({ prompt }) => {
  try {
    const completion = await openai.createChatCompletion({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.8,
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

    const prompt = `We are a business called Simple Analytics (simpleanalytics.com). It's a privacy friendly analytics tool for customers who care about privacy on the web. We like articles about: people writing about us, competitors in the privacy space, something related to privacy web analytics, privacy lawsuits and fines, or when Google Analytics gets negative press. Some of our competitors are Fathom (usefathom.com), Plausible (plausible.io), Matomo (matomo.org), and Piwik (piwik.pro). Articles about Google Analytics 4 specifically are not relevant to us. Simplicity by itself is not relavant. Is the following article interesting for us (be conservative)? Reply in JSON with rating (single number between 0 and 100. 0 being not interesting at all, 100 being super interesting). Start with a short explanation first. This is the crawled article downloaded from ${link}:\n\n${content}\n\nReply like this: {"explanation": "...", "rating": ...}`;

    const reply = await askChatGPT({ prompt });
    if (!reply) return { index: null, reason: "No ChatGPT reply" };

    const { explanation, rating } = JSON.parse(jsonrepair(reply));

    return { index: rating, reason: explanation };
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
