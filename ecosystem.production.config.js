// ========================================
// PM2 PRODUCTION ECOSYSTEM CONFIGURATION
// Fresh deployment with new database and port
// ========================================
module.exports = {
  apps: [{
    name: 'waapify-ghl-prod',
    script: 'dist/index.js',
    cwd: '/home/runcloud/webapps/waapify-ghl',
    instances: 1,
    exec_mode: 'fork',
    env: {
      NODE_ENV: 'production',
      PORT: 3001,
      DB_HOST: 'localhost',
      DB_USER: 'waapify_prod', 
      DB_PASSWORD: 'WaaProd2024#SecurePass!',
      DB_NAME: 'waapify_production',
      GHL_CLIENT_ID: '68a2e8f358c5af6573ce7c52-meh8wdt6',
      GHL_CLIENT_SECRET: '2bada39f-520e-4ba0-afe9-b1817dacc6df',
      GHL_REDIRECT_URI: 'https://waaghl.waapify.com/authorize-handler',
      SESSION_SECRET: 'WaapifyProd2024SessionSecret#NewDeployment!@#',
      JWT_SECRET: 'WaapifyProd2024JWTSecret#FreshDeploy@$%',
      LOG_LEVEL: 'info',
      MAX_CONNECTIONS: '100',
      REQUEST_TIMEOUT: '30000'
    },
    error_file: './logs/prod-err.log',
    out_file: './logs/prod-out.log',
    log_file: './logs/prod-combined.log',
    time: true,
    max_memory_restart: '500M',
    restart_delay: 5000,
    max_restarts: 3,
    min_uptime: '10s',
    watch: false,
    ignore_watch: ['node_modules', 'logs', '.git']
  }]
};