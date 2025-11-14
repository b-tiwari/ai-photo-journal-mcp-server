require("dotenv").config();
const express = require('express');
const cors = require('cors');
const { registerToolsToMCPServer } = require("./mcp-RegisterTools");

// --------- MCP SDK import ----------
// const { createMcpServer, StdioTransport, HttpSseTransport } = require("@modelcontextprotocol/sdk");
const { McpServer, ResourceTemplate } = require("@modelcontextprotocol/sdk/server/mcp.js");
const { StreamableHTTPServerTransport } = require("@modelcontextprotocol/sdk/server/streamableHttp.js");



  // create MCP server instance
  const mcpServer = new McpServer({
    name: "ai-photo-journal-mcp",
    version: "1.0.0",
    description: "PoML-backed MCP server for image captioning and txt sentiment analysis",
  });

  // Register our server tools based on PoML defs
  registerToolsToMCPServer(mcpServer);
  

  const app = express();
  app.use(express.json());

//   app.use('/mcp', (req, res, next) => {
//   // Auto-fix missing headers for React Native clients
//   if (!req.headers.accept || !req.headers.accept.includes('text/event-stream')) {
//     req.headers.accept = 'text/event-stream, application/json, */*';
//   }
  
//   // Add CORS for React Native
//   res.header('Access-Control-Allow-Origin', '*');
//   res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
//   res.header('Access-Control-Allow-Headers', 'Content-Type, Accept, Mcp-Session-Id, Cache-Control');
  
//   if (req.method === 'OPTIONS') {
//     return res.sendStatus(200);
//   }
  
//   next();
// });
  

  
  // app.post ========================
  app.post('/mcp', async (req, res) => {
    // In stateless mode, create a new transport for each request to prevent
    // request ID collisions. Different clients may use the same JSON-RPC request IDs,
    // which would cause responses to be routed to the wrong HTTP connections if
    // the transport state is shared.
    console.log("Received /mcp POST request, headers:", req.headers);

    try {
        const transport = new StreamableHTTPServerTransport({
            sessionIdGenerator: undefined,
            enableJsonResponse: true
        });

        res.on('close', () => {
            transport.close();
        });

        await mcpServer.connect(transport);
        await transport.handleRequest(req, res, req.body);
    } catch (error) {
        console.error('Error handling MCP request:', error);
        if (!res.headersSent) {
            res.status(500).json({
                jsonrpc: '2.0',
                error: {
                    code: -32603,
                    message: 'Internal server error'
                },
                id: null
            });
        }
    }
});

  // =================================
  // app.options ====================== 

  // app.options('/mcp', (req, res) => {
  //     console.log("Received /mcp OPTIONS request, headers:", req.headers);
  //     res.set('Access-Control-Allow-Origin', '*');
  //     res.set('Access-Control-Allow-Methods', 'POST, OPTIONS');
  //     res.set('Access-Control-Allow-Headers', 'Content-Type');
  //     res.sendStatus(204);
  // });

  //==============================
  // app.get ========================
  // app.get('/mcp', async (req, res) => {
  //   // In stateless mode, create a new transport for each request to prevent
  //   // request ID collisions. Different clients may use the same JSON-RPC request IDs,
  //   // which would cause responses to be routed to the wrong HTTP connections if
  //   // the transport state is shared.

  //   try {
  //       const transport = new StreamableHTTPServerTransport({
  //           sessionIdGenerator: undefined,
  //           enableJsonResponse: true
  //       });

  //       res.on('close', () => {
  //           transport.close();
  //       });

  //       await mcpServer.connect(transport);
  //       await transport.handleRequest(req, res);
  //   } catch (error) {
  //       console.error('Error handling MCP request:', error);
  //       if (!res.headersSent) {
  //           res.status(500).json({
  //               jsonrpc: '2.0',
  //               error: {
  //                   code: -32603,
  //                   message: 'Internal server error'
  //               },
  //               id: null
  //           });
  //       }
  //   }
  // }); 



  
  // =================================
  // Start the Express server 
  const PORT = parseInt(process.env.PORT || '5102');
  app.listen(PORT, () => {
      console.log(`MCP Server running on http://localhost:${PORT}/mcp`);
  }).on('error', error => {
      console.error('Server error:', error);
      process.exit(1);
  });
