const fs = require('node:fs');
const path = require('node:path');

// --> /tools/list — returns PoML definitions dynamically
const getMcpToolsList = (req, res) => {
  const pomlDir = path.join(__dirname, "../poml");
  const tools = fs
    .readdirSync(pomlDir)
    .filter(f => f.endsWith(".poml.json"))
    .map(f => JSON.parse(fs.readFileSync(path.join(pomlDir, f), "utf8")));
  res.json({ tools });
};



module.exports = getMcpToolsList;
