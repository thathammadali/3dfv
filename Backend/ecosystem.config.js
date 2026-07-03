module.exports = {
  apps: [
    {
      name: '3dfv-backend',
      // Assuming a Linux production environment where the venv is named 'venv'.
      // If you are deploying on Windows, change 'venv/bin/uvicorn' to 'venv/Scripts/uvicorn.exe'
      script: 'venv/bin/uvicorn',
      args: 'app.main:app --host 127.0.0.1 --port 8000 --workers 4',
      
      // If you want PM2 to track python specifically (optional but recommended for python apps)
      interpreter: 'venv/bin/python',
      
      instances: 1, // Uvicorn is managing the 4 workers internally via the --workers flag
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      
      env: {
        NODE_ENV: 'production',
        // Add your production environment variables here or load them from a .env file
        // DOMAIN: 'api.3dfv.atarionsolutions.com'
      }
    }
  ]
};
