module.exports = {
  apps: [
    {
      name: 'civic-backend',
      script: 'server.js',
      interpreter: 'node',
      env: {
        NODE_ENV: 'production',
        PORT: 8083
      }
    },
    {
      name: 'civic-frontend',
      script: 'node_modules/.bin/vite',
      args: 'preview --port 8081 --host',
      cwd: '/home/ubuntu/Civic-Engagement-SE3040-Project/frontend',
      env: {
        NODE_ENV: 'production'
      }
    }
  ]
}
