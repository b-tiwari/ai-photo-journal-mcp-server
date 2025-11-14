const OpenAI = require('openai');

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

//--> Controller function for getting Sentiment/emotions for a text
//--> (Write it as Function statement so that it can be later used by the MCP SDK package)
async function sentimentTool(args){
  if (!args || !args.text) throw new Error("Missing required argument: text");
  console.log("sentimentTool called with args:", args);
  const prompt = `Analyze the sentiment of the following text and return "positive", "neutral", or "negative":\n\n"${args.text}"`;

  const response = await openai.responses.create({
    model: "gpt-4.1-mini",
    input: [{ role: "user", content: [{ type: "input_text", text: prompt }] }],
  });

  const out = response.output?.[0]?.content?.[0]?.text || "neutral";


  const sentiment = out.trim().toLowerCase();
  console.log("Extracted sentiment:", sentiment);

  return {
    content: [
      {
        type: 'text',
        text: `Sentiment: ${sentiment}`
      }
    ],
    structuredContent: {
      sentiment: sentiment
    }
  };
}

module.exports = { sentimentTool };
