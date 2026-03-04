# Simplingua Production Deployment Guide

This guide covers deploying Simplingua to production environments.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Environment Configuration](#environment-configuration)
3. [Database Setup](#database-setup)
4. [Backend Deployment](#backend-deployment)
5. [Frontend Deployment](#frontend-deployment)
6. [Data Import](#data-import)
7. [Monitoring & Logging](#monitoring--logging)
8. [Security Considerations](#security-considerations)
9. [Troubleshooting](#troubleshooting)

---

## Prerequisites

### Required Software

- **Docker** 20.10+ and **Docker Compose** 2.0+
- **PostgreSQL** 16+ with pgvector extension (if not using Docker)
- **Python** 3.11+ (if running outside Docker)
- **Node.js** 18+ (if running outside Docker)
- **Nginx** or similar reverse proxy (recommended)
- **SSL Certificate** (Let's Encrypt recommended)

### Required Accounts/Services

- DeepSeek API key (default AI provider)
- Optional: OpenAI API key
- Optional: Anthropic API key
- Optional: Ollama/LM Studio (for local AI)

---

## Environment Configuration

### Production `.env` File

Create a `.env` file in the project root with production values:

```bash
# =============================================================================
# Backend Configuration
# =============================================================================

# Application
ENV=production
DEBUG=False
HOST=0.0.0.0
PORT=8000

# Database (Use strong password)
DATABASE_URL=postgresql://simplingua:STRONG_PASSWORD@postgres:5432/simplingua_prod

# JWT Authentication (Use strong secrets!)
JWT_SECRET=$(openssl rand -base64 64)
JWT_ACCESS_TOKEN_EXPIRE_MINUTES=30
JWT_REFRESH_TOKEN_EXPIRE_DAYS=7

# AI Provider
AI_DEFAULT_PROVIDER=deepseek

# DeepSeek (Required)
AI_DEEPSEEK_API_KEY=your_production_deepseek_api_key

# OpenAI (Optional)
AI_OPENAI_API_KEY=your_production_openai_api_key

# Anthropic (Optional)
AI_ANTHROPIC_API_KEY=your_production_anthropic_api_key

# =============================================================================
# Frontend Configuration
# =============================================================================

NEXT_PUBLIC_API_URL=https://api.yourdomain.com

# =============================================================================
# Docker Compose Override
# =============================================================================

DATABASE_URL=postgresql://simplingua:STRONG_PASSWORD@postgres:5432/simplingua_prod
NEXT_PUBLIC_API_URL=https://api.yourdomain.com
```

### Generate Secure Secrets

```bash
# Generate JWT secret
openssl rand -base64 64

# Generate database password
openssl rand -base64 32
```

---

## Database Setup

### Option 1: Docker Compose (Recommended)

The `docker-compose.yml` includes PostgreSQL with pgvector:

```bash
# Start services
docker-compose up -d postgres

# Verify health
docker-compose ps postgres
```

### Option 2: Managed Database

For production, use a managed PostgreSQL service:

- AWS RDS
- Google Cloud SQL
- Azure Database for PostgreSQL
- Supabase
- Neon

**Requirements:**
- PostgreSQL 16+
- pgvector extension enabled
- Sufficient storage (10GB+ recommended for initial data)

**Connection String Format:**
```
postgresql://username:password@host:port/database
```

### Enable pgvector Extension

```bash
# Connect to database
psql $DATABASE_URL

# Enable extension
CREATE EXTENSION IF NOT EXISTS vector;
```

---

## Backend Deployment

### Option 1: Docker Compose

#### Update `docker-compose.yml` for Production

```yaml
version: "3.8"

services:
  postgres:
    image: pgvector/pgvector:pg16
    container_name: simplingua-postgres
    restart: unless-stopped
    environment:
      POSTGRES_DB: simplingua_prod
      POSTGRES_USER: simplingua
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
    networks:
      - internal
    healthcheck:
      test: ["CMD-SHELL", "pg_isready", "-U", "simplingua"]
      interval: 5s
      timeout: 5s
      retries: 5

  backend:
    build: ./backend
    container_name: simplingua-backend
    restart: unless-stopped
    ports:
      - "127.0.0.1:8000:8000"  # Bind to localhost only
    environment:
      - ENV=production
      - DATABASE_URL=${DATABASE_URL}
      - JWT_SECRET=${JWT_SECRET}
      - AI_DEFAULT_PROVIDER=deepseek
      - AI_DEEPSEEK_API_KEY=${AI_DEEPSEEK_API_KEY}
      - AI_OPENAI_API_KEY=${AI_OPENAI_API_KEY}
      - AI_ANTHROPIC_API_KEY=${AI_ANTHROPIC_API_KEY}
    depends_on:
      postgres:
        condition: service_healthy
    networks:
      - internal
      - external
    volumes:
      - ./backend/logs:/app/logs

  frontend:
    build: ./frontend
    container_name: simplingua-frontend
    restart: unless-stopped
    ports:
      - "127.0.0.1:3000:3000"  # Bind to localhost only
    environment:
      - NEXT_PUBLIC_API_URL=https://api.yourdomain.com
    depends_on:
      - backend
    networks:
      - external

volumes:
  postgres_data:

networks:
  internal:
    driver: bridge
  external:
    driver: bridge
```

#### Build and Deploy

```bash
# Load environment variables
set -a
source .env
set +a

# Build images
docker-compose build

# Start services
docker-compose up -d

# Check logs
docker-compose logs -f backend
```

### Option 2: Direct Server Deployment

#### Backend Deployment

```bash
# Navigate to backend directory
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Run migrations (if using Alembic)
# alembic upgrade head

# Start with gunicorn (production WSGI server)
pip install gunicorn uvicorn[standard]

gunicorn app.main:app \
  --workers 4 \
  --worker-class uvicorn.workers.UvicornWorker \
  --bind 0.0.0.0:8000 \
  --access-logfile logs/access.log \
  --error-logfile logs/error.log \
  --log-level info
```

#### Backend Systemd Service

Create `/etc/systemd/system/simplingua-backend.service`:

```ini
[Unit]
Description=Simplingua Backend
After=network.target postgresql.service

[Service]
Type=exec
User=simplingua
WorkingDirectory=/home/simplingua/backend
Environment="PATH=/home/simplingua/backend/venv/bin"
ExecStart=/home/simplingua/backend/venv/bin/gunicorn app.main:app --workers 4 --worker-class uvicorn.workers.UvicornWorker --bind 0.0.0.0:8000
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
```

```bash
# Enable and start service
sudo systemctl enable simplingua-backend
sudo systemctl start simplingua-backend
sudo systemctl status simplingua-backend
```

---

## Frontend Deployment

### Option 1: Docker Compose

Already configured in `docker-compose.yml` above.

### Option 2: Vercel (Recommended for Next.js)

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy from frontend directory
cd frontend
vercel --prod

# Set environment variables in Vercel dashboard
# NEXT_PUBLIC_API_URL=https://api.yourdomain.com
```

### Option 3: Nginx Reverse Proxy

#### Build Frontend

```bash
cd frontend
npm install
npm run build
```

#### Nginx Configuration

Create `/etc/nginx/sites-available/simplingua`:

```nginx
# Frontend (Next.js static export or production build)
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;

    # Redirect to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name yourdomain.com www.yourdomain.com;

    # SSL Configuration (Let's Encrypt)
    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;

    # Frontend
    location / {
        root /home/simplingua/frontend/.next/server/app;
        try_files $uri $uri/ /index.html;
    }

    # Backend API
    location /api/ {
        proxy_pass http://127.0.0.1:8000/api/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Chat SSE endpoint
    location /api/chat/stream {
        proxy_pass http://127.0.0.1:8000/api/chat/stream;
        proxy_http_version 1.1;
        proxy_set_header Connection "";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        chunked_transfer_encoding off;
    }

    # Static assets
    location /_next/static {
        alias /home/simplingua/frontend/.next/static;
        expires 365d;
        add_header Cache-Control "public, immutable";
    }

    # Media files
    location /uploads {
        alias /home/simplingua/uploads;
        expires 7d;
    }
}
```

```bash
# Enable site
sudo ln -s /etc/nginx/sites-available/simplingua /etc/nginx/sites-enabled/

# Test configuration
sudo nginx -t

# Restart Nginx
sudo systemctl restart nginx
```

#### Next.js Production Server

If not using static export, run Next.js production server:

```bash
cd frontend

# Install PM2 process manager
npm install -g pm2

# Start with PM2
pm2 start npm --name "simplingua-frontend" -- start

# Save PM2 config
pm2 save
pm2 startup
```

---

## Data Import

### Import Dictionary and Grammar

```bash
cd toolkit

# Create virtual environment
python -m venv venv
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Parse documents
python parse_dictionary.py ../docs/dictionary-in-cn.txt > dictionary.json
python parse_grammar.py ../docs/grammar-in-cn.txt > grammar.json

# Upload to database
python upload.py --database-url $DATABASE_URL
```

### Verify Import

```bash
# Check word count
psql $DATABASE_URL -c "SELECT COUNT(*) FROM words;"

# Check grammar sections
psql $DATABASE_URL -c "SELECT COUNT(*) FROM grammar;"

# Check grammar sections
psql $DATABASE_URL -c "SELECT section_id, COUNT(*) FROM grammar GROUP BY section_id;"
```

---

## Monitoring & Logging

### Backend Logging

Logs are configured to write to `logs/` directory:

```bash
# View logs
tail -f backend/logs/access.log
tail -f backend/logs/error.log
```

### Docker Logs

```bash
# View all logs
docker-compose logs -f

# View specific service
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f postgres
```

### Health Checks

```bash
# Backend health endpoint
curl https://api.yourdomain.com/health

# API status
curl https://api.yourdomain.com/api/v1/status
```

### Monitoring Tools (Optional)

- **Prometheus + Grafana**: Metrics and dashboards
- **Sentry**: Error tracking
- **Datadog**: Full-stack monitoring
- **Uptime Robot**: External uptime monitoring

---

## Security Considerations

### 1. Secrets Management

- Never commit `.env` files
- Use environment-specific secrets
- Rotate JWT secrets periodically
- Use strong, randomly generated passwords

### 2. SSL/TLS

- Always use HTTPS in production
- Use Let's Encrypt for free SSL certificates
- Configure HSTS headers
- Disable weak cipher suites

### 3. Rate Limiting

Configure rate limiting on API endpoints:

```python
# In backend/app/main.py
from slowapi import Limiter
from slowapi.util import get_remote_address

limiter = Limiter(key_func=get_remote_address)

@app.get("/api/v1/search")
@limiter.limit("100/minute")
async def search_endpoint(request: Request):
    ...
```

### 4. CORS Configuration

Restrict CORS to your frontend domain only:

```python
# In backend/app/main.py
app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://yourdomain.com"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

### 5. Database Security

- Use strong database passwords
- Restrict database access to backend server only
- Enable PostgreSQL SSL mode
- Regular backups

### 6. API Key Security

- Store AI API keys in environment variables
- Rotate keys periodically
- Monitor usage for anomalies

### 7. Firewall Rules

```bash
# Allow only necessary ports
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw allow 22/tcp
sudo ufw enable
```

---

## Backup Strategy

### Database Backups

```bash
# Automated daily backup
# Add to crontab
0 2 * * * pg_dump $DATABASE_URL > /backups/simplingua_$(date +\%Y\%m\%d).sql
```

### Docker Volume Backups

```bash
# Backup PostgreSQL volume
docker run --rm -v simplingua_postgres_data:/data -v $(pwd):/backup alpine tar czf /backup/postgres_backup.tar.gz -C /data .

# Restore
docker run --rm -v simplingua_postgres_data:/data -v $(pwd):/backup alpine tar xzf /backup/postgres_backup.tar.gz -C /data
```

---

## Troubleshooting

### Backend Issues

**Service won't start:**
```bash
# Check logs
docker-compose logs backend

# Common issues:
# - Database connection failure: Check DATABASE_URL
# - Missing dependencies: Rebuild image
# - Port conflicts: Change PORT in .env
```

**Database connection refused:**
```bash
# Check PostgreSQL is running
docker-compose ps postgres

# Test connection
docker-compose exec backend python -c "from app.core.database import engine; print(engine.connect())"
```

### Frontend Issues

**Build fails:**
```bash
# Clean cache
rm -rf frontend/.next frontend/node_modules
cd frontend && npm install && npm run build
```

**API calls failing:**
- Verify `NEXT_PUBLIC_API_URL` is correct
- Check CORS configuration
- Verify backend is running
- Check browser console for errors

### Database Issues

**pgvector extension missing:**
```bash
docker-compose exec postgres psql -U simplingua -d simplingua_prod -c "CREATE EXTENSION IF NOT EXISTS vector;"
```

**Slow queries:**
```bash
# Add indexes
psql $DATABASE_URL -c "CREATE INDEX idx_words_embedding ON words USING ivfflat (embedding vector_cosine_ops);"
```

### Performance Issues

**Slow API response:**
- Check database query performance
- Verify pgvector indexes are created
- Consider increasing worker count
- Enable query caching

**Memory issues:**
```bash
# Increase Docker memory limits
# In docker-compose.yml:
services:
  backend:
    deploy:
      resources:
        limits:
          memory: 2G
```

---

## Scaling Considerations

### Horizontal Scaling

For high traffic, consider:

1. **Load Balancer**: Nginx or HAProxy
2. **Multiple Backend Instances**: Scale backend horizontally
3. **Read Replicas**: PostgreSQL read replicas
4. **CDN**: Cloudflare or AWS CloudFront for static assets
5. **Caching Layer**: Redis for session and query caching

### Database Scaling

- Connection pooling (PgBouncer)
- Read replicas for read-heavy workloads
- Partitioning for large tables
- Materialized views for complex queries

---

## Maintenance

### Regular Updates

```bash
# Update dependencies monthly
cd backend && pip install --upgrade -r requirements.txt
cd frontend && npm update

# Rebuild and restart
docker-compose build && docker-compose up -d
```

### Log Rotation

Configure logrotate to prevent disk space issues:

```bash
# /etc/logrotate.d/simplingua
/home/simplingua/backend/logs/*.log {
    daily
    rotate 14
    compress
    delaycompress
    notifempty
    create 0640 simplingua simplingua
}
```

---

## Production Checklist

- [ ] All secrets changed from defaults
- [ ] SSL/TLS certificates installed and valid
- [ ] Database backups configured and tested
- [ ] Firewall rules configured
- [ ] CORS restricted to production domain
- [ ] Rate limiting configured
- [ ] Monitoring and alerts set up
- [ ] Log rotation configured
- [ ] Health checks working
- [ ] Data import completed
- [ ] Frontend production build tested
- [ ] Backend API tested with production database
- [ ] Error tracking configured (Sentry, etc.)
- [ ] Performance baseline established
- [ ] Rollback plan documented
- [ ] Team trained on deployment process

---

## Support

For issues and questions:
- Check this documentation first
- Review logs for error messages
- Consult the project README files
- Open an issue in the project repository

---

**Last Updated**: 2025
**Version**: 1.0.0
