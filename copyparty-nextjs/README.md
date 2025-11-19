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

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- A running CopyParty server

### Installation

1. Navigate to the project directory:
```bash
cd copyparty-nextjs
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

### Production Build

```bash
npm run build
npm start
```

## Integration with CopyParty

This frontend communicates with the CopyParty backend using its HTTP API.

## Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers

## License

This project follows the same license as CopyParty.
