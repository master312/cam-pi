const express = require('express');
const fs = require('fs');
const { exec } = require('child_process');

const router = express.Router();

// Devices to be ignored when retreiving list of available devices using v4l2-ctl
const ignoredDevices = ['bcm2835-codec-decode', 'bcm2835-isp', 'rpivid'];

const ffmpegDefaultArgs = '-c:v h264_v4l2m2m -b:v 4M -pix_fmt yuv420p'

// REMAINDER: Always keep '/' on the end of this path!
const ffmpegRtmpRoot = 'rtmp://localhost:1935/live/'

activeStreams = []


// Device model example:
// {
//     name = 'Nikon USB CAM'
//     path = '/dev/video0'
//     streamName = 'device1'
//     ffmpegArgs = '-c:v h264_v4l2m2m -b:v 5M -pix_fmt yuv420p'
//     maxRes = '1280x768'
//     // streamCmd = 'ffmpeg -re -i /dev/video0 -c:v h264_v4l2m2m -b:v 5M -pix_fmt yuv420p -f flv rtmp://192.168.1.135:1935/live/{streamName}'
// }

function generateStreamCmd(deviceInfo) {
    return 'ffmpeg -re -i ' + deviceInfo.path + ' ' + deviceInfo.ffmpegArgs + ' -f flv ' + ffmpegRtmpRoot + deviceInfo.streamName
}

function generateDeviceInfo(devicePath) {
    model = {
        name: 'todo',
        path: devicePath,
        streamName: devicePath.replace('/dev/', ''),
        ffmpegArgs: ffmpegDefaultArgs,
        maxRes: 'todo'
    };

    model.ffmpegCmd = generateStreamCmd(model);
    return model;
}

function extractVideoDevices(deviceString) {
    // Matches /dev/video followed by one or more digits
    const regex = /\/dev\/video\d+/g;
    const matches = deviceString.match(regex);
    return matches;
}

// Returns all camera devices connected to the machine
router.get('/devices', async (req, res) => {
    exec('v4l2-ctl --list-devices', (error, stdout, stderr) => {
        if (error) {
            console.error(`exec error: ${error}`);
            return res.status(500).json({ error: 'An error occurred while getting the video capture devices.' });
        }
    
        // split devices by double newline
        const devices = stdout.split('\n\n');
    
        const videoCaptureDevices = devices.filter(device => {
            // check if this device is not one of the ignored devices
            return !ignoredDevices.some(ignoredDevice => device.includes(ignoredDevice));
        });
    
        extractedPaths = []
        videoCaptureDevices.forEach(item => {
            value = extractVideoDevices(item)
            if (value != null) {
                value.forEach(element => {
                    extractedPaths.push(element);
                });
            }
        });
        
        videoDevices = []
        extractedPaths.forEach(element => {

            videoDevices.push(generateDeviceInfo(element));
        });

        console.log(videoDevices);
        return res.json(videoDevices);
    });
});


module.exports = router;