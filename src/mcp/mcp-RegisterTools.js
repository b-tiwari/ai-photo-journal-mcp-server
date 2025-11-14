// server.js
require("dotenv").config();
const fs = require("node:fs");
const path = require("node:path");
const { z } = require("zod");
const { captionTool } = require("../controllers/captionTool");
const { sentimentTool } = require("../controllers/sentimentTool");


const captionToolPossibleNames = ["generate_caption", "caption_tool", "generate_image_caption", "image_caption", "caption", "captionTool", "imageCaption"];
const sentimentToolPossibleNames = ["analyze_sentiment", "analyze_text_sentiment", "sentiment_tool", "text_sentiment_analysis", "sentiment_analysis"];


const isCaptionTool = (toolName) => captionToolPossibleNames.includes(toolName.toLowerCase());
const isSentimentTool = (toolName) => sentimentToolPossibleNames.includes(toolName.toLowerCase());

/**
 * @name loadPomlTools
 * @description Load PoML tool definitions from a directory
 * @param {string} dir - directory path containing PoML JSON files
 */
function loadPomlTools(dir) {
  console.log("Loading PoML tools from directory:", dir);
  const files = fs.readdirSync(dir).filter((f) => f.endsWith(".poml.json")); // startsWith("sentiment")); // 
  const tools = files.map((f) => {
    const raw = fs.readFileSync(path.join(dir, f), "utf8");
    const parsed = JSON.parse(raw);
    // some PoML formats nest under "tool"
    return parsed.tool || parsed;
  });
  return tools;
}


/**
 * @name registerToolsToMCPServer
 * @param {*} mcpServer
 * @description Register tools to MCP server based on PoML definitions
 */
async function registerToolsToMCPServer(mcpServer) {
  console.log("CWD:", process.cwd());
  const pomlDir = path.join(process.cwd(), "src/poml");
  console.log("PoML Directory:", pomlDir);
  const tools = loadPomlTools(pomlDir);

  // Register tools based on PoML
  for (const t of tools) {
    // const name = t.name;
    // const description = t.description || "";
    // const title = t.title || name;

    const { name = '', description = '', title = t.name } = t;

    // Simple runtime validator (we expect image:string for caption; text:string for sentiment)
    let inputSchema, outputSchema;
    let cbFunction;
    if (isCaptionTool(name)) {

      // single param image:string
      inputSchema = { 
        image: z.string().optional(), 
        imageBase64: z.string().optional() 
      };
      cbFunction = async (args) => await captionTool(args);

    } else if (isSentimentTool(name)) {

      // inputSchema = z.object({ text: z.string() });
      // outputSchema = z.object({ sentiment: z.string() });
      inputSchema = { text: z.string() };
      outputSchema =  { sentiment: z.string() };
      cbFunction = async (args) => await sentimentTool(args);

    } else {
      inputSchema = z.object({});
      outputSchema = z.object({});
      // generic fallback: accept an object and return a not-implemented error
      cbFunction = async (args) => {
        throw new Error(`Tool handler not implemented for ${name}`);
      };  
    }

    mcpServer.registerTool(name, { title, description, inputSchema, outputSchema }, cbFunction);
    console.log(`Successfully Registered MCP tool: ${name}`);
  }

  return mcpServer;
};

module.exports = { registerToolsToMCPServer };


