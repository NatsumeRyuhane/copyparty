'use client';

import { useState, useEffect } from 'react';
import Header from '@/components/Header';
import Sidebar from '@/components/Sidebar';
import Breadcrumb from '@/components/Breadcrumb';
import FileGrid from '@/components/FileGrid';
import FileList from '@/components/FileList';
import UploadModal from '@/components/UploadModal';
import ContextMenu from '@/components/ContextMenu';
import { api } from '@/lib/api';
import { FileItem, ViewMode, UploadProgress } from '@/types';
import { joinPath } from '@/lib/utils';

export default function Home() {
  const [currentPath, setCurrentPath] = useState('/');
  const [files, setFiles] = useState<FileItem[]>([]);
  const [directories, setDirectories] = useState<FileItem[]>([]);
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [loading, setLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [uploads, setUploads] = useState<UploadProgress[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  // Context menu state
  const [contextMenu, setContextMenu] = useState<{
    item: FileItem | null;
    position: { x: number; y: number };
  }>({ item: null, position: { x: 0, y: 0 } });

  // Load directory contents
  useEffect(() => {
    loadDirectory(currentPath);
  }, [currentPath]);

  const loadDirectory = async (path: string) => {
    setLoading(true);
    try {
      const listing = await api.listDirectory(path);
      setDirectories(listing.dirs || []);
      setFiles(listing.files || []);
    } catch (error) {
      console.error('Error loading directory:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleNavigate = (path: string) => {
    setCurrentPath(path);
  };

  const handleItemClick = (item: FileItem) => {
    if (item.is_dir) {
      // Navigate to directory
      const newPath = joinPath(currentPath, item.name);
      setCurrentPath(newPath);
    } else {
      // Open file (download or preview)
      window.open(item.href, '_blank');
    }
  };

  const handleItemContextMenu = (item: FileItem, event: React.MouseEvent) => {
    event.preventDefault();
    setContextMenu({
      item,
      position: { x: event.clientX, y: event.clientY },
    });
  };

  const handleUpload = async (uploadFiles: File[]) => {
    const newUploads: UploadProgress[] = uploadFiles.map((file) => ({
      file,
      progress: 0,
      status: 'pending',
    }));

    setUploads(newUploads);

    // Upload files sequentially
    for (let i = 0; i < uploadFiles.length; i++) {
      const file = uploadFiles[i];

      setUploads((prev) =>
        prev.map((u, idx) =>
          idx === i ? { ...u, status: 'uploading' as const } : u
        )
      );

      try {
        await api.uploadFile(currentPath, file, (progress) => {
          setUploads((prev) =>
            prev.map((u, idx) => (idx === i ? { ...u, progress } : u))
          );
        });

        setUploads((prev) =>
          prev.map((u, idx) =>
            idx === i ? { ...u, status: 'complete' as const, progress: 100 } : u
          )
        );
      } catch (error) {
        setUploads((prev) =>
          prev.map((u, idx) =>
            idx === i
              ? {
                  ...u,
                  status: 'error' as const,
                  error: 'Upload failed',
                }
              : u
          )
        );
      }
    }

    // Reload directory after uploads
    setTimeout(() => {
      loadDirectory(currentPath);
    }, 1000);
  };

  const handleDownload = (item: FileItem) => {
    const downloadUrl = api.getDownloadUrl(item.href);
    window.open(downloadUrl, '_blank');
  };

  const handleShare = async (item: FileItem) => {
    try {
      const share = await api.createShare(item.href);
      alert(`Share link: ${window.location.origin}${share.url}`);
    } catch (error) {
      console.error('Error creating share:', error);
      alert('Failed to create share link');
    }
  };

  const handleCopy = (item: FileItem) => {
    // Store in clipboard (to be implemented with proper clipboard API)
    console.log('Copy:', item);
    alert('Copy functionality coming soon!');
  };

  const handleCut = (item: FileItem) => {
    console.log('Cut:', item);
    alert('Cut functionality coming soon!');
  };

  const handleRename = async (item: FileItem) => {
    const newName = prompt('Enter new name:', item.name);
    if (newName && newName !== item.name) {
      try {
        const newPath = joinPath(currentPath, newName);
        await api.moveFile(item.href, newPath);
        loadDirectory(currentPath);
      } catch (error) {
        console.error('Error renaming file:', error);
        alert('Failed to rename file');
      }
    }
  };

  const handleDelete = async (item: FileItem) => {
    if (confirm(`Are you sure you want to delete "${item.name}"?`)) {
      try {
        await api.deleteFile(item.href);
        loadDirectory(currentPath);
      } catch (error) {
        console.error('Error deleting file:', error);
        alert('Failed to delete file');
      }
    }
  };

  const handleInfo = (item: FileItem) => {
    console.log('Info:', item);
    alert(
      `Name: ${item.name}\nSize: ${item.sz} bytes\nModified: ${new Date(
        item.mt * 1000
      ).toLocaleString()}`
    );
  };

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    if (query.trim()) {
      try {
        const results = await api.search(query, currentPath);
        setFiles(results.files);
        setDirectories([]);
      } catch (error) {
        console.error('Error searching:', error);
      }
    } else {
      loadDirectory(currentPath);
    }
  };

  // Combine directories and files for display
  const allItems = [...directories, ...files];

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Sidebar */}
      <Sidebar
        currentPath={currentPath}
        onNavigate={handleNavigate}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <Header
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          onSearchChange={handleSearch}
          onUploadClick={() => setUploadModalOpen(true)}
          onMenuClick={() => setSidebarOpen(true)}
        />

        {/* Breadcrumb */}
        <Breadcrumb path={currentPath} onNavigate={handleNavigate} />

        {/* File browser */}
        <main className="flex-1 overflow-auto bg-white">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-gray-500">Loading...</div>
            </div>
          ) : viewMode === 'grid' ? (
            <FileGrid
              items={allItems}
              onItemClick={handleItemClick}
              onItemContextMenu={handleItemContextMenu}
            />
          ) : (
            <FileList
              items={allItems}
              onItemClick={handleItemClick}
              onItemContextMenu={handleItemContextMenu}
            />
          )}
        </main>
      </div>

      {/* Upload modal */}
      <UploadModal
        isOpen={uploadModalOpen}
        onClose={() => {
          setUploadModalOpen(false);
          setUploads([]);
        }}
        onUpload={handleUpload}
        uploads={uploads}
      />

      {/* Context menu */}
      {contextMenu.item && (
        <ContextMenu
          item={contextMenu.item}
          position={contextMenu.position}
          onClose={() => setContextMenu({ item: null, position: { x: 0, y: 0 } })}
          onDownload={handleDownload}
          onShare={handleShare}
          onCopy={handleCopy}
          onCut={handleCut}
          onRename={handleRename}
          onDelete={handleDelete}
          onInfo={handleInfo}
        />
      )}
    </div>
  );
}
