# Campus DID - Deployment Guide

Complete guide for deploying Campus DID to production environments.

---

## Table of Contents
1. [Prerequisites](#prerequisites)
2. [Environment Setup](#environment-setup)
3. [Smart Contract Deployment](#smart-contract-deployment)
4. [Backend Deployment](#backend-deployment)
5. [Frontend Deployment](#frontend-deployment)
6. [Security Hardening](#security-hardening)
7. [Monitoring & Maintenance](#monitoring--maintenance)
8. [Troubleshooting](#troubleshooting)

---

## Prerequisites

### Required
- **Node.js**: v18+ LTS
- **npm**: v9+
- **Python**: 3.10+ (for smart contracts)
- **Algorand Account**: MainNet account with sufficient ALGO balance
- **IPFS Storage**: Pinata account or IPFS node
- **Domain**: For production deployment
- **SSL Certificate**: For HTTPS (Let's Encrypt recommended)

### Recommended
- **Process Manager**: PM2 for backend
- **Reverse Proxy**: Nginx or Caddy
- **CDN**: Cloudflare or similar
- **Monitoring**: Sentry, Datadog, or similar
- **CI/CD**: GitHub Actions, GitLab CI, or similar

---

## Environment Setup

### 1. Production Server

**Minimum Specifications**:
- **CPU**: 2+ cores
- **RAM**: 4GB+
- **Storage**: 20GB+ SSD
- **OS**: Ubuntu 22.04 LTS (recommended)

**Setup Steps**:

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js 18
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Install PM2 globally
sudo npm install -g pm2

# Install build tools
sudo apt install -y build-essential python3 python3-pip

# Install Nginx
sudo apt install -y nginx

# Install certbot for SSL
sudo apt install -y certbot python3-certbot-nginx
```

### 2. Clone Repository

```bash
# Create app directory
sudo mkdir -p /var/www/campus-did
sudo chown $USER:$USER /var/www/campus-did

# Clone repository
cd /var/www/campus-did
git clone https://github.com/your-org/campus-did.git .
```

---

## Smart Contract Deployment

### 1. Setup Algorand Account

```bash
# Install Algorand SDK
pip3 install py-algorand-sdk

# Export your MainNet mnemonic (DO NOT commit to version control)
export ALGORAND_MNEMONIC="your 25-word mnemonic phrase here"
export ALGORAND_NETWORK="mainnet"
```

### 2. Update Contract Configuration

Edit `contracts/deploy.py`:

```python
# Change network to MainNet
NETWORK = "mainnet"
ALGOD_ADDRESS = "https://mainnet-api.algonode.cloud"
ALGOD_TOKEN = ""  # Leave empty for public node
```

### 3. Deploy Contract

```bash
cd /var/www/campus-did/contracts

# Deploy to MainNet
python3 deploy.py

# Save the App ID output
# Example: App ID: 123456789
```

**IMPORTANT**: Save the App ID! You'll need it for backend configuration.

### 4. Fund Contract Account

```bash
# The contract needs ALGO for operations
# Send at least 1 ALGO to the contract address
```

---

## Backend Deployment

### 1. Configure Environment Variables

Create production `.env` file:

```bash
cd /var/www/campus-did/backend
nano .env
```

Add the following (replace with your values):

```env
# Server Configuration
NODE_ENV=production
PORT=3001
BACKEND_URL=https://api.campus-did.com

# Algorand Configuration
ALGORAND_NETWORK=mainnet
ALGORAND_ALGOD_SERVER=https://mainnet-api.algonode.cloud
ALGORAND_ALGOD_PORT=443
ALGORAND_ALGOD_TOKEN=
ALGORAND_INDEXER_SERVER=https://mainnet-idx.algonode.cloud
ALGORAND_INDEXER_PORT=443
ALGORAND_INDEXER_TOKEN=

# Smart Contract
ALGORAND_APP_ID=123456789
ALGORAND_MNEMONIC=your 25-word mnemonic phrase here

# IPFS Configuration (Pinata)
PINATA_API_KEY=your_pinata_api_key
PINATA_SECRET_KEY=your_pinata_secret_key
PINATA_GATEWAY=https://gateway.pinata.cloud

# Security
JWT_SECRET=your-very-long-random-jwt-secret-here
API_KEY=your-api-key-for-admin-endpoints

# CORS
CORS_ORIGIN=https://campus-did.com,https://www.campus-did.com

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

### 2. Install Dependencies

```bash
npm ci --production
```

### 3. Build (if using TypeScript)

```bash
npm run build
```

### 4. Setup PM2

Create PM2 ecosystem file:

```bash
nano ecosystem.config.js
```

```javascript
module.exports = {
  apps: [{
    name: 'campus-did-backend',
    script: './server.js',
    instances: 2,
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 3001
    },
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    merge_logs: true,
    autorestart: true,
    max_restarts: 10,
    min_uptime: '10s',
    max_memory_restart: '500M'
  }]
}
```

### 5. Start Backend

```bash
# Create logs directory
mkdir -p logs

# Start with PM2
pm2 start ecosystem.config.js

# Save PM2 configuration
pm2 save

# Setup PM2 to start on boot
pm2 startup
# Follow the command output

# Check status
pm2 status
pm2 logs campus-did-backend
```

---

## Frontend Deployment

### 1. Configure Environment Variables

Create production `.env.production`:

```bash
cd /var/www/campus-did/frontend
nano .env.production
```

```env
VITE_BACKEND_URL=https://api.campus-did.com
VITE_ALGORAND_NETWORK=mainnet
VITE_APP_ID=123456789
VITE_ALGOD_SERVER=https://mainnet-api.algonode.cloud
VITE_ALGOD_PORT=443
```

### 2. Install Dependencies

```bash
npm ci
```

### 3. Build Production Bundle

```bash
npm run build

# Output will be in dist/ directory
```

### 4. Configure Nginx

Create Nginx configuration:

```bash
sudo nano /etc/nginx/sites-available/campus-did
```

```nginx
# Backend API
server {
    listen 80;
    server_name api.campus-did.com;

    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}

# Frontend
server {
    listen 80;
    server_name campus-did.com www.campus-did.com;

    root /var/www/campus-did/frontend/dist;
    index index.html;

    # Gzip compression
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;

    location / {
        try_files $uri $uri/ /index.html;
        add_header Cache-Control "no-cache";
    }

    # Cache static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

### 5. Enable Site & SSL

```bash
# Enable site
sudo ln -s /etc/nginx/sites-available/campus-did /etc/nginx/sites-enabled/

# Test Nginx configuration
sudo nginx -t

# Reload Nginx
sudo systemctl reload nginx

# Setup SSL with Let's Encrypt
sudo certbot --nginx -d campus-did.com -d www.campus-did.com -d api.campus-did.com

# Test auto-renewal
sudo certbot renew --dry-run
```

---

## Security Hardening

### 1. Firewall Configuration

```bash
# Enable UFW
sudo ufw enable

# Allow SSH
sudo ufw allow 22/tcp

# Allow HTTP and HTTPS
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# Check status
sudo ufw status
```

### 2. Backend Security

Update `backend/server.js`:

```javascript
import helmet from 'helmet'
import rateLimit from 'express-rate-limit'

// Security headers
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
}))

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
  message: 'Too many requests from this IP',
})
app.use('/api/', limiter)

// CORS (strict)
app.use(cors({
  origin: process.env.CORS_ORIGIN.split(','),
  credentials: true,
}))
```

### 3. Environment Variable Protection

```bash
# Secure .env file
chmod 600 /var/www/campus-did/backend/.env

# Never commit .env to version control
echo ".env" >> .gitignore
```

### 4. Service Account

```bash
# Create dedicated user
sudo useradd -r -s /bin/false campus-did

# Change ownership
sudo chown -R campus-did:campus-did /var/www/campus-did

# Update PM2 to run as campus-did user
sudo pm2 startup -u campus-did --hp /home/campus-did
```

---

## Monitoring & Maintenance

### 1. Setup Logging

```bash
# Install logrotate configuration
sudo nano /etc/logrotate.d/campus-did
```

```
/var/www/campus-did/backend/logs/*.log {
    daily
    rotate 14
    compress
    delaycompress
    notifempty
    create 0640 campus-did campus-did
    sharedscripts
    postrotate
        pm2 reloadLogs
    endscript
}
```

### 2. Monitoring with PM2

```bash
# Monitor in real-time
pm2 monit

# View logs
pm2 logs campus-did-backend --lines 100

# Check metrics
pm2 show campus-did-backend
```

### 3. Setup Alerts (Optional)

Install PM2 Plus for advanced monitoring:

```bash
pm2 install pm2-logrotate
pm2 set pm2-logrotate:max_size 10M
pm2 set pm2-logrotate:retain 30
```

### 4. Backup Strategy

```bash
# Create backup script
nano /var/www/campus-did/backup.sh
```

```bash
#!/bin/bash
BACKUP_DIR="/var/backups/campus-did"
DATE=$(date +%Y%m%d_%H%M%S)

mkdir -p $BACKUP_DIR

# Backup environment files
cp /var/www/campus-did/backend/.env $BACKUP_DIR/backend.env.$DATE

# Backup logs
tar -czf $BACKUP_DIR/logs.$DATE.tar.gz /var/www/campus-did/backend/logs

# Keep only last 7 days
find $BACKUP_DIR -name "*.tar.gz" -mtime +7 -delete
find $BACKUP_DIR -name "*.env.*" -mtime +7 -delete

echo "Backup completed: $DATE"
```

```bash
# Make executable
chmod +x /var/www/campus-did/backup.sh

# Add to crontab
crontab -e
# Add: 0 2 * * * /var/www/campus-did/backup.sh
```

---

## Troubleshooting

### Backend Not Starting

```bash
# Check PM2 logs
pm2 logs campus-did-backend --err

# Check Node.js version
node --version

# Verify environment variables
pm2 env 0

# Restart service
pm2 restart campus-did-backend
```

### Frontend 404 Errors

```bash
# Check Nginx configuration
sudo nginx -t

# View Nginx error logs
sudo tail -f /var/log/nginx/error.log

# Verify file permissions
ls -la /var/www/campus-did/frontend/dist

# Reload Nginx
sudo systemctl reload nginx
```

### Algorand Connection Issues

```bash
# Test MainNet connectivity
curl https://mainnet-api.algonode.cloud/v2/status

# Check smart contract
algoexplorer.io/application/YOUR_APP_ID

# Verify account balance
curl https://mainnet-api.algonode.cloud/v2/accounts/YOUR_ADDRESS
```

### SSL Certificate Issues

```bash
# Renew certificates manually
sudo certbot renew

# Check certificate expiration
sudo certbot certificates

# Test HTTPS
curl -I https://campus-did.com
```

---

## Production Checklist

Before going live:

- [ ] Smart contract deployed to MainNet
- [ ] App ID updated in all configs
- [ ] Environment variables configured
- [ ] Backend running with PM2
- [ ] Frontend built and served via Nginx
- [ ] SSL certificates installed
- [ ] Firewall configured
- [ ] CORS restricted to production domains
- [ ] Rate limiting enabled
- [ ] Logging configured
- [ ] Backups scheduled
- [ ] Monitoring setup
- [ ] DNS records configured
- [ ] Load testing completed
- [ ] Security audit performed

---

## Scaling Considerations

### Horizontal Scaling

1. **Load Balancer**: Add Nginx load balancer for multiple backend instances
2. **Database**: Implement PostgreSQL or MongoDB for persistent storage
3. **Caching**: Add Redis for session management and caching
4. **CDN**: Use Cloudflare or AWS CloudFront for static assets

### Vertical Scaling

1. **Increase PM2 instances**: Based on CPU cores
2. **Optimize database queries**: Add indexes
3. **Implement caching**: Cache frequently accessed data
4. **Use connection pooling**: For Algorand API calls

---

## Updates & Maintenance

### Updating the Application

```bash
# Pull latest changes
cd /var/www/campus-did
git pull origin main

# Backend update
cd backend
npm ci --production
pm2 restart campus-did-backend

# Frontend update
cd ../frontend
npm ci
npm run build
sudo systemctl reload nginx
```

### Zero-Downtime Deployment

```bash
# Use PM2 reload for zero-downtime
pm2 reload ecosystem.config.js
```

---

## Support & Resources

- **Algorand Documentation**: https://developer.algorand.org
- **PM2 Documentation**: https://pm2.keymetrics.io
- **Nginx Documentation**: https://nginx.org/en/docs
- **Let's Encrypt**: https://letsencrypt.org

---

**Last Updated**: March 2, 2026  
**Deployment Guide Version**: 1.0
