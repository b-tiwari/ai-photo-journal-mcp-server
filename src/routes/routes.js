const express = require('express');
const multer = require('multer');
const getMcpToolsList = require('./toolsList.js');
const getMCPTaskExecute = require('./toolsCall.js');   


const router = express.Router();
const storage = multer.memoryStorage();
const upload = multer({ storage });

router.get('/list', getMcpToolsList);
router.post('/call', upload.single('image'), getMCPTaskExecute);

module.exports = router;

