'use client';

import { useState, useEffect, useCallback } from 'react';
import { FileEntry, DirectoryListing, TreeNode } from '@/lib/types';
import { getAPI, setAPIConfig } from '@/lib/api';
import { joinPath, getParentPath, downloadBlob } from '@/lib/utils';
import Sidebar from '@/components/Sidebar';
import Toolbar from '@/components/Toolbar';
import FileList from '@/components/FileList';
import {
  UploadModal,
  CreateFolderModal,
  RenameModal,
  ShareModal,
  DeleteConfirmModal,
  ShareOptions,
} from '@/components/Modals';
import { ChevronRight, Home as HomeIcon, Loader2 } from 'lucide-react';

export default function Home() {
  const [currentPath, setCurrentPath] = useState('/');
  const [listing, setListing] = useState<DirectoryListing | null>(null);
  const [tree, setTree] = useState<TreeNode[]>([]);
  const [selectedFiles, setSelectedFiles] = useState<Set<string>>(new Set());
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Modal states
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showCreateFolderModal, setShowCreateFolderModal] = useState(false);
  const [showRenameModal, setShowRenameModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // Configuration
  const [isConfigured, setIsConfigured] = useState(false);
  const [serverUrl, setServerUrl] = useState('');

  const api = getAPI();

  // Check if configured
  useEffect(() => {
    const savedUrl = localStorage.getItem('copyparty_url');
    if (savedUrl) {
      setServerUrl(savedUrl);
      setAPIConfig({ baseUrl: savedUrl });
      setIsConfigured(true);
    }
  }, []);

  // Load directory listing
  const loadDirectory = useCallback(async (path: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await api.listDirectory(path);
      setListing(data);
      setCurrentPath(path);
      setSelectedFiles(new Set());
    } catch (err: any) {
      setError(err.message || 'Failed to load directory');
      console.error('Error loading directory:', err);
    } finally {
      setIsLoading(false);
    }
  }, [api]);

  // Load directory tree
  const loadTree = useCallback(async () => {
    try {
      const treeData = await api.getTree('/');
      setTree(treeData);
    } catch (err) {
      console.error('Error loading tree:', err);
    }
  }, [api]);

  // Initial load
  useEffect(() => {
    if (isConfigured) {
      loadDirectory(currentPath);
      loadTree();
    }
  }, [isConfigured, loadDirectory, loadTree]);

  // Handle file click
  const handleFileClick = (file: FileEntry) => {
    // Selection is handled in FileList component
  };

  // Handle file double click
  const handleFileDoubleClick = (file: FileEntry) => {
    if (file.dir) {
      loadDirectory(file.href);
    } else {
      // Open file in new tab
      window.open(api.getFileUrl(file.href), '_blank');
    }
  };

  // Handle upload
  const handleUpload = async (files: FileList) => {
    setIsLoading(true);
    try {
      const fileArray = Array.from(files);
      for (const file of fileArray) {
        await api.uploadFile(currentPath, file);
      }
      await loadDirectory(currentPath);
    } catch (err: any) {
      setError(err.message || 'Failed to upload files');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle create folder
  const handleCreateFolder = async (name: string) => {
    setIsLoading(true);
    try {
      await api.createDirectory(currentPath, name);
      await loadDirectory(currentPath);
      await loadTree();
    } catch (err: any) {
      setError(err.message || 'Failed to create folder');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle download
  const handleDownload = async () => {
    if (selectedFiles.size === 0) return;

    const selectedPaths = Array.from(selectedFiles);

    try {
      if (selectedFiles.size === 1) {
        const path = selectedPaths[0];
        const file = [...(listing?.files || []), ...(listing?.dirs || [])].find(
          (f) => f.href === path
        );

        if (file && !file.dir) {
          // Single file download
          const blob = await api.downloadFile(path);
          downloadBlob(blob, file.name);
        } else {
          // Single folder - download as zip
          const blob = await api.downloadAsZip(selectedPaths);
          downloadBlob(blob, 'download.zip');
        }
      } else {
        // Multiple files - download as zip
        const blob = await api.downloadAsZip(selectedPaths);
        downloadBlob(blob, 'download.zip');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to download');
    }
  };

  // Handle delete
  const handleDelete = async () => {
    if (selectedFiles.size === 0) return;

    setIsLoading(true);
    try {
      await api.deleteFiles(Array.from(selectedFiles));
      await loadDirectory(currentPath);
      await loadTree();
    } catch (err: any) {
      setError(err.message || 'Failed to delete files');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle share
  const handleShare = async (options: ShareOptions) => {
    if (selectedFiles.size === 0) return;

    try {
      const shareKey = 'share_' + Date.now();
      const result = await api.createShare({
        k: shareKey,
        vp: Array.from(selectedFiles),
        perms: options.permissions,
        exp: options.expirationMinutes,
        pw: options.password,
      });

      const shareUrl = `${serverUrl}/${shareKey}`;

      // Copy to clipboard
      await navigator.clipboard.writeText(shareUrl);
      alert(`Share link created and copied to clipboard:\n${shareUrl}`);
    } catch (err: any) {
      setError(err.message || 'Failed to create share');
    }
  };

  // Handle search
  const handleSearch = async (query: string) => {
    if (!query.trim()) {
      loadDirectory(currentPath);
      return;
    }

    setIsLoading(true);
    try {
      const results = await api.search(query);

      // Convert search results to listing format
      setListing({
        dirs: results.filter((r) => r.dir).map((r) => ({
          ...r,
          at: r.ts,
          mt: r.ts,
          dir: true,
        })) as FileEntry[],
        files: results.filter((r) => !r.dir).map((r) => ({
          ...r,
          at: r.ts,
          mt: r.ts,
        })) as FileEntry[],
        vpath: 'Search results',
      });
    } catch (err: any) {
      setError(err.message || 'Failed to search');
    } finally {
      setIsLoading(false);
    }
  };

  // Configuration screen
  if (!isConfigured) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full">
          <h1 className="text-2xl font-bold mb-6">Configure CopyParty</h1>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (serverUrl) {
                localStorage.setItem('copyparty_url', serverUrl);
                setAPIConfig({ baseUrl: serverUrl });
                setIsConfigured(true);
              }
            }}
          >
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                CopyParty Server URL
              </label>
              <input
                type="url"
                value={serverUrl}
                onChange={(e) => setServerUrl(e.target.value)}
                placeholder="http://localhost:3923"
                className="w-full border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
              <p className="text-sm text-gray-500 mt-2">
                Enter the URL of your CopyParty server
              </p>
            </div>
            <button
              type="submit"
              className="w-full px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              Connect
            </button>
          </form>
        </div>
      </div>
    );
  }

  // Get all files for display
  const allFiles = [
    ...(listing?.dirs || []),
    ...(listing?.files || []),
  ];

  // Get breadcrumbs
  const breadcrumbs = currentPath
    .split('/')
    .filter(Boolean)
    .reduce((acc, part, index, arr) => {
      const path = '/' + arr.slice(0, index + 1).join('/');
      acc.push({ name: part, path });
      return acc;
    }, [] as { name: string; path: string }[]);

  const selectedFileNames = Array.from(selectedFiles)
    .map((href) => allFiles.find((f) => f.href === href)?.name || href)
    .filter(Boolean);

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar currentPath={currentPath} onNavigate={loadDirectory} tree={tree} />

      <div className="flex-1 flex flex-col overflow-hidden">
        <Toolbar
          onUpload={() => setShowUploadModal(true)}
          onCreateFolder={() => setShowCreateFolderModal(true)}
          onDownload={handleDownload}
          onDelete={() => setShowDeleteModal(true)}
          onShare={() => setShowShareModal(true)}
          onRefresh={() => loadDirectory(currentPath)}
          onSearch={handleSearch}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          hasSelection={selectedFiles.size > 0}
          canWrite={true}
        />

        {/* Breadcrumb */}
        <div className="px-4 py-2 bg-white border-b flex items-center space-x-2 text-sm">
          <button
            onClick={() => loadDirectory('/')}
            className="flex items-center space-x-1 text-gray-600 hover:text-blue-600 transition-colors"
          >
            <HomeIcon size={16} />
          </button>
          {breadcrumbs.map((crumb, index) => (
            <div key={index} className="flex items-center space-x-2">
              <ChevronRight size={16} className="text-gray-400" />
              <button
                onClick={() => loadDirectory(crumb.path)}
                className="text-gray-600 hover:text-blue-600 transition-colors"
              >
                {crumb.name}
              </button>
            </div>
          ))}
        </div>

        {/* Error banner */}
        {error && (
          <div className="mx-4 mt-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center justify-between">
            <span className="text-red-800">{error}</span>
            <button
              onClick={() => setError(null)}
              className="text-red-600 hover:text-red-800"
            >
              ✕
            </button>
          </div>
        )}

        {/* File list */}
        <div className="flex-1 overflow-hidden">
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <Loader2 className="animate-spin text-blue-500" size={48} />
            </div>
          ) : allFiles.length === 0 ? (
            <div className="flex items-center justify-center h-full text-gray-500">
              This folder is empty
            </div>
          ) : (
            <FileList
              files={allFiles}
              onFileClick={handleFileClick}
              onFileDoubleClick={handleFileDoubleClick}
              selectedFiles={selectedFiles}
              onSelectionChange={setSelectedFiles}
              viewMode={viewMode}
            />
          )}
        </div>
      </div>

      {/* Modals */}
      <UploadModal
        isOpen={showUploadModal}
        onClose={() => setShowUploadModal(false)}
        onUpload={handleUpload}
      />

      <CreateFolderModal
        isOpen={showCreateFolderModal}
        onClose={() => setShowCreateFolderModal(false)}
        onCreate={handleCreateFolder}
      />

      <ShareModal
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
        fileName={selectedFileNames[0] || ''}
        onShare={handleShare}
      />

      <DeleteConfirmModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        fileNames={selectedFileNames}
        onConfirm={handleDelete}
      />
    </div>
  );
}
