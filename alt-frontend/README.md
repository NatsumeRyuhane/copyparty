# CopyParty Alternative Frontend

A modern, clean web interface for [CopyParty](https://github.com/9001/copyparty) file server, built with Next.js and Tailwind CSS. This frontend provides a Google Drive/OneDrive-like experience for managing files and folders.

## Features

- **Modern UI**: Clean, intuitive interface inspired by Google Drive and OneDrive
- **File Operations**:
  - Upload files (drag & drop or browse)
  - Download files and folders (as ZIP)
  - Delete files and folders
  - Rename/move files
  - Create folders
  - Multi-select support
- **File Sharing**: Create shareable links with:
  - Expiration dates
  - Password protection
  - Custom permissions (read/write)
- **Search**: Full-text search across files and folders
- **View Modes**: Switch between grid and list views
- **Navigation**:
  - Sidebar with folder tree
  - Breadcrumb navigation
  - Quick access shortcuts
- **Standalone**: Runs entirely client-side, can be hosted anywhere

## Prerequisites

- A running CopyParty server (https://github.com/9001/copyparty)
- Node.js 18+ (for building)
- Modern web browser

## Installation & Development

1. Install dependencies:
   ```bash
   npm install
   ```

2. Run development server:
   ```bash
   npm run dev
   ```

3. Open http://localhost:3000 in your browser

4. Configure your CopyParty server URL when prompted

## Building for Production

Build the static site:

```bash
npm run build
```

The output will be in the `out` directory. You can serve this with any static web server:

```bash
# Using Python
python3 -m http.server 8080 --directory out

# Using Node.js serve
npx serve out

# Using nginx, apache, or any other static file server
```

## Deployment

Since this is a static Next.js application, you can deploy it to:

- **CopyParty server**: Copy the `out` directory contents to a folder served by CopyParty
- **Nginx/Apache**: Serve the `out` directory as static files
- **Static hosting**: Vercel, Netlify, GitHub Pages, CloudFlare Pages, etc.
- **CDN**: AWS S3 + CloudFront, Google Cloud Storage, etc.

### Example: Deploy to CopyParty

1. Build the application:
   ```bash
   npm run build
   ```

2. Copy to CopyParty's web directory:
   ```bash
   cp -r out/* /path/to/copyparty/web-directory/
   ```

3. Access via: `http://your-copyparty-server/index.html`

### Example: Nginx Configuration

```nginx
server {
    listen 80;
    server_name files.example.com;

    root /path/to/alt-frontend/out;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

## Configuration

On first launch, you'll be prompted to enter your CopyParty server URL. This is stored in browser localStorage.

To change the server URL later:
1. Open browser DevTools (F12)
2. Go to Application/Storage → Local Storage
3. Delete the `copyparty_url` key
4. Refresh the page

## Usage

### Connecting to CopyParty

1. Enter your CopyParty server URL (e.g., `http://localhost:3923`)
2. Click "Connect"
3. The frontend will connect to your CopyParty server

### File Operations

- **Upload**: Click "Upload" button or drag & drop files
- **Create Folder**: Click "New Folder" button
- **Download**: Select files/folders and click "Download"
- **Delete**: Select files/folders and click "Delete"
- **Rename**: Right-click file → Rename
- **Open File**: Double-click to open in new tab

### Sharing Files

1. Select one or more files/folders
2. Click "Share" button
3. Configure share options:
   - Expiration time (1 hour to never)
   - Password protection (optional)
   - Permissions (read/write)
4. Click "Create Link"
5. The share URL is copied to clipboard

### Search

1. Type your search query in the search box
2. Press Enter
3. Results will display all matching files/folders

### View Modes

- **List View**: Detailed file information in rows
- **Grid View**: Icon-based grid layout

## API Compatibility

This frontend is compatible with CopyParty's HTTP API:

- Directory listing: `GET /?ls`
- Upload: `POST /?act=bput`
- Download: `GET /path/to/file`
- Delete: `POST /?delete`
- Create folder: `POST /?act=mkdir`
- Move/Rename: `POST /?move=dest`
- Search: `POST /?srch`
- Create share: `POST /?share`
- Archive download: `POST /?act=zip`

## Browser Support

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+

## Known Limitations

- No multimedia playback (files open in new tab instead)
- No inline document preview
- No real-time collaboration
- Authentication handled by CopyParty server (use `?pw=` parameter or cookies)

## Development

### Project Structure

```
alt-frontend/
├── app/
│   ├── page.tsx          # Main application page
│   ├── layout.tsx        # Root layout
│   └── globals.css       # Global styles
├── components/
│   ├── FileList.tsx      # File/folder list view
│   ├── Sidebar.tsx       # Navigation sidebar
│   ├── Toolbar.tsx       # Top toolbar with actions
│   ├── FileIcon.tsx      # File type icons
│   └── Modals.tsx        # All modal dialogs
├── lib/
│   ├── api.ts            # CopyParty API client
│   ├── types.ts          # TypeScript types
│   └── utils.ts          # Utility functions
└── public/               # Static assets
```

### Adding New Features

1. **New API endpoint**: Add method to `lib/api.ts`
2. **New component**: Create in `components/`
3. **New modal**: Add to `components/Modals.tsx`
4. **Update types**: Modify `lib/types.ts`

## Troubleshooting

### CORS Errors

If you get CORS errors, configure CopyParty with appropriate CORS headers:

```bash
copyparty --cors-origin "http://localhost:3000"
```

### Connection Failed

1. Verify CopyParty server is running
2. Check the server URL is correct
3. Ensure no firewall blocking the connection
4. Check browser console for errors

### Upload Failed

1. Check you have write permissions on CopyParty
2. Verify file size limits
3. Check CopyParty logs for errors

## Contributing

Contributions are welcome! Please feel free to submit issues or pull requests.

## License

This project is part of the CopyParty ecosystem. See the main CopyParty repository for license information.

## Links

- [CopyParty](https://github.com/9001/copyparty) - The file server backend
- [Next.js](https://nextjs.org/) - React framework
- [Tailwind CSS](https://tailwindcss.com/) - CSS framework
- [Lucide Icons](https://lucide.dev/) - Icon library
