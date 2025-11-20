'use client';

import { useState } from 'react';
import {
  Search,
  Upload,
  FolderPlus,
  Download,
  Trash2,
  Share2,
  LayoutGrid,
  List,
  RefreshCw,
  Settings,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface ToolbarProps {
  onUpload: () => void;
  onCreateFolder: () => void;
  onDownload: () => void;
  onDelete: () => void;
  onShare: () => void;
  onRefresh: () => void;
  onSearch: (query: string) => void;
  viewMode: 'grid' | 'list';
  onViewModeChange: (mode: 'grid' | 'list') => void;
  hasSelection: boolean;
  canWrite: boolean;
}

export default function Toolbar({
  onUpload,
  onCreateFolder,
  onDownload,
  onDelete,
  onShare,
  onRefresh,
  onSearch,
  viewMode,
  onViewModeChange,
  hasSelection,
  canWrite,
}: ToolbarProps) {
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(searchQuery);
  };

  return (
    <div className="flex items-center justify-between px-4 py-3 bg-white border-b">
      {/* Left side - Actions */}
      <div className="flex items-center space-x-2">
        {canWrite && (
          <>
            <ToolbarButton
              icon={<Upload size={18} />}
              label="Upload"
              onClick={onUpload}
            />
            <ToolbarButton
              icon={<FolderPlus size={18} />}
              label="New Folder"
              onClick={onCreateFolder}
            />
          </>
        )}

        {hasSelection && (
          <>
            <div className="w-px h-6 bg-gray-300 mx-2" />
            <ToolbarButton
              icon={<Download size={18} />}
              label="Download"
              onClick={onDownload}
            />
            <ToolbarButton
              icon={<Share2 size={18} />}
              label="Share"
              onClick={onShare}
            />
            {canWrite && (
              <ToolbarButton
                icon={<Trash2 size={18} />}
                label="Delete"
                onClick={onDelete}
                className="text-red-600 hover:bg-red-50"
              />
            )}
          </>
        )}

        <div className="w-px h-6 bg-gray-300 mx-2" />
        <ToolbarButton
          icon={<RefreshCw size={18} />}
          label="Refresh"
          onClick={onRefresh}
        />
      </div>

      {/* Center - Search */}
      <div className="flex-1 max-w-2xl mx-4">
        <form onSubmit={handleSearch}>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Search files and folders..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </form>
      </div>

      {/* Right side - View options */}
      <div className="flex items-center space-x-2">
        <div className="flex items-center bg-gray-100 rounded-lg p-1">
          <button
            onClick={() => onViewModeChange('list')}
            className={cn(
              'p-2 rounded',
              viewMode === 'list' ? 'bg-white shadow-sm' : 'hover:bg-gray-200'
            )}
          >
            <List size={18} />
          </button>
          <button
            onClick={() => onViewModeChange('grid')}
            className={cn(
              'p-2 rounded',
              viewMode === 'grid' ? 'bg-white shadow-sm' : 'hover:bg-gray-200'
            )}
          >
            <LayoutGrid size={18} />
          </button>
        </div>

        <ToolbarButton
          icon={<Settings size={18} />}
          label="Settings"
          onClick={() => {}}
        />
      </div>
    </div>
  );
}

interface ToolbarButtonProps {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  className?: string;
}

function ToolbarButton({ icon, label, onClick, className = '' }: ToolbarButtonProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'flex items-center space-x-2 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors',
        className
      )}
      title={label}
    >
      {icon}
      <span className="hidden md:inline text-sm">{label}</span>
    </button>
  );
}
