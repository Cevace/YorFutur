#!/bin/bash

# ==========================================
# Cevace.com Production Setup Script (Fixed)
# OS: Ubuntu 24.04 LTS
# ==========================================

# 1. Determine Correct User (even when running with sudo)
USER_NAME=${SUDO_USER:-$USER}
APP_DIR="/var/www/cevace"
DOMAIN="cevace.com"
EMAIL="info@cevace.nl"

# Exit on error (mostly)
set -e

echo "🚀 Starting Setup (Retry Safe)..."
echo "👤 Configuring for user: $USER_NAME"

# 2. Update & Install Essentials
echo "📦 Installing packages..."
sudo apt update
sudo apt install -y curl git ufw nginx python3-certbot-nginx

# 3. Node.js 20
echo "🟢 Checking Node.js..."
if ! command -v node &> /dev/null; then
    curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
    sudo apt install -y nodejs
else
    echo "   Node.js is ready."
fi

# 4. PM2 (Process Manager)
echo "⚙️ Checking PM2..."
if ! command -v pm2 &> /dev/null; then
    sudo npm install -g pm2
else
    echo "   PM2 is ready."
fi

# PM2 Startup (Safe Mode)
echo "   Configuring PM2 startup..."
# Disable exit-on-error for this tricky step
set +e
pm2 unstartup systemd &> /dev/null
# Generate command and run it automatically if possible
PM2_CMD=$(pm2 startup systemd -u $USER_NAME --hp /home/$USER_NAME | grep "sudo env")
if [ ! -z "$PM2_CMD" ]; then
    echo "   Executing: $PM2_CMD"
    eval "$PM2_CMD"
else
    echo "⚠️  could not auto-configure PM2 startup. You can do this later."
fi
set -e

# 5. Firewall
echo "🛡️ Configuring Firewall..."
sudo ufw allow OpenSSH
sudo ufw allow 'Nginx Full'
echo "y" | sudo ufw enable

# 6. App Directory
echo "📂 Setting up logic folders..."
if [ ! -d "$APP_DIR" ]; then
    sudo mkdir -p $APP_DIR
fi
# Always fix permissions (in case they were wrong)
sudo chown -R $USER_NAME:$USER_NAME $APP_DIR
echo "   Permissions set for $USER_NAME at $APP_DIR"

# 7. Nginx Configuration
echo "🌐 Configuring Nginx..."
sudo rm -f /etc/nginx/sites-enabled/default

# Create Server Block
sudo tee /etc/nginx/sites-available/$DOMAIN > /dev/null <<EOF
server {
    listen 80;
    server_name $DOMAIN www.$DOMAIN;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_cache_bypass \$http_upgrade;
    }
}
EOF

# Enable Site
sudo ln -sf /etc/nginx/sites-available/$DOMAIN /etc/nginx/sites-enabled/

# 8. SSL (Check if already exists to avoid certbot limits)
echo "🔒 Checking SSL..."
if [ ! -d "/etc/letsencrypt/live/$DOMAIN" ]; then
    sudo certbot --nginx -d $DOMAIN -d www.$DOMAIN --non-interactive --agree-tos -m $EMAIL --redirect || echo "⚠️ certbot failed, check DNS settings."
else
    echo "   SSL Certificate already exists."
fi

# Restart Nginx
sudo nginx -t && sudo systemctl restart nginx

echo "==================================================="
echo "✅ SETUP COMPLETED SUCCESSFULLY!"
echo "==================================================="
echo "Next Steps:"
echo "1. Upload your code to: $APP_DIR"
echo "2. Run 'npm install && npm run build' inside that folder"
echo "3. Start with: pm2 start npm --name \"cevace\" -- start"
