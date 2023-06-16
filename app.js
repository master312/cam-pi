const express = require('express');
const path = require('path');
const http = require('http');
const hostRouter = require('./host_info');
const streamRouter = require('./stream_ops');

const port = 1000

const app = express();
const server = http.createServer(app);

app.use(express.static(path.join(__dirname, 'public')));

app.use('/host', hostRouter);

app.use('/stream', streamRouter);

server.listen(port, function () {
    console.log('App listening on port ' + port);
});
