const {captionTool} = require('../controllers/captionTool.js');
const { sentimentTool } = require('../controllers/sentimentTool.js');

// --> handler function for /tools/call - executes a tool based on the request body
const getMcpToolsExecute = async (req, res) => {
  const { name = null, arguments: args = null} = req.body;
  console.log("Tool call received:", name, args, req.body);

  if (!name ) {
      return res.status(400).send("Missing or invalid value for the 'name' parameter in payload");
  }


  try {
    let result;

    switch (name) {

      case "generate_caption": {
        console.log("Going to process caption tool with request:");
        const captionArgs = processRequestForImageData(req);
        console.log("Caption tool args constructed:", captionArgs);
        result = await captionTool(captionArgs);
        break;
      }

      case "analyze_sentiment": {
        if (!args.text) {
          return res.status(400).send("Missing 'text' field in arguments for sentiment analysis");
        }
        result = await sentimentTool(args);
        break;
      }
      default:
        return res.status(400).json({ error: `Unknown tool: ${name}` });
    }

    res.json({
      name,
      output: result,
      status: "success",
    });
  } catch (err) {
    console.error("ERROR: Tool execution error:", err);
    res.status(500).json({ error: err.message });
  }
};

// Helper function to process image data and get caption
function processRequestForImageData(req) {
  let args = {};

  console.log("~~~~~~~ Processing request for image data:", req.body);

  // if request has multipart form, parse `input` JSON field if available
  if (req?.body?.input) {
    try {
      args = JSON.parse(req.body.input);
    } catch {}
  }

  // if image data is present as base64 or file buffer, add to args
  if (req?.body?.arguments?.imageBase64) {
    args.imageBase64 = req.body.arguments.imageBase64;
  }

  if (req?.file?.buffer) {
    args.file = req.file;
  }

  return args;
}


module.exports = getMcpToolsExecute;
