const express = require('express');
const fs = require('fs');
const { exec } = require('child_process');

const router = express.Router();

// Devices to be ignored when retreiving list of available devices using v4l2-ctl
const ignoredDevices = ['bcm2835-codec-decode', 'bcm2835-isp', 'rpivid'];

const ffmpegDefaultArgs = '-c:v h264_v4l2m2m -b:v 4M -pix_fmt yuv420p'

// REMAINDER: Always keep '/' on the end of this path!
const ffmpegRtmpRoot = 'rtmp://localhost:1935/live/'

// Keeps track of all devices
// replace with sqlite
streamDevices = []


// Device model example:
// {
//     name = 'Nikon USB CAM'
//     path = '/dev/video0'
//     streamName = 'device1'
//     ffmpegArgs = '-c:v h264_v4l2m2m -b:v 5M -pix_fmt yuv420p'
//     maxRes = '1280x768'
//     streaming = true || false
//     childProcess = exec(ffmpeg command here) || null
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

function pullDevices() {
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
        
        streamDevices = []
        extractedPaths.forEach(element => {

            streamDevices.push(generateDeviceInfo(element));
        });

        console.log('Pulled devices: \n');
        console.log(streamDevices);
    });
}

// Returns all camera devices connected to the machine
router.get('/devices', async (req, res) => {
    return res.json(streamDevices);
});

router.get('/toggle/:streamName', async (req, res) => {
    const deviceStreamName = req.params.streamName;

    let result = streamDevices.find(item => item.streamName === deviceStreamName);

    if (result == null) {
        res.json({ status: "Device not found" });
        return;
    }

    if (result.streaming) {
        // The stream is currently active, so we'll stop it.
        result.childProcess.kill(1);
        result.childProcess = null;
        result.streaming = false;
        res.json({ status: "Stream stopped" });
        return
    }

    // The stream is currently not active, so we'll start it.
    console.log("STARTING STREAM -- CMD: " + result.ffmpegCmd);

    const child = exec(result.ffmpegCmd);
    result.childProcess = child;
    result.streaming = true;
    let errorOccurred = false;

    child.on('error', (error) => {
        console.error(`Failed to start stream for device ${deviceStreamName}: `, error);
        errorOccurred = true;
        result.streaming = false; // reset streaming status
    });

    setTimeout(() => {
        if (!errorOccurred) {
            res.json({ status: "Stream started" });
        } else {
            res.json({ status: "Failed to start stream" });
        }
    }, 6000); // wait for 6 seconds
});

router.get('/status/:streamName', async (req, res) => {
    const deviceStreamName = req.params.streamName;

    let device = streamDevices.find(item => item.streamName === deviceStreamName);

    if (device == null) {
        res.json({ status: "Device not found" });
        return;
    }

    // Return the current streaming status of the device
    res.json({ status: device.streaming ? "Streaming" : "Not streaming" });
});

pullDevices();
module.exports = router;