# Deployment Guide

This guide explains how to deploy the Next.js frontend alongside an existing copyparty installation.

## Table of Contents

- [Quick Start](#quick-start)
- [Deployment Options](#deployment-options)
- [Option 1: Standalone Next.js Server](#option-1-standalone-nextjs-server)
- [Option 2: Docker Deployment](#option-2-docker-deployment)
- [Option 3: Reverse Proxy Setup](#option-3-reverse-proxy-setup)
- [Configuration](#configuration)
- [Troubleshooting](#troubleshooting)

---

## Quick Start

The fastest way to get started:

```bash
cd copyparty-nextjs
npm install
npm run build
npm start
```

This runs the Next.js frontend on **http://localhost:3000**, while your copyparty server continues running on its configured port (default: 3923).

---

## Deployment Options

You have several options for deploying the frontend:

1. **Standalone Server** - Run Next.js on a separate port (simplest)
2. **Docker** - Containerized deployment with docker-compose
3. **Reverse Proxy** - Serve both from the same port using nginx/apache

---

## Option 1: Standalone Next.js Server

### Development

```bash
cd copyparty-nextjs
npm install
npm run dev
```

Access at: http://localhost:3000

### Production

```bash
cd copyparty-nextjs
npm install
npm run build
npm start
```

The frontend runs on port 3000, copyparty backend on port 3923 (or your configured port).

### Running as a Service

#### Using systemd (Linux)

Create `/etc/systemd/system/copyparty-frontend.service`:

```ini
[Unit]
Description=CopyParty Next.js Frontend
After=network.target

[Service]
Type=simple
User=www-data
WorkingDirectory=/path/to/copyparty-nextjs
Environment="NODE_ENV=production"
Environment="PORT=3000"
ExecStart=/usr/bin/npm start
Restart=on-failure
RestartSec=10

[Install]
WantedBy=multi-user.target
```

Enable and start:

```bash
sudo systemctl daemon-reload
sudo systemctl enable copyparty-frontend
sudo systemctl start copyparty-frontend
sudo systemctl status copyparty-frontend
```

#### Using PM2 (Node.js process manager)

```bash
npm install -g pm2

# Start the frontend
cd copyparty-nextjs
pm2 start npm --name "copyparty-frontend" -- start

# Save PM2 configuration
pm2 save

# Setup PM2 to start on boot
pm2 startup
```

**Managing with PM2:**
```bash
pm2 list                    # List all processes
pm2 logs copyparty-frontend # View logs
pm2 restart copyparty-frontend
pm2 stop copyparty-frontend
pm2 delete copyparty-frontend
```

### Configuration

Create `.env.local` in the `copyparty-nextjs` directory:

```bash
# Port for Next.js server
PORT=3000

# CopyParty backend URL (if different from same origin)
NEXT_PUBLIC_API_URL=http://localhost:3923
```

If frontend and backend are on different origins, you need to enable CORS on copyparty:

```bash
copyparty --cors "http://localhost:3000"
```

---

## Option 2: Docker Deployment

### Single Container

Create `Dockerfile` in `copyparty-nextjs/`:

```dockerfile
FROM node:20-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:20-alpine AS runner

WORKDIR /app
ENV NODE_ENV=production

COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/.next/server ./.next/server
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/next.config.ts ./

RUN npm ci --only=production

EXPOSE 3000
ENV PORT=3000

CMD ["npm", "start"]
```

Build and run:

```bash
cd copyparty-nextjs
docker build -t copyparty-frontend .
docker run -p 3000:3000 -e NEXT_PUBLIC_API_URL=http://localhost:3923 copyparty-frontend
```

### Docker Compose (Frontend + Backend)

Create `docker-compose.yml` in the root directory:

```yaml
version: '3.8'

services:
  copyparty:
    image: copyparty/copyparty:latest
    container_name: copyparty-backend
    ports:
      - "3923:3923"
    volumes:
      - ./data:/data
      - ./config:/config
    command: >
      --http-only
      --cors "http://localhost:3000"
      -v /data::r:rw,ed,A
    restart: unless-stopped

  frontend:
    build: ./copyparty-nextjs
    container_name: copyparty-frontend
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - NEXT_PUBLIC_API_URL=http://localhost:3923
    depends_on:
      - copyparty
    restart: unless-stopped

  # Optional: Nginx reverse proxy
  nginx:
    image: nginx:alpine
    container_name: copyparty-nginx
    ports:
      - "80:80"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf:ro
    depends_on:
      - copyparty
      - frontend
    restart: unless-stopped
```

Start everything:

```bash
docker-compose up -d
```

---

## Option 3: Reverse Proxy Setup

Serve both frontend and backend from the same domain/port using a reverse proxy.

### Using Nginx

Create `nginx.conf`:

```nginx
upstream copyparty_backend {
    server localhost:3923;
}

upstream copyparty_frontend {
    server localhost:3000;
}

server {
    listen 80;
    server_name your-domain.com;

    # Frontend - serve from root
    location / {
        proxy_pass http://copyparty_frontend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Backend API - serve from /api
    location /api/ {
        rewrite ^/api/(.*) /$1 break;
        proxy_pass http://copyparty_backend;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        # For file uploads
        client_max_body_size 10G;
        proxy_request_buffering off;
    }

    # Static files
    location /_next/static {
        proxy_pass http://copyparty_frontend;
        proxy_cache_valid 60m;
        add_header Cache-Control "public, immutable";
    }
}
```

Then update `lib/api.ts` to use `/api` prefix:

```typescript
export const api = new CopyPartyAPI('/api');
```

### Using Apache

Create Apache virtual host:

```apache
<VirtualHost *:80>
    ServerName your-domain.com

    # Frontend
    ProxyPass /_next http://localhost:3000/_next
    ProxyPassReverse /_next http://localhost:3000/_next

    ProxyPass / http://localhost:3000/
    ProxyPassReverse / http://localhost:3000/

    # Backend API
    ProxyPass /api http://localhost:3923
    ProxyPassReverse /api http://localhost:3923

    # WebSocket support
    RewriteEngine on
    RewriteCond %{HTTP:Upgrade} websocket [NC]
    RewriteRule /(.*) ws://localhost:3000/$1 [P,L]
</VirtualHost>
```

Enable required modules:

```bash
sudo a2enmod proxy proxy_http proxy_wstunnel rewrite
sudo systemctl restart apache2
```

---

## Configuration

### Environment Variables

Create `.env.local` (or `.env.production` for production):

```bash
# Port for the Next.js server
PORT=3000

# CopyParty backend URL
# Leave empty if using reverse proxy or same origin
NEXT_PUBLIC_API_URL=http://localhost:3923

# Production mode
NODE_ENV=production
```

### Update API Client

If using a reverse proxy with `/api` prefix, update `lib/api.ts`:

```typescript
// For reverse proxy setup
export const api = new CopyPartyAPI('/api');

// For standalone setup (default)
export const api = new CopyPartyAPI(
  process.env.NEXT_PUBLIC_API_URL || ''
);
```

### CopyParty CORS Configuration

If frontend and backend are on different origins:

```bash
# Allow specific origin
copyparty --cors "http://localhost:3000"

# Allow multiple origins
copyparty --cors "http://localhost:3000,https://yourdomain.com"

# Allow all (not recommended for production)
copyparty --cors "*"
```

---

## Security Considerations

### 1. Authentication

The frontend respects copyparty's authentication. Configure copyparty with:

```bash
copyparty -a user:password:/path
```

The frontend will send credentials via cookies or Basic Auth headers.

### 2. HTTPS

For production, always use HTTPS:

```bash
# Using certbot with nginx
sudo certbot --nginx -d yourdomain.com
```

### 3. File Upload Limits

Adjust nginx/apache limits for large file uploads:

**Nginx:**
```nginx
client_max_body_size 10G;
proxy_request_buffering off;
```

**Apache:**
```apache
LimitRequestBody 10737418240
```

---

## Performance Optimization

### 1. Static File Caching

**Nginx:**
```nginx
location /_next/static {
    proxy_pass http://localhost:3000;
    expires 1y;
    add_header Cache-Control "public, immutable";
}
```

### 2. Gzip Compression

**Nginx:**
```nginx
gzip on;
gzip_types text/plain text/css application/json application/javascript;
gzip_min_length 1000;
```

### 3. Node.js Production Mode

```bash
NODE_ENV=production npm start
```

---

## Troubleshooting

### Issue: "Cannot connect to backend"

**Solution:** Check that:
1. CopyParty is running: `curl http://localhost:3923`
2. CORS is enabled if on different origins
3. `NEXT_PUBLIC_API_URL` is set correctly

### Issue: "404 on file operations"

**Solution:** Ensure the API client uses the correct base URL:
- Same origin: Leave `baseURL` empty
- Different origin: Set `NEXT_PUBLIC_API_URL`
- Reverse proxy: Use `/api` prefix

### Issue: "Upload fails for large files"

**Solution:**
1. Increase reverse proxy limits (nginx/apache)
2. Check copyparty upload size limits
3. Verify network timeout settings

### Issue: "Static files not loading"

**Solution:**
1. Rebuild: `npm run build`
2. Clear browser cache
3. Check reverse proxy configuration for `/_next/static`

### Issue: "Frontend shows old content"

**Solution:**
```bash
cd copyparty-nextjs
rm -rf .next
npm run build
pm2 restart copyparty-frontend  # or systemctl restart
```

---

## Monitoring

### View Logs

**PM2:**
```bash
pm2 logs copyparty-frontend
pm2 monit
```

**Systemd:**
```bash
journalctl -u copyparty-frontend -f
```

**Docker:**
```bash
docker logs -f copyparty-frontend
docker-compose logs -f frontend
```

### Health Checks

Add to your monitoring:

```bash
# Frontend health
curl http://localhost:3000

# Backend health
curl http://localhost:3923
```

---

## Updating

### Update Frontend

```bash
cd copyparty-nextjs
git pull
npm install
npm run build

# If using PM2
pm2 restart copyparty-frontend

# If using systemd
sudo systemctl restart copyparty-frontend

# If using Docker
docker-compose down
docker-compose build frontend
docker-compose up -d
```

---

## Additional Resources

- [Next.js Deployment](https://nextjs.org/docs/deployment)
- [CopyParty Documentation](https://github.com/9001/copyparty)
- [PM2 Documentation](https://pm2.keymetrics.io/)
- [Docker Documentation](https://docs.docker.com/)

---

## Support

For issues specific to:
- **Frontend**: Open an issue in this repository
- **Backend/API**: Refer to [CopyParty issues](https://github.com/9001/copyparty/issues)
