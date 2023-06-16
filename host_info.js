const express = require('express');
const os = require('os');
const si = require('systeminformation');
const { exec } = require('child_process');

const router = express.Router();

router.get('/info', async (req, res) => {
    try {
        const networkInterfaces = os.networkInterfaces();
        const memory = await si.mem();
        const cpuUsage = await si.currentLoad();
        const diskUsage = await si.fsSize();

        const rootDisk = diskUsage.find(disk => disk.mount === '/');
        const ipAddresses = Object.keys(networkInterfaces).reduce((result, interfaceName) => {
            networkInterfaces[interfaceName].forEach(interface => {
                if ('IPv4' === interface.family && !interface.internal) {
                    result.push(interface.address);
                }
            });
            return result;
        }, []);

        const hostInfo = {
            hostname: os.hostname(),
            ipAddresses: ipAddresses,
            memory: {
                free: parseFloat((memory.free / (1024 * 1024)).toFixed(2)),
                used: parseFloat((memory.used / (1024 * 1024)).toFixed(2)),
                total: parseFloat((memory.total / (1024 * 1024)).toFixed(2)),
            },
            cpuUsage: parseFloat(cpuUsage.currentLoad.toFixed(2)),
            disk: rootDisk ? {
                total: parseFloat((rootDisk.size / (1024 * 1024 * 1024)).toFixed(2)),
                free: parseFloat(((rootDisk.size - rootDisk.used) / (1024 * 1024 * 1024)).toFixed(2))
            } : 'Unknown',
        };

        res.json(hostInfo);

    } catch (error) {
        console.error(error);
        res.status(500).send('Error getting host info');
    }
});

module.exports = router;