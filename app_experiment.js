// const NodeMediaServer = require('node-media-server');

// const config = {
//   rtmp: {
//     port: 1935,
//     chunk_size: 1000,
//     gop_cache: false,
//     ping: 30,
//     ping_timeout: 60
//   },
//   http: {
//     port: 8000,
//     allow_origin: '*'
//   }
// };

// var nms = new NodeMediaServer(config)
// nms.run();



const express = require('express');
const fs = require('fs');
const path = require('path');
const http = require('http');
// const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);

// // const io = socketIo(server);
//     fs.readdir('/dev/', (err, files) => {
//         if (err) {
//             res.status(500).send(err);
//             return;
//         }
//         const videoDevices = files.filter(file => file.startsWith('video'));
//         videoDevices.push("device1");
//         videoDevices.push("device2");
//         videoDevices.push("device3");
//         console.log(videoDevices);
//         res.json(videoDevices);
//     });
// });

// io.on('connection', (socket) => {
//     socket.on('getScreenshot', (device) => {
//         // webcam.capture('screenshot', function(err, data) {
//         //     if (err) {
//         //         console.log(err);
//         //         return;
//         //     }
//         //     io.emit('screenshot', data);
//         // });
//     });
// });

app.use(express.static(path.join(__dirname, 'public')));

app.get('/devices', (req, res) => {
    console.log("getting devices");
    fs.readdir('/dev/', (err, files) => {
        if (err) {
            res.status(500).send(err);
            return;
        }
        const videoDevices = files.filter(file => file.startsWith('video'));
        videoDevices.push("device1");
        videoDevices.push("device2");
        videoDevices.push("device3");
        console.log(videoDevices);
        res.json(videoDevices);
    });
});

// io.on('connection', (socket) => {
//     socket.on('getScreenshot', (device) => {
//         // webcam.capture('screenshot', function(err, data) {
//         //     if (err) {
//         //         console.log(err);
//         //         return;
//         //     }
//         //     io.emit('screenshot', data);
//         // });
//     });
// });

server.listen(1000, function () {
    console.log('App listening on port 1000!');
});