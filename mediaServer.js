const NodeMediaServer = require('node-media-server');

let nms;
let isServerRunning = false;

const startServer = (config) => {
  nms = new NodeMediaServer(config);
  nms.run();
  isServerRunning = true;

  nms.on('preConnect', (id, args) => {
    console.log('[Media client pre-connect]', `id=${id} args=${JSON.stringify(args)}`);
  });

  nms.on('doneConnect', (id, args) => {
    console.log('[Media client done-connecting]', `id=${id} args=${JSON.stringify(args)}`);
  });

  nms.on('donePlay', (id, StreamPath, args) => {
    console.log('[Media client done playing]', `id=${id} StreamPath=${StreamPath} args=${JSON.stringify(args)}`);
  });

  nms.on('done', () => {
    isServerRunning = false;
  });
}

const getServerStatus = () => {
  return { 
    isServerRunning: isServerRunning,
    serverDetails: nms ? nms.config : null,
  };
}

module.exports = { startServer, getServerStatus };