require('dotenv').config();
const log = console.log;
const path = require('path');
const express = require('express');
const app = express();

const server = app.listen(process.env.PORT, () =>
  log(`Binance SPOT user portfolio app started on port ${process.env.PORT}`)
);

app.use('/public', express.static(path.join(__dirname, './Pages')));
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, './Pages/index.html'));
});

//Socket Server
require('./Utils/socketServer').run(server);

require('./Utils/price').scheduleJob();
