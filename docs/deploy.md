# Simplingua 部署指南

## 环境要求

- Node.js >= 18.x
- npm >= 9.x
- MongoDB >= 6.x
- 内存: >= 1GB
- 磁盘: >= 2GB

---

## 方式一：Docker 部署（推荐）

### 1. 安装 Docker 和 Docker Compose

```bash
# Ubuntu/Debian
curl -fsSL https://get.docker.com | sh
sudo usermod -aG docker $USER
```

### 2. 配置环境变量

```bash
cp .env.docker.example .env
```

编辑 `.env`，设置以下变量：

```env
# 使用 openssl rand -base64 32 生成
JWT_SECRET=你的随机密钥

# 管理员账号，格式: 用户名:密码，多个用逗号分隔
ADMIN_ACCOUNTS=admin:your_password
```

### 3. 构建并启动

```bash
docker compose up -d --build
```

### 4. 导入初始数据

```bash
# 进入容器执行种子脚本
docker compose exec app npx tsx scripts/seed.ts
```

### 5. 常用命令

```bash
# 查看日志
docker compose logs -f app

# 停止服务
docker compose down

# 更新部署（拉取新代码后）
docker compose up -d --build
```

### 6. 反向代理（Nginx）

```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_cache_bypass $http_upgrade;
    }
}
```

---

## 方式二：独立 VPS 部署

### 1. 安装依赖

```bash
# 安装 Node.js 18
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# 安装 MongoDB 7
# 参考: https://www.mongodb.com/docs/manual/installation/
```

### 2. 获取代码

```bash
git clone <your-repo-url> /opt/simplingua
cd /opt/simplingua
npm ci
```

### 3. 配置环境变量

```bash
cat > .env.local << 'EOF'
MONGODB_URI=mongodb://localhost:27017/simplingua
JWT_SECRET=$(openssl rand -base64 32)
ADMIN_ACCOUNTS=admin:your_password
EOF
```

### 4. 构建项目

```bash
npm run build
```

### 5. 导入初始数据

```bash
npm run seed
```

### 6. 使用 systemd 管理进程

创建 `/etc/systemd/system/simplingua.service`：

```ini
[Unit]
Description=Simplingua Web App
After=network.target mongod.service

[Service]
Type=simple
User=www-data
WorkingDirectory=/opt/simplingua
ExecStart=/usr/bin/node server.js
Restart=on-failure
RestartSec=10
Environment=NODE_ENV=production
Environment=PORT=3000

[Install]
WantedBy=multi-user.target
```

> **注意**：使用 standalone 构建时，`server.js` 位于 `.next/standalone/` 目录。
> 将 `.next/standalone/` 复制到部署目录，或修改 `WorkingDirectory` 指向它。

### 7. 启动服务

```bash
sudo systemctl daemon-reload
sudo systemctl enable simplingua
sudo systemctl start simplingua

# 查看状态
sudo systemctl status simplingua

# 查看日志
sudo journalctl -u simplingua -f
```

### 8. 配置 Nginx 反向代理

同 Docker 部署中的 Nginx 配置。

---

## SSL 证书（可选）

使用 Let's Encrypt 免费证书：

```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com
```

---

## 数据备份

```bash
# MongoDB 备份
mongodump --db simplingua --out /backup/simplingua-$(date +%Y%m%d)

# 恢复
mongorestore --db simplingua /backup/simplingua-20240101/simplingua
```

---

## 环境变量说明

| 变量 | 必需 | 说明 |
|------|------|------|
| `MONGODB_URI` | 是 | MongoDB 连接字符串 |
| `JWT_SECRET` | 是 | JWT 签名密钥，建议 32+ 字符 |
| `ADMIN_ACCOUNTS` | 是 | 管理员账号，格式 `user:pass,user2:pass2` |
| `PORT` | 否 | 服务端口，默认 3000 |
