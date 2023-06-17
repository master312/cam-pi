const express = require('express');
const path = require('path');
const http = require('http');
const hostRouter = require('./hostInfo');
const streamRouter = require('./streamOps');

const { startServer, getServerStatus } = require('./mediaServer');
const mediaConfig = require('./mediaConfig')

const port = 3000

const app = express();
const server = http.createServer(app);

app.use(express.static(path.join(__dirname, 'public')));

app.use('/host', hostRouter);

app.use('/stream', streamRouter);

app.get('/server-status', (req, res) => {
    return res.json(getServerStatus());
});

startServer(mediaConfig);

server.listen(port, function () {
    console.log('Express listening on port ' + port);
});
