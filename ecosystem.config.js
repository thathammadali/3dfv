module.exports = {
  apps: [
    {
      name: "3dfv-backend",
      script: "venv/bin/uvicorn",
      args: "app.main:app --host 127.0.0.1 --port 8000",
      cwd: "./backend",
      interpreter: "none",
      instances: 1, 
      autorestart: true,
      watch: false,
      env: {
        NODE_ENV: "production",
        ENVIRONMENT: "production",
      }
    }
  ]
};
