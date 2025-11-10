require('dotenv').config();
const express = require('express');
const cors = require('cors');


const app = express();

app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => res.json({ status: 'ok' }));

const toolsRoutes = require('./routes/routes.js');
app.use('/tools', toolsRoutes);

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`🚀 MCP server running on Port ${PORT}`));



