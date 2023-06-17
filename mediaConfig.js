module.exports = {
    rtmp: {
      port: 1935,
      chunk_size: 1000,
      gop_cache: false,
      ping: 30,
      ping_timeout: 60
    },
    http: {
      port: 8000,
      allow_origin: '*'
    }
};