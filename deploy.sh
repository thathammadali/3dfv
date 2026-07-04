#!/bin/bash
# 3DFV Unified Deployment Script
# This script builds the Expo frontend and the Vite AR viewer,
# then moves them into the correct directory structure for Nginx.

echo "Starting Deployment Build..."

# 1. Build the AR Viewer
echo "Building AR Viewer..."
cd frontend/ar-main
npm install
npm run build
cd ../..

# 2. Build the Expo Frontend
echo "Building Expo Web Frontend..."
cd frontend
# Ensure dependencies are installed
npm install
# Export for Web (creates /dist)
npx expo export -p web
cd ..

# 3. Combine them
echo "Combining builds for Nginx..."
# Assuming Nginx points to frontend/dist as the root
# The AR viewer will live at frontend/dist/ar
mkdir -p frontend/dist/ar
cp -r frontend/ar-main/dist/* frontend/dist/ar/
# Failsafe for older cached clients that might request /targets.mind instead of /ar/targets.mind
cp frontend/ar-main/dist/targets.mind frontend/dist/targets.mind

echo ""
echo "✅ Build Complete!"
echo "Nginx should now point to: $(pwd)/frontend/dist"
echo "AR Viewer is accessible at: /ar"
echo ""
echo "Next steps:"
echo "1. Configure Nginx using nginx.conf.example"
echo "2. Start PM2 Backend: pm2 start ecosystem.config.js"
echo "3. Generate your QR code, compile to .mind, and place it at frontend/dist/ar/targets.mind"
