# CopyParty Next.js Frontend

A modern, clean frontend for CopyParty file server built with Next.js, TypeScript, and Tailwind CSS. Features a user interface inspired by OneDrive and Google Drive.

## Features

- 🎨 **Modern UI** - Clean, intuitive interface inspired by OneDrive/Google Drive
- 📁 **File Browsing** - Browse files and folders with grid or list view
- 🔍 **Search** - Full-text search across files and folders
- ⬆️ **File Upload** - Drag-and-drop file upload with progress tracking
- ⬇️ **Download** - Download files and folders
- 📝 **File Operations** - Rename, delete, copy, move files and folders
- 🔗 **Share Links** - Create temporary share links
- 📱 **Responsive** - Mobile-friendly design
- ⌨️ **Context Menu** - Right-click context menu for quick actions
- 🎯 **Breadcrumb Navigation** - Easy navigation through folder hierarchy

## Tech Stack

- **Next.js 15** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first CSS framework
- **Lucide React** - Beautiful icon library
- **Axios** - HTTP client for API requests

## Project Structure

```
copyparty-nextjs/
├── app/
│   ├── layout.tsx          # Root layout
│   ├── page.tsx            # Main file browser page
│   └── globals.css         # Global styles
├── components/
│   ├── Header.tsx          # Top navigation bar
│   ├── Sidebar.tsx         # Left sidebar navigation
│   ├── Breadcrumb.tsx      # Breadcrumb navigation
│   ├── FileGrid.tsx        # Grid view for files
│   ├── FileList.tsx        # List view for files
│   ├── UploadModal.tsx     # File upload modal
│   └── ContextMenu.tsx     # Right-click context menu
├── lib/
│   ├── api.ts              # CopyParty API client
│   └── utils.ts            # Utility functions
└── types/
    └── index.ts            # TypeScript type definitions
```

## Quick Start

### Option 1: Quick Start Script (Recommended)

```bash
cd copyparty-nextjs
./start.sh
```

The script will automatically:
- Check Node.js installation
- Install dependencies
- Build the application
- Start the server on http://localhost:3000

### Option 2: Manual Setup

```bash
cd copyparty-nextjs
npm install
npm run build
npm start
```

### Option 3: Docker

```bash
cd copyparty-nextjs
docker-compose up -d
```

Access the frontend at **http://localhost:3000**

> **Important**: Make sure your CopyParty backend is running (default: http://localhost:3923)

---

## Deployment

For production deployment, see **[DEPLOYMENT.md](./DEPLOYMENT.md)** for comprehensive guides on:

- 🚀 **Standalone Server** - Run with systemd or PM2
- 🐳 **Docker Deployment** - Containerized setup
- 🔄 **Reverse Proxy** - Nginx/Apache configuration
- ⚙️ **Configuration** - Environment variables and CORS
- 🔒 **Security** - HTTPS, authentication, and best practices

### Quick Production Setup

1. **Build the application:**
   ```bash
   npm run build
   ```

2. **Run as a service with PM2:**
   ```bash
   npm install -g pm2
   pm2 start npm --name "copyparty-frontend" -- start
   pm2 save
   pm2 startup
   ```

3. **Or use systemd** (copy template and edit paths):
   ```bash
   sudo cp copyparty-frontend.service /etc/systemd/system/
   sudo nano /etc/systemd/system/copyparty-frontend.service  # Edit paths
   sudo systemctl enable copyparty-frontend
   sudo systemctl start copyparty-frontend
   ```

---

## Configuration

Create `.env.local` to configure:

```bash
# CopyParty backend URL (leave empty if same origin)
NEXT_PUBLIC_API_URL=http://localhost:3923

# Frontend port
PORT=3000
```

### CORS Setup

If frontend and backend are on different origins, enable CORS on CopyParty:

```bash
copyparty --cors "http://localhost:3000"
```

---

## Integration with CopyParty

This frontend communicates with the CopyParty backend using its HTTP API:

- **File Operations**: `GET /?ls`, `POST /?delete`, `POST /?move`, etc.
- **Upload**: `POST /path?j` (multipart form-data)
- **Download**: `GET /path?dl`
- **Search**: `GET /?q=query`
- **Shares**: `POST /?share`

The API client (`lib/api.ts`) handles all communication with the backend.

## Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers

## License

This project follows the same license as CopyParty.
