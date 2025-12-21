#!/bin/bash

# ==========================================
# Cevace Deploy Script (Run from Mac)
# ==========================================

SERVER_IP="51.254.239.151"
USER="ubuntu"
DEST_DIR="/var/www/cevace"

echo "🚀 Starting Deployment to $SERVER_IP..."

# 1. Sync Files (Upload everything except heavy/git folders)
echo "📦 Uploading files..."
rsync -avz --exclude '.git' \
           --exclude 'node_modules' \
           --exclude '.next' \
           ./ $USER@$SERVER_IP:$DEST_DIR

# 2. Remote Build & Restart
echo "🔄 Building and Restarting on Server..."
ssh $USER@$SERVER_IP <<EOF
    cd $DEST_DIR
    # Install new packages if package.json changed
    npm install
    
    # Rebuild Next.js
    npm run build
    
    # Restart the App
    pm2 restart cevace
    
    echo "✅ Server Updated & Restarted!"
EOF

echo "🎉 Deployment Complete!"
