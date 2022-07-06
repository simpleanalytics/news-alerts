const { logger } = require("@simpleanalytics/common");
const { Configuration, OpenAIApi } = require("openai");

const { OPENAI_API_KEY } = process.env;

const configuration = new Configuration({ apiKey: OPENAI_API_KEY });

const openai = new OpenAIApi(configuration);

module.exports.getKeywordsAI = async ({ link }) => {
  try {
    const completion = await openai.createCompletion({
      model: "text-davinci-002",
      prompt: `Extract 15 keywords from the content of this URL:\n\n${link}`,
      temperature: 0.1,
      max_tokens: 60,
      top_p: 1.0,
      frequency_penalty: 0.8,
      presence_penalty: 0.0,
    });

    const text = completion?.data?.choices?.[0]?.text;
    if (!text) return [];

    const trimmed = text.trim().replace(/^(\n)+/g, "");

    // It returns a list with 1. 2. 3. n.
    if (trimmed.startsWith("1. ")) {
      return trimmed
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

    // It returns a list with 1, 2, 3, n
    return trimmed
      .replace(/(\n)+/g, " ")
      .split(/, ?/)
      .map((word) => word.trim().toLowerCase());
  } catch (error) {
    logger.error(error);
    return [];
  }
};
