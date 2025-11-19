# Installation Guide for Existing CopyParty Users

This guide helps you add the modern Next.js frontend to your existing CopyParty installation.

## Overview

The Next.js frontend runs as a **separate service** alongside your existing CopyParty backend. Both services communicate via HTTP API calls.

**Architecture:**
```
┌─────────────────────────┐     ┌─────────────────────────┐
│  Next.js Frontend       │────▶│  CopyParty Backend      │
│  (Port 3000)            │     │  (Port 3923)            │
│  Modern UI              │     │  File storage & API     │
└─────────────────────────┘     └─────────────────────────┘
```

You can:
- Access the new frontend at `http://your-server:3000`
- Keep using the original frontend at `http://your-server:3923`
- Switch between both interfaces

---

## Method 1: Quick Installation (5 minutes)

### Step 1: Download/Clone the Frontend

If you cloned the full repository:
```bash
cd /path/to/copyparty
cd copyparty-nextjs
```

Or if you received just the frontend folder:
```bash
cd /path/to/copyparty-nextjs
```

### Step 2: Install Dependencies

```bash
npm install
```

This will take 1-2 minutes.

### Step 3: Build the Application

```bash
npm run build
```

This will take 30-60 seconds.

### Step 4: Configure Backend URL (if needed)

If your CopyParty backend is **NOT** on `localhost:3923`, create `.env.local`:

```bash
cat > .env.local << EOF
NEXT_PUBLIC_API_URL=http://your-server-ip:3923
PORT=3000
EOF
```

### Step 5: Enable CORS on CopyParty

Edit your CopyParty startup command to allow the frontend to make API calls:

**If you start CopyParty manually:**
```bash
copyparty --cors "http://localhost:3000" [your other options]
```

**If you use systemd service:**
Edit `/etc/systemd/system/copyparty.service` and add `--cors "http://localhost:3000"` to the `ExecStart` line:

```ini
ExecStart=/usr/bin/copyparty --cors "http://localhost:3000" -v /data::r:rw,ed,A
```

Then restart:
```bash
sudo systemctl daemon-reload
sudo systemctl restart copyparty
```

### Step 6: Start the Frontend

**For testing:**
```bash
npm start
```

The frontend will be available at `http://localhost:3000`

**For production, continue to Method 2 below.**

---

## Method 2: Production Installation with PM2

### Step 1-5: Same as Method 1

Complete steps 1-5 from Method 1 above.

### Step 6: Install PM2

```bash
npm install -g pm2
```

### Step 7: Start Frontend with PM2

```bash
cd /path/to/copyparty-nextjs
pm2 start npm --name "copyparty-frontend" -- start
```

### Step 8: Configure PM2 to Start on Boot

```bash
pm2 save
pm2 startup
# Follow the instructions shown
```

### Step 9: Verify Status

```bash
pm2 status
pm2 logs copyparty-frontend
```

**Management commands:**
```bash
pm2 restart copyparty-frontend   # Restart
pm2 stop copyparty-frontend      # Stop
pm2 start copyparty-frontend     # Start
pm2 logs copyparty-frontend      # View logs
pm2 monit                        # Monitor
```

---

## Method 3: Production Installation with systemd

### Step 1-5: Same as Method 1

Complete steps 1-5 from Method 1 above.

### Step 6: Create systemd Service

```bash
sudo cp copyparty-frontend.service /etc/systemd/system/
```

### Step 7: Edit Service File

```bash
sudo nano /etc/systemd/system/copyparty-frontend.service
```

Update these lines:
- `WorkingDirectory=/path/to/copyparty-nextjs` ← Your actual path
- `User=www-data` ← Your preferred user
- `ReadWritePaths=/path/to/copyparty-nextjs` ← Your actual path

If your backend is not on localhost:3923, add:
```ini
Environment="NEXT_PUBLIC_API_URL=http://your-server:3923"
```

### Step 8: Enable and Start Service

```bash
sudo systemctl daemon-reload
sudo systemctl enable copyparty-frontend
sudo systemctl start copyparty-frontend
```

### Step 9: Check Status

```bash
sudo systemctl status copyparty-frontend
sudo journalctl -u copyparty-frontend -f  # View logs
```

---

## Method 4: Docker Installation

### Step 1: Build Docker Image

```bash
cd /path/to/copyparty-nextjs
docker build -t copyparty-frontend .
```

### Step 2: Run Container

**If CopyParty is on the same host:**
```bash
docker run -d \
  --name copyparty-frontend \
  --network host \
  -e NEXT_PUBLIC_API_URL=http://localhost:3923 \
  -p 3000:3000 \
  --restart unless-stopped \
  copyparty-frontend
```

**If CopyParty is elsewhere:**
```bash
docker run -d \
  --name copyparty-frontend \
  -e NEXT_PUBLIC_API_URL=http://your-copyparty-server:3923 \
  -p 3000:3000 \
  --restart unless-stopped \
  copyparty-frontend
```

### Step 3: Verify

```bash
docker ps
docker logs copyparty-frontend
```

---

## Accessing the New Frontend

Once installed, you can access:

- **New Modern Frontend**: `http://your-server:3000`
- **Original CopyParty UI**: `http://your-server:3923`

Both interfaces work simultaneously and use the same backend data.

---

## Reverse Proxy Setup (Optional)

To serve both frontends from the same port using nginx:

### Create nginx Configuration

```nginx
# /etc/nginx/sites-available/copyparty

upstream copyparty_backend {
    server localhost:3923;
}

upstream copyparty_frontend {
    server localhost:3000;
}

server {
    listen 80;
    server_name your-domain.com;

    # New frontend at root
    location / {
        proxy_pass http://copyparty_frontend;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    # Original UI at /classic
    location /classic {
        proxy_pass http://copyparty_backend;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    # API endpoints
    location /api {
        proxy_pass http://copyparty_backend;
        proxy_http_version 1.1;
        client_max_body_size 10G;
    }
}
```

Enable and restart:
```bash
sudo ln -s /etc/nginx/sites-available/copyparty /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

Now access:
- New frontend: `http://your-domain.com/`
- Classic UI: `http://your-domain.com/classic`

---

## Troubleshooting

### Frontend shows "Cannot connect to backend"

**Check if CopyParty is running:**
```bash
curl http://localhost:3923
```

**Check CORS is enabled:**
```bash
# Look for --cors in your copyparty command
ps aux | grep copyparty
```

**Solution:** Add `--cors "http://localhost:3000"` to your CopyParty startup command.

### "Permission denied" errors

**Solution:** Ensure the service user has access to the directory:
```bash
sudo chown -R www-data:www-data /path/to/copyparty-nextjs
```

### Port 3000 already in use

**Find what's using it:**
```bash
sudo lsof -i :3000
```

**Change the port:**
Create `.env.local`:
```bash
PORT=3001
```

### Frontend shows old content after update

**Solution:**
```bash
cd /path/to/copyparty-nextjs
rm -rf .next
npm run build
pm2 restart copyparty-frontend  # or systemctl restart
```

---

## Updating the Frontend

When a new version is released:

```bash
cd /path/to/copyparty-nextjs
git pull  # or download new version
npm install
npm run build

# Then restart:
pm2 restart copyparty-frontend
# OR
sudo systemctl restart copyparty-frontend
# OR
docker restart copyparty-frontend
```

---

## Uninstalling

### Remove PM2 Service

```bash
pm2 delete copyparty-frontend
pm2 save
```

### Remove systemd Service

```bash
sudo systemctl stop copyparty-frontend
sudo systemctl disable copyparty-frontend
sudo rm /etc/systemd/system/copyparty-frontend.service
sudo systemctl daemon-reload
```

### Remove Docker Container

```bash
docker stop copyparty-frontend
docker rm copyparty-frontend
docker rmi copyparty-frontend
```

### Remove Files

```bash
rm -rf /path/to/copyparty-nextjs
```

---

## Getting Help

- Check [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed configuration
- Review [README.md](./README.md) for features and usage
- Check CopyParty logs: `journalctl -u copyparty -f`
- Check Frontend logs: `pm2 logs copyparty-frontend` or `journalctl -u copyparty-frontend -f`

---

## Summary Checklist

- [ ] Install Node.js 18+
- [ ] Download/clone frontend
- [ ] Run `npm install`
- [ ] Run `npm run build`
- [ ] Configure `.env.local` (if needed)
- [ ] Add `--cors` to CopyParty
- [ ] Start frontend (pm2/systemd/docker)
- [ ] Access at http://localhost:3000
- [ ] Test file browsing
- [ ] Test file upload
- [ ] Configure reverse proxy (optional)

Enjoy your modern CopyParty interface! 🎉
