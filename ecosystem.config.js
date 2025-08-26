// PM2 ecosystem configuration for production deployment
module.exports = {
  apps: [{
    name: 'waapify-ghl',
    script: 'dist/index.js',
    cwd: '/home/runcloud/webapps/waapify-ghl',
    instances: 1,
    exec_mode: 'fork',
    env: {
      NODE_ENV: 'production',
      PORT: 3001,
      DB_HOST: 'localhost',
      DB_USER: 'waapify_user',
      DB_PASSWORD: 'QyXnDWo*OPoqCV#sW+++k~eXU?RCub++',
      DB_NAME: 'waapify_ghl',
      GHL_CLIENT_ID: '68a2e8f358c5af6573ce7c52-meh8wdt6',
      GHL_CLIENT_SECRET: '2bada39f-520e-4ba0-afe9-b1817dacc6df',
      GHL_REDIRECT_URI: 'https://waaghl.waapify.com/authorize-handler',
      SESSION_SECRET: 'WaapifyProd2024SessionSecret#NewDeployment!@#',
      JWT_SECRET: 'WaapifyProd2024JWTSecret#FreshDeploy@$%'
    },
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_file: './logs/combined.log',
    time: true,
    max_memory_restart: '500M',
    restart_delay: 5000,
    max_restarts: 3,
    min_uptime: '10s'
  }]
};