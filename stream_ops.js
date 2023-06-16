const express = require('express');
const fs = require('fs');
const { exec } = require('child_process');

const router = express.Router();


ffmpegDefaultArgs = '-c:v h264_v4l2m2m -b:v 5M -pix_fmt yuv420p'
ffmpegRtmpRoot = 'rtmp://localhost:1935/live/'
activeStreams = []


// Device model:
// {
//     path = '/dev/video0'
//     streamName = 'device1'
//     ffmpegArgs = '-c:v h264_v4l2m2m -b:v 5M -pix_fmt yuv420p'
//     maxRes = '1280x768'
//     // streamCmd = 'ffmpeg -re -i /dev/video0 -c:v h264_v4l2m2m -b:v 5M -pix_fmt yuv420p -f flv rtmp://192.168.1.135:1935/live/{streamName}'
// }

function generateStreamCmd(deviceInfo) {
    return 'ffmpeg -re -i ' + deviceInfo.path + ' ' + deviceInfo.ffmpegArgs + ' -f flv ' + ffmpegRtmpRoot + '/' + deviceInfo.streamName
}

function generateDeviceInfo(devicePath) {
    model = {
        path: devicePath,
        streamName: devicePath.replace('/dev/', ''),
        ffmpegArgs: ffmpegDefaultArgs,
        maxRes: 'todo'
    };

    model.ffmpegCmd = generateStreamCmd(model);
    return model;
}


// Returns all camera devices connected to the machine
router.get('/devices', async (req, res) => {
    fs.readdir('/dev/', (err, files) => {
        if (err) {
            res.status(500).send(err);
            return;
        }

        rawPaths = files.filter(file => file.startsWith('video'));
        videoDevices = []
        rawPaths.forEach(element => {
            videoDevices.push(generateDeviceInfo(element));
        });

        res.json(videoDevices);
    });
});


module.exports = router;