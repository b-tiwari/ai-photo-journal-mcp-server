const OpenAI = require('openai');

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const sentimentController = async (text) => {
  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      { role: "user", content: `Analyze the sentiment of this phrase: "${text}". Reply only with positive, neutral, or negative.` }
    ]
  });

  return { sentiment: response.choices[0].message.content.trim().toLowerCase() };
};

module.exports = sentimentController;
