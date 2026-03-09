# Simplingua VPS Production Deployment Guide (Ubuntu 24.04+)

This guide covers deploying Simplingua to a VPS or ECS running Ubuntu 24.04+ (or compatible Debian) **without Docker**.

---

## 📋 Prerequisites

### VPS Requirements
- **OS**: Ubuntu 24.04 LTS (or Debian 12+)
- **RAM**: Minimum 2GB, Recommended 4GB+
- **Disk**: Minimum 20GB, Recommended 50GB+ (for database growth)
- **CPU**: 2+ cores recommended
- **Architecture**: amd64 (standard for most VPS)

### Required Software (No Docker Required)

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Python and development tools
sudo apt install python3 python3-pip python3-venv build-essential -y

# Install Node.js and npm
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Install PostgreSQL with pgvector extension
sudo apt install postgresql-16 postgresql-16-pgvector postgresql-client-16 -y

# Install Nginx
sudo apt install nginx -y

# Install Certbot (Let's Encrypt)
sudo apt install certbot python3-certbot-nginx -y

# Install Supervisor (for process management)
sudo apt install supervisor -y

# Verify installations
python3 --version
node --version
npm --version
psql --version
nginx -v
certbot --version
```

### Required Accounts/Services
- **DeepSeek API key** (default AI provider)
- Optional: OpenAI API key
- Optional: Anthropic API key
- Optional: Ollama/LM Studio (for local AI)

---

## 🚀 Deployment Steps

### Step 1: Clone and Navigate

```bash
# Clone repository
git clone <your-repo-url>
cd simplingua

# Check system (Ubuntu 24.04)
lsb_release -a
# Should show: Ubuntu 24.04 LTS
```

### Step 2: Configure PostgreSQL Database

```bash
# Switch to postgres user
sudo -u postgres psql

# Create database and user
CREATE DATABASE simplingua_prod;
CREATE USER simplingua WITH PASSWORD 'your-strong-password';
GRANT ALL PRIVILEGES ON DATABASE simplingua_prod TO simplingua;
ALTER USER simplingua WITH SUPERUSER;

# Enable pgvector extension
\c simplingua_prod
CREATE EXTENSION IF NOT EXISTS vector;
\q

# Test connection
sudo -u postgres psql -h localhost -U simplingua -d simplingua_prod
```

### Step 3: Configure Environment Variables

```bash
# Copy production environment template
cp .env.production.example .env

# Edit with your values
nano .env
```

**Critical Variables to Set:**

1. **DB_PASSWORD** - Use the password you created in Step 2
   ```bash
   DB_PASSWORD=your-strong-password-from-step-2
   ```

2. **DATABASE_URL** - Update for local PostgreSQL:
   ```bash
   DATABASE_URL=postgresql://simplingua:${DB_PASSWORD}@localhost:5432/simplingua_prod
   ```

3. **JWT_SECRET** - Generate strong secret:
   ```bash
   openssl rand -base64 64
   ```

4. **AI_DEEPSEEK_API_KEY** - Add your DeepSeek API key

5. **CHAT_AI_DEFAULT_PROVIDER** - Default chat AI provider (deepseek|openai|anthropic|local)
6. **EMBEDDING_AI_DEFAULT_PROVIDER** - Default embedding AI provider (deepseek|openai|sentencetransformer|local)

7. **DOMAIN** - Your actual domain name (e.g., `simplingua.mahanzhou.com`)

8. **SSL_EMAIL** - Your email for Let's Encrypt

9. **NEXT_PUBLIC_API_URL** - Must match your domain:
   ```bash
   NEXT_PUBLIC_API_URL=https://simplingua.mahanzhou.com
   ```

10. **CORS_ORIGINS** - Your domain:
    ```bash
    CORS_ORIGINS=https://simplingua.mahanzhou.com
    ```

**Note:** The `.env` file at project root is loaded by the systemd backend service via `EnvironmentFile` directive. Ensure the file permissions are secure: `chmod 600 .env`

### Step 4: Deploy Backend (FastAPI with Python venv)

```bash
# Navigate to backend directory
cd backend

# Create Python virtual environment
python3 -m venv venv

# Activate virtual environment
source venv/bin/activate

# Install dependencies
pip install --upgrade pip
pip install -r requirements.txt

# Note: Database tables are created automatically on first startup via init_db()

# Deactivate virtual environment
deactivate

# Return to project root
cd ..
```

### Step 5: Create Backend Systemd Service

```bash
# Create systemd service file
sudo nano /etc/systemd/system/simplingua-backend.service
```

Add the following content:

```ini
[Unit]
Description=Simplingua Backend API
After=network.target postgresql.service

[Service]
Type=simple
User=root
WorkingDirectory=/root/simplingua/backend
Environment="PATH=/root/simplingua/backend/venv/bin"
EnvironmentFile=/root/simplingua/.env
ExecStart=/root/simplingua/backend/venv/bin/uvicorn app:app --host 127.0.0.1 --port 8000 --workers 2
ExecReload=/bin/kill -s HUP $MAINPID
Restart=always
RestartSec=10
StandardOutput=append:/var/log/simplingua/backend.log
StandardError=append:/var/log/simplingua/backend.log

[Install]
WantedBy=multi-user.target
```

Update the paths if your project is located elsewhere (e.g., `/home/username/simplingua`).

```bash
# Create log directory
sudo mkdir -p /var/log/simplingua
sudo chown $USER:$USER /var/log/simplingua

# Reload systemd and enable service
sudo systemctl daemon-reload
sudo systemctl enable simplingua-backend
sudo systemctl start simplingua-backend

# Check service status
sudo systemctl status simplingua-backend

# View logs
sudo tail -f /var/log/simplingua/backend.log
```

### Step 6: Deploy Frontend (Next.js)

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Build production bundle
npm run build

# Start production server (for testing)
npm start

# Note: Press Ctrl+C to stop, we'll set up systemd service next
```

### Step 7: Create Frontend Systemd Service

```bash
# Create systemd service file
sudo nano /etc/systemd/system/simplingua-frontend.service
```

Add the following content:

```ini
[Unit]
Description=Simplingua Frontend
After=network.target

[Service]
Type=simple
User=root
WorkingDirectory=/root/simplingua/frontend
ExecStart=/usr/bin/npm start
Restart=always
RestartSec=10
StandardOutput=append:/var/log/simplingua/frontend.log
StandardError=append:/var/log/simplingua/frontend.log

[Install]
WantedBy=multi-user.target
```

```bash
# Create log directory (if not already created)
sudo mkdir -p /var/log/simplingua

# Reload systemd and enable service
sudo systemctl daemon-reload
sudo systemctl enable simplingua-frontend
sudo systemctl start simplingua-frontend

# Check service status
sudo systemctl status simplingua-frontend

# View logs
sudo tail -f /var/log/simplingua/frontend.log
```

### Step 8: Configure Nginx

```bash
# Copy nginx configuration (already created for VPS without Docker)
sudo cp nginx/nginx-vps.conf /etc/nginx/nginx.conf

# Update domain if needed (already set to simplingua.mahanzhou.com)
sudo nano /etc/nginx/nginx.conf

# Test nginx configuration
sudo nginx -t

# Create required directories
sudo mkdir -p /var/cache/nginx
sudo mkdir -p /var/www/certbot
sudo mkdir -p /var/www/admin-static

# Create SSL directory
sudo mkdir -p /etc/nginx/ssl

# Set permissions
sudo chmod 755 /var/cache/nginx
sudo chmod 755 /var/www/certbot
```

### Step 9: Obtain SSL Certificate (Let's Encrypt)

```bash
# Method 1: Using certbot with nginx plugin (recommended)
sudo certbot --nginx -d simplingua.mahanzhou.com

# Method 2: Standalone method (if nginx not yet running)
sudo certbot certonly --standalone \
  --agree-tos \
  --email your@email.com \
  -d simplingua.mahanzhou.com

# Copy certificates to nginx ssl directory
sudo cp /etc/letsencrypt/live/simplingua.mahanzhou.com/fullchain.pem /etc/nginx/ssl/
sudo cp /etc/letsencrypt/live/simplingua.mahanzhou.com/privkey.pem /etc/nginx/ssl/

# Set correct permissions
sudo chmod 644 /etc/nginx/ssl/fullchain.pem
sudo chmod 600 /etc/nginx/ssl/privkey.pem
```

### Step 10: Start Nginx

```bash
# Enable and start nginx
sudo systemctl enable nginx
sudo systemctl start nginx

# Check nginx status
sudo systemctl status nginx

# View nginx logs
sudo tail -f /var/log/nginx/error.log
sudo tail -f /var/log/nginx/access.log
```

### Step 11: Configure UFW Firewall

```bash
# Enable UFW
sudo ufw enable

# Allow SSH
sudo ufw allow 22/tcp

# Allow HTTP and HTTPS
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# Deny all other ports (default behavior)
sudo ufw default deny incoming
sudo ufw default allow outgoing

# Check firewall status
sudo ufw status
```

### Step 12: Verify Deployment

```bash
# Check all services
sudo systemctl status simplingua-backend
sudo systemctl status simplingua-frontend
sudo systemctl status nginx
sudo systemctl status postgresql

# Test backend health
curl -k http://localhost:8000/health

# Test frontend
curl -k http://localhost:3000

# Test nginx
curl -I https://simplingua.mahanzhou.com
curl https://simplingua.mahanzhou.com/health
curl https://simplingua.mahanzhou.com/docs
```

---

## 🐳 Ubuntu 24.04 Specific Notes

### Systemd Service Management

The setup uses `systemd` for all services (default on Ubuntu). All services run as systemd services.

**Useful Commands:**
```bash
# Check service status
sudo systemctl status simplingua-backend
sudo systemctl status simplingua-frontend
sudo systemctl status nginx
sudo systemctl status postgresql

# Start/Stop/Restart services
sudo systemctl start simplingua-backend
sudo systemctl stop simplingua-backend
sudo systemctl restart simplingua-backend

# Enable/disable auto-start on boot
sudo systemctl enable simplingua-backend
sudo systemctl disable simplingua-backend

# View service logs
sudo journalctl -u simplingua-backend -f
sudo tail -f /var/log/simplingua/backend.log

# Restart all services
sudo systemctl restart simplingua-backend simplingua-frontend nginx
```

### Python Virtual Environment (venv)

Backend runs in a Python virtual environment for isolation:

```bash
# Activate venv (for manual testing)
cd /root/simplingua/backend
source venv/bin/activate

# Run commands
uvicorn app:app --reload

# Deactivate
deactivate
```

**Why venv?**
- Isolates Python dependencies
- No system-wide package conflicts
- Easy to manage upgrades
- Reproducible environment

### Performance on VPS

VPS typically has lower I/O performance than local development. Consider:

1. **Enable BBR for PostgreSQL** (kernel tuning):
   ```bash
   echo "net.core.default_qdisc=fq" | sudo tee -a /etc/sysctl.conf
   echo "net.ipv4.tcp_congestion_control=bbr" | sudo tee -a /etc/sysctl.conf
   sudo sysctl -p
   ```

2. **Increase swap size** (if low RAM):
   ```bash
   sudo fallocate -l 2G /swapfile
   sudo chmod 600 /swapfile
   sudo mkswap /swapfile
   sudo swapon /swapfile
   echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
   ```

3. **Use fast storage**: SSD or NVMe storage recommended

4. **PostgreSQL tuning** (optional):
   Edit `/etc/postgresql/16/main/postgresql.conf`:
   ```ini
   shared_buffers = 256MB
   effective_cache_size = 1GB
   maintenance_work_mem = 64MB
   checkpoint_completion_target = 0.9
   wal_buffers = 16MB
   default_statistics_target = 100
   random_page_cost = 1.1
   effective_io_concurrency = 200
   work_mem = 2621kB
   min_wal_size = 1GB
   max_wal_size = 4GB
   max_worker_processes = 2
   max_parallel_workers_per_gather = 2
   max_parallel_workers = 2
   max_parallel_maintenance_workers = 2
   ```

   Then restart PostgreSQL:
   ```bash
   sudo systemctl restart postgresql
   ```

---

## 🔒 Docker vs Docker-Independent Deployment

### Docker-Independent (This Guide)

**Current Setup:**
- All services run as systemd services
- Backend: FastAPI in Python venv on port 8000
- Frontend: Next.js production server on port 3000
- PostgreSQL: System service on port 5432
- Nginx: Reverse proxy on ports 80/443
- No Docker required

**Advantages:**
- Direct system access for debugging
- Less overhead (no container layer)
- Familiar to traditional sysadmins
- Easier to integrate with system tools

**Disadvantages:**
- Manual dependency management
- Harder to reproduce exact environment
- Potential conflicts with system packages

### Networking

**This Setup:**
- Backend: `127.0.0.1:8000` (internal only)
- Frontend: `127.0.0.1:3000` (internal only)
- PostgreSQL: `127.0.0.1:5432` (internal only)
- Nginx: Ports 80/443 (exposed to internet)

**Implications:**
- Only port 443 (HTTPS) exposed to internet
- Ports 80 (HTTP) redirects to 443
- All other ports are localhost-only for security
- SSH (port 22) required for server management

### SSH Access

```bash
# From your local machine
ssh root@your-vps-ip

# From VPS, access backend logs
sudo tail -f /var/log/simplingua/backend.log

# From VPS, access PostgreSQL
sudo -u postgres psql -d simplingua_prod

# Restart services
sudo systemctl restart simplingua-backend
```

---

## 🔥 Health Checks

### From VPS

```bash
# Check all services
sudo systemctl status simplingua-backend simplingua-frontend nginx postgresql

# Check specific service health
curl -k http://localhost:8000/health
curl https://simplingua.mahanzhou.com/health
curl https://simplingua.mahanzhou.com/docs

# Check Nginx status
curl http://127.0.0.1:8080/nginx_status
```

### From Your Local Machine

```bash
# Test external access
curl https://simplingua.mahanzhou.com/health
curl https://simplingua.mahanzhou.com/docs
curl -I https://simplingua.mahanzhou.com
```

### Health Endpoint Responses

```json
# Backend health check
{
  "status": "healthy",
  "service": "Simplingua",
  "database": "connected"
}

# Frontend accessibility
# Expected: HTTP 200 OK with Next.js HTML
```

---

## 🔄 Maintenance Tasks

### Weekly (Recommended)

```bash
# Update system packages
sudo apt update && sudo apt upgrade -y

# Check SSL certificate expiry
sudo certbot certificates

# Check disk space
df -h

# Check memory usage
free -h

# Check service status
sudo systemctl status simplingua-backend simplingua-frontend nginx postgresql

# Rotate logs (optional, use logrotate)
sudo logrotate -f /etc/logrotate.conf
```

### Monthly (Recommended)

```bash
# Update backend dependencies
cd /root/simplingua/backend
source venv/bin/activate
pip install --upgrade pip
pip install --upgrade -r requirements.txt
deactivate

# Update frontend dependencies
cd /root/simplingua/frontend
npm update
npm audit fix

# Rebuild frontend
npm run build

# Restart services
sudo systemctl restart simplingua-frontend

# Verify after restart
curl https://simplingua.mahanzhou.com/health

# Note: Database tables are created automatically on startup via init_db()
# No manual migrations needed
sudo systemctl restart simplingua-backend
```

### Quarterly (Recommended)

```bash
# Security audit
sudo apt autoremove -y
sudo apt autoclean

# PostgreSQL maintenance
sudo -u postgres vacuumdb --analyze --all
sudo -u postgres reindexdb --all

# Review logs for errors
sudo grep ERROR /var/log/simplingua/backend.log | tail -50
sudo grep ERROR /var/log/nginx/error.log | tail -50

# Check SSL certificate renewal
sudo certbot renew --dry-run
```

---

## 💾 Backup Strategy

### Database Backup

**Automated Weekly Backup (Cron):**

```bash
# Edit root's crontab
sudo crontab -e

# Add weekly backup (Sundays at 2:00 AM)
0 2 * * 0 /usr/bin/pg_dump -U simplingua simplingua_prod > /backup/simplingua_$(date +\%Y\%m\%d).sql

# Keep last 4 backups
0 3 * * 0 /usr/bin/find /backup -name "simplingua_*.sql" -mtime +28 -delete
```

**Manual Backup:**

```bash
# Quick manual backup
sudo -u postgres pg_dump simplingua_prod > /backup/simplingua_manual_$(date +%Y-%m-%d).sql

# Backup to remote server
sudo -u postgres pg_dump simplingua_prod | ssh user@backup-server "cat > /backup/simplingua_$(date +%Y-%m-%d).sql"
```

**Restore from Backup:**

```bash
# Stop backend service
sudo systemctl stop simplingua-backend

# Restore database
sudo -u postgres psql simplingua_prod < /backup/simplingua_manual.sql

# Start backend service
sudo systemctl start simplingua-backend

# Verify
curl https://simplingua.mahanzhou.com/health
```

### File Backup

```bash
# Backup configuration files
tar -czf /backup/config_$(date +%Y-%m-%d).tar.gz \
  /root/simplingua/.env \
  /etc/nginx/nginx.conf \
  /etc/systemd/system/simplingua-*.service

# Backup source code
tar -czf /backup/source_$(date +%Y-%m-%d).tar.gz /root/simplingua
```

---

## 🔍 Troubleshooting

### Issue: Certificate not found

**Symptom:** Nginx shows SSL certificate error

**Solutions:**

1. **Check certificate files exist**
   ```bash
   ls -la /etc/letsencrypt/live/simplingua.mahanzhou.com/
   ls -la /etc/nginx/ssl/
   ```

2. **Check Nginx can read certificates**
   ```bash
   ls -la /etc/nginx/ssl/
   sudo chmod 644 /etc/nginx/ssl/fullchain.pem
   sudo chmod 600 /etc/nginx/ssl/privkey.pem
   ```

3. **Regenerate certificates**
   ```bash
   sudo certbot certonly --nginx \
     --agree-tos \
     --email your@email.com \
     -d simplingua.mahanzhou.com

   # Copy new certificates
   sudo cp /etc/letsencrypt/live/simplingua.mahanzhou.com/fullchain.pem /etc/nginx/ssl/
   sudo cp /etc/letsencrypt/live/simplingua.mahanzhou.com/privkey.pem /etc/nginx/ssl/

   # Restart Nginx
   sudo systemctl restart nginx
   ```

4. **Test certificate renewal**
   ```bash
   sudo certbot renew --dry-run
   ```

### Issue: Database connection failed

**Symptom:** Backend logs show "connection refused" or "could not connect"

**Solutions:**

1. **Check PostgreSQL is running**
   ```bash
   sudo systemctl status postgresql
   ```

2. **Check PostgreSQL is listening**
   ```bash
   sudo netstat -tlnp | grep 5432
   sudo ss -tlnp | grep 5432
   ```

3. **Test PostgreSQL connection**
   ```bash
   sudo -u postgres psql -h localhost -U simplingua -d simplingua_prod
   ```

4. **Check .env file**
   ```bash
   cat /root/simplingua/.env | grep DATABASE_URL
   # Should match: postgresql://simplingua:password@localhost:5432/simplingua_prod
   ```

5. **Check backend logs**
   ```bash
   sudo tail -50 /var/log/simplingua/backend.log
   sudo journalctl -u simplingua-backend -n 50
   ```

6. **Restart services**
   ```bash
   sudo systemctl restart postgresql
   sudo systemctl restart simplingua-backend
   ```

### Issue: High CPU or Memory Usage

**Solutions:**

1. **Check resource usage**
   ```bash
   htop
   free -h
   df -h
   ps aux --sort=-%cpu | head -20
   ps aux --sort=-%mem | head -20
   ```

2. **Check backend worker count**
   Edit `/etc/systemd/system/simplingua-backend.service`:
   ```ini
   # Reduce workers if low RAM
   ExecStart=/root/simplingua/backend/venv/bin/uvicorn app:app --host 127.0.0.1 --port 8000 --workers 1
   ```

   Then:
   ```bash
   sudo systemctl daemon-reload
   sudo systemctl restart simplingua-backend
   ```

3. **Check PostgreSQL connections**
   ```bash
   sudo -u postgres psql -d simplingua_prod -c "SELECT count(*) FROM pg_stat_activity;"
   ```

4. **Increase resources** (if VPS allows)
   - Upgrade VPS plan or add more RAM/CPU
   - Optimize database queries
   - Add caching layer (Redis) if needed

### Issue: Can't access API

**Symptoms:** Connection timeout, 404, or 502 errors

**Solutions:**

1. **Check if Nginx is running**
   ```bash
   sudo systemctl status nginx
   ```

2. **Check Nginx configuration**
   ```bash
   sudo nginx -t
   ```

3. **Check Nginx error logs**
   ```bash
   sudo tail -50 /var/log/nginx/error.log
   ```

4. **Test backend directly**
   ```bash
   curl http://localhost:8000/health
   ```

5. **Test frontend directly**
   ```bash
   curl http://localhost:3000
   ```

6. **Check DNS resolution**
   ```bash
   nslookup simplingua.mahanzhou.com
   ping simplingua.mahanzhou.com
   ```

7. **Check firewall**
   ```bash
   sudo ufw status
   ```

8. **Check all services**
   ```bash
   sudo systemctl status simplingua-backend simplingua-frontend nginx postgresql
   ```

### Issue: Backend service won't start

**Symptoms:** `systemctl start` fails, service status shows "failed"

**Solutions:**

1. **Check service status and logs**
   ```bash
   sudo systemctl status simplingua-backend
   sudo journalctl -u simplingua-backend -n 100
   sudo tail -100 /var/log/simplingua/backend.log
   ```

2. **Check Python venv**
   ```bash
   cd /root/simplingua/backend
   source venv/bin/activate
   which python3
   pip list
   deactivate
   ```

3. **Test backend manually**
   ```bash
   cd /root/simplingua/backend
   source venv/bin/activate
   uvicorn app:app --host 127.0.0.1 --port 8000
   ```

4. **Check port availability**
   ```bash
   sudo netstat -tlnp | grep 8000
   sudo lsof -i :8000
   ```

5. **Check dependencies**
   ```bash
   cd /root/simplingua/backend
   source venv/bin/activate
   pip install -r requirements.txt
   deactivate
   ```

### Issue: Frontend service won't start

**Symptoms:** Frontend not accessible, service failed

**Solutions:**

1. **Check service status and logs**
   ```bash
   sudo systemctl status simplingua-frontend
   sudo journalctl -u simplingua-frontend -n 100
   sudo tail -100 /var/log/simplingua/frontend.log
   ```

2. **Check build exists**
   ```bash
   ls -la /root/simplingua/frontend/.next
   ```

3. **Rebuild frontend**
   ```bash
   cd /root/simplingua/frontend
   npm run build
   ```

4. **Test frontend manually**
   ```bash
   cd /root/simplingua/frontend
   npm start
   ```

5. **Check port availability**
   ```bash
   sudo netstat -tlnp | grep 3000
   sudo lsof -i :3000
   ```

---

## 📊 Monitoring Setup (Optional)

### Basic Log Monitoring

```bash
# View real-time logs
sudo journalctl -u simplingua-backend -f
sudo journalctl -u simplingua-frontend -f
sudo tail -f /var/log/nginx/error.log

# Check error rate
sudo grep ERROR /var/log/simplingua/backend.log | head -20

# Set up log rotation
# Create /etc/logrotate.d/simplingua:
cat <<EOF | sudo tee /etc/logrotate.d/simplingua
/var/log/simplingua/*.log {
    daily
    rotate 14
    compress
    delaycompress
    missingok
    notifempty
    create 0640 root root
}
EOF
```

### Resource Monitoring

```bash
# Install monitoring tools
sudo apt install htop iotop nethogs -y

# Use htop for real-time monitoring
htop

# Use iotop for I/O monitoring
sudo iotop -o

# Use nethogs for network monitoring
sudo nethogs

# Set up disk space alerts
cat <<EOF | sudo tee /usr/local/bin/check-disk.sh
#!/bin/bash
THRESHOLD=90
USAGE=$(df -h / | awk 'NR==2 {print $5}' | sed 's/%//')
if [ $USAGE -gt $THRESHOLD ]; then
    echo "Disk usage is ${USAGE}% on $(hostname)" | mail -s "Disk Alert" admin@example.com
fi
EOF

sudo chmod +x /usr/local/bin/check-disk.sh
```

### Service Monitoring Script

```bash
cat <<EOF | sudo tee /usr/local/bin/check-services.sh
#!/bin/bash
SERVICES=("simplingua-backend" "simplingua-frontend" "nginx" "postgresql")
for service in "${SERVICES[@]}"; do
    if ! systemctl is-active --quiet "$service"; then
        echo "$service is not running" | mail -s "Service Alert" admin@example.com
        systemctl restart "$service"
    fi
done
EOF

sudo chmod +x /usr/local/bin/check-services.sh

# Add to crontab (check every 5 minutes)
sudo crontab -e
*/5 * * * * /usr/local/bin/check-services.sh
```

---

## 🎯 Quick Reference

### VPS-Specific Commands

```bash
# Check Ubuntu version
cat /etc/os-release
lsb_release -a

# Check system load
uptime
htop
top

# Check disk usage
df -h
du -sh /root/simplingua

# Check memory
free -h

# View all running services
sudo systemctl list-units --type=service --state=running

# View all simplingua services
sudo systemctl status simplingua-backend simplingua-frontend nginx postgresql

# Restart specific service
sudo systemctl restart simplingua-backend

# View service logs
sudo journalctl -u simplingua-backend -f
sudo tail -f /var/log/simplingua/backend.log

# Stop all services
sudo systemctl stop simplingua-backend simplingua-frontend nginx

# Start all services
sudo systemctl start postgresql simplingua-backend simplingua-frontend nginx

# Restart all services
sudo systemctl restart postgresql simplingua-backend simplingua-frontend nginx

# SSH into VPS
ssh root@your-vps-ip

# Upload files to VPS
scp /path/to/file root@your-vps-ip:/root/simplingua/

# Download files from VPS
scp root@your-vps-ip:/root/simplingua/.env ./
```

### Backend Management

```bash
# Navigate to backend
cd /root/simplingua/backend

# Activate venv
source venv/bin/activate

# Run commands
uvicorn app:app --reload  # Start development server
# Note: Database tables are created automatically on startup via init_db()

# Deactivate
deactivate

# Run database shell
sudo -u postgres psql -d simplingua_prod

# Check PostgreSQL connections
sudo -u postgres psql -d simplingua_prod -c "SELECT count(*) FROM pg_stat_activity;"
```

### Frontend Management

```bash
# Navigate to frontend
cd /root/simplingua/frontend

# Install dependencies
npm install

# Build production
npm run build

# Start production server
npm start

# Development mode
npm run dev

# Run tests
npm test
```

### Nginx Management

```bash
# Test configuration
sudo nginx -t

# Reload configuration (no downtime)
sudo nginx -s reload

# Restart Nginx
sudo systemctl restart nginx

# Check configuration
sudo nginx -T

# View logs
sudo tail -f /var/log/nginx/error.log
sudo tail -f /var/log/nginx/access.log

# View cache status
du -sh /var/cache/nginx
```

---

## ✅ Pre-Deployment Checklist

- [ ] System is Ubuntu 24.04+ (compatible)
- [ ] Python 3.10+ installed
- [ ] Node.js 20+ and npm installed
- [ ] PostgreSQL 16+ with pgvector installed
- [ ] Nginx installed and configured
- [ ] Certbot installed (for SSL)
- [ ] UFW firewall enabled and configured
- [ ] System updated
- [ ] RAM ≥ 2GB (2GB+ recommended)
- [ ] Disk ≥ 20GB (20GB+ recommended)
- [ ] CPU ≥ 2 cores
- [ ] PostgreSQL database and user created
- [ ] pgvector extension enabled
- [ ] `.env` file configured with production values
- [ ] Backend Python venv created and dependencies installed
- [ ] Database migrations run
- [ ] Frontend built (npm run build)
- [ ] Backend systemd service created and enabled
- [ ] Frontend systemd service created and enabled
- [ ] Nginx configuration copied and tested
- [ ] SSL certificates obtained
- [ ] UFW firewall configured (allow 22, 80, 443)
- [ ] DeepSeek API key configured
- [ ] Domain name configured
- [ ] DNS A records pointing to VPS IP

---

## 🚀 Deployment Checklist

- [ ] Clone repository to VPS
- [ ] Install all required software (Python, Node.js, PostgreSQL, Nginx, Certbot)
- [ ] Create PostgreSQL database and user
- [ ] Enable pgvector extension
- [ ] Configure environment variables (.env file)
- [ ] Create and configure Python venv for backend
- [ ] Install backend dependencies
- [ ] Run database migrations
- [ ] Build frontend (npm run build)
- [ ] Create backend systemd service
- [ ] Create frontend systemd service
- [ ] Configure Nginx (copy nginx-vps.conf)
- [ ] Obtain SSL certificates (Let's Encrypt)
- [ ] Start all services (backend, frontend, nginx, postgresql)
- [ ] Verify all services are running
- [ ] Configure UFW firewall
- [ ] Test application at https://yourdomain.com
- [ ] Test health endpoint
- [ ] Test API documentation
- [ ] Set up automated backups (crontab)
- [ ] Configure monitoring (optional but recommended)

---

## 📝 Post-Deployment Verification

### Essential Tests

1. **Health Check**
   ```bash
   curl https://simplingua.mahanzhou.com/health
   # Expected: {"status":"healthy","service":"Simplingua"}
   ```

2. **Frontend Access**
   - Visit https://simplingua.mahanzhou.com
   - Should load Next.js homepage

3. **API Access**
   ```bash
   curl https://simplingua.mahanzhou.com/docs
   curl https://simplingua.mahanzhou.com/api/v1/health
   ```

4. **Database Connection**
   ```bash
   sudo -u postgres psql -h localhost -U simplingua -d simplingua_prod -c "SELECT 1;"
   ```

5. **WebSocket/SSE Streaming**
   - Visit https://simplingua.mahanzhou.com/chat
   - Open browser DevTools (F12)
   - Check for "EventSource" connection in Network tab

6. **SSL Certificate**
   ```bash
   sudo certbot certificates
   # Should show valid certificates for your domain
   ```

7. **Nginx Status**
   ```bash
   curl http://127.0.0.1:8080/nginx_status
   # Should show Nginx stats
   ```

### Verification Script

```bash
cat <<'EOF' | sudo tee /usr/local/bin/verify-deployment.sh
#!/bin/bash
echo "=== Simplingua Deployment Verification ==="
echo

# Check services
echo "Checking services..."
systemctl is-active simplingua-backend && echo "✓ Backend is running" || echo "✗ Backend is not running"
systemctl is-active simplingua-frontend && echo "✓ Frontend is running" || echo "✗ Frontend is not running"
systemctl is-active nginx && echo "✓ Nginx is running" || echo "✗ Nginx is not running"
systemctl is-active postgresql && echo "✓ PostgreSQL is running" || echo "✗ PostgreSQL is not running"
echo

# Check ports
echo "Checking ports..."
ss -tlnp | grep -q ':3000' && echo "✓ Frontend port 3000 is listening" || echo "✗ Frontend port 3000 is not listening"
ss -tlnp | grep -q ':8000' && echo "✓ Backend port 8000 is listening" || echo "✗ Backend port 8000 is not listening"
ss -tlnp | grep -q ':5432' && echo "✓ PostgreSQL port 5432 is listening" || echo "✗ PostgreSQL port 5432 is not listening"
ss -tlnp | grep -q ':443' && echo "✓ HTTPS port 443 is listening" || echo "✗ HTTPS port 443 is not listening"
echo

# Check health endpoints
echo "Checking health endpoints..."
curl -s http://localhost:8000/health | grep -q "healthy" && echo "✓ Backend health check passed" || echo "✗ Backend health check failed"
curl -s http://localhost:3000 | grep -q "DOCTYPE" && echo "✓ Frontend is accessible" || echo "✗ Frontend is not accessible"
echo

echo "=== Verification Complete ==="
EOF

sudo chmod +x /usr/local/bin/verify-deployment.sh

# Run verification
sudo /usr/local/bin/verify-deployment.sh
```

---

## 🎉 You're Ready!

Your Simplingua application is now deployed on Ubuntu 24.04+ VPS without Docker. All services run as systemd services with Python venv for backend isolation.

**Next Steps:**
1. Monitor service logs regularly
2. Set up automated backups
3. Monitor resource usage
4. Keep system packages updated
5. Review SSL certificate expiration
6. Set up monitoring/alerts

**Remember:**
- Keep your `.env` file secure - never commit to version control
- Monitor SSL certificate expiration (certbot auto-renews)
- Review logs regularly
- Set up monitoring/alerts
- Keep backups off-server

**Service Status Commands:**
```bash
# Quick status check
sudo systemctl status simplingua-backend simplingua-frontend nginx postgresql

# Quick logs check
sudo journalctl -u simplingua-backend -n 20
sudo journalctl -u simplingua-frontend -n 20
sudo tail -20 /var/log/nginx/error.log

# Quick health check
curl https://simplingua.mahanzhou.com/health
```

Good luck with your deployment! 🚀
