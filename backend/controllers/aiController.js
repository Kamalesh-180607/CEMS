const { GoogleGenerativeAI } = require("@google/generative-ai");

const chatWithAssistant = async (req, res) => {
  try {
    const { message } = req.body;

    if (!message || !String(message).trim()) {
      return res.status(400).json({ reply: "Please enter a message." });
    }

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = [
      "You are an assistant for a campus event management system.",
      "Answer student questions about events, registration, and announcements.",
      "Keep answers clear, concise, and actionable.",
      `Student question: ${String(message).trim()}`,
    ].join("\n\n");

    const result = await model.generateContent(prompt);
    const reply = result.response.text();

    return res.status(200).json({ reply: (reply || "").trim() || "I could not generate a response right now." });
  } catch (error) {
    console.error("AI Chat Error:", error);
    return res.status(500).json({ reply: "Assistant is unavailable right now" });
  }
};

module.exports = { chatWithAssistant };
