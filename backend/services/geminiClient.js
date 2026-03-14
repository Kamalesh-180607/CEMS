const { GoogleGenerativeAI } = require("@google/generative-ai");

const GEMINI_MODEL = "gemini-1.5-flash";

const getGeminiModel = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not configured");
  }

  const client = new GoogleGenerativeAI(apiKey);
  return client.getGenerativeModel({ model: GEMINI_MODEL });
};

module.exports = { getGeminiModel, GEMINI_MODEL };
