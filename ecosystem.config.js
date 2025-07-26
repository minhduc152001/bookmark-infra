module.exports = {
  apps: [{
    name: 'bookmark-app',
    script: './dist/main.js',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    error_file: '/var/log/bookmark-app/error.log',
    out_file: '/var/log/bookmark-app/out.log',
    log_file: '/var/log/bookmark-app/combined.log',
    time: true
  }]
};