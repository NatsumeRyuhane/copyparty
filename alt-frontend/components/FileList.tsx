'use client';

import { useState } from 'react';
import { FileEntry } from '@/lib/types';
import { formatFileSize, formatDate, cn } from '@/lib/utils';
import FileIcon from './FileIcon';
import {
  MoreVertical,
  Download,
  Trash2,
  Edit3,
  Share2,
  Copy,
  Scissors,
} from 'lucide-react';

interface FileListProps {
  files: FileEntry[];
  onFileClick: (file: FileEntry) => void;
  onFileDoubleClick: (file: FileEntry) => void;
  selectedFiles: Set<string>;
  onSelectionChange: (files: Set<string>) => void;
  viewMode?: 'grid' | 'list';
}

export default function FileList({
  files,
  onFileClick,
  onFileDoubleClick,
  selectedFiles,
  onSelectionChange,
  viewMode = 'list',
}: FileListProps) {
  const [contextMenu, setContextMenu] = useState<{
    x: number;
    y: number;
    file: FileEntry;
  } | null>(null);

  const handleClick = (file: FileEntry, event: React.MouseEvent) => {
    if (event.ctrlKey || event.metaKey) {
      // Multi-select with Ctrl/Cmd
      const newSelection = new Set(selectedFiles);
      if (newSelection.has(file.href)) {
        newSelection.delete(file.href);
      } else {
        newSelection.add(file.href);
      }
      onSelectionChange(newSelection);
    } else {
      onSelectionChange(new Set([file.href]));
    }
    onFileClick(file);
  };

  const handleDoubleClick = (file: FileEntry) => {
    onFileDoubleClick(file);
  };

  const handleContextMenu = (file: FileEntry, event: React.MouseEvent) => {
    event.preventDefault();
    setContextMenu({ x: event.clientX, y: event.clientY, file });
  };

  const closeContextMenu = () => {
    setContextMenu(null);
  };

  if (viewMode === 'grid') {
    return (
      <div className="p-4">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-4">
          {files.map((file) => (
            <div
              key={file.href}
              className={cn(
                'flex flex-col items-center p-3 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors',
                selectedFiles.has(file.href) && 'bg-blue-50 hover:bg-blue-100'
              )}
              onClick={(e) => handleClick(file, e)}
              onDoubleClick={() => handleDoubleClick(file)}
              onContextMenu={(e) => handleContextMenu(file, e)}
            >
              <FileIcon
                filename={file.name}
                isDir={!!file.dir}
                className={cn(
                  'mb-2',
                  file.dir ? 'text-blue-500' : 'text-gray-600'
                )}
              />
              <div className="text-sm text-center break-words w-full line-clamp-2">
                {file.name}
              </div>
              {!file.dir && (
                <div className="text-xs text-gray-500 mt-1">
                  {formatFileSize(file.size)}
                </div>
              )}
            </div>
          ))}
        </div>
        {contextMenu && (
          <ContextMenu
            x={contextMenu.x}
            y={contextMenu.y}
            file={contextMenu.file}
            onClose={closeContextMenu}
          />
        )}
      </div>
    );
  }

  // List view
  return (
    <div className="flex flex-col">
      {/* Header */}
      <div className="grid grid-cols-12 gap-4 px-4 py-2 bg-gray-50 border-b text-sm font-medium text-gray-700">
        <div className="col-span-6">Name</div>
        <div className="col-span-2">Size</div>
        <div className="col-span-3">Modified</div>
        <div className="col-span-1"></div>
      </div>

      {/* File rows */}
      <div className="flex-1 overflow-y-auto">
        {files.map((file) => (
          <div
            key={file.href}
            className={cn(
              'grid grid-cols-12 gap-4 px-4 py-3 border-b cursor-pointer hover:bg-gray-50 transition-colors',
              selectedFiles.has(file.href) && 'bg-blue-50 hover:bg-blue-100'
            )}
            onClick={(e) => handleClick(file, e)}
            onDoubleClick={() => handleDoubleClick(file)}
            onContextMenu={(e) => handleContextMenu(file, e)}
          >
            <div className="col-span-6 flex items-center space-x-3">
              <FileIcon
                filename={file.name}
                isDir={!!file.dir}
                className={file.dir ? 'text-blue-500' : 'text-gray-600'}
              />
              <span className="truncate">{file.name}</span>
            </div>
            <div className="col-span-2 flex items-center text-sm text-gray-600">
              {file.dir ? '—' : formatFileSize(file.size)}
            </div>
            <div className="col-span-3 flex items-center text-sm text-gray-600">
              {formatDate(file.mt || file.ts)}
            </div>
            <div className="col-span-1 flex items-center justify-end">
              <button
                className="p-1 rounded hover:bg-gray-200"
                onClick={(e) => {
                  e.stopPropagation();
                  handleContextMenu(file, e);
                }}
              >
                <MoreVertical size={16} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {contextMenu && (
        <ContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          file={contextMenu.file}
          onClose={closeContextMenu}
        />
      )}
    </div>
  );
}

interface ContextMenuProps {
  x: number;
  y: number;
  file: FileEntry;
  onClose: () => void;
}

function ContextMenu({ x, y, file, onClose }: ContextMenuProps) {
  return (
    <>
      <div
        className="fixed inset-0 z-40"
        onClick={onClose}
      />
      <div
        className="fixed bg-white rounded-lg shadow-lg border py-1 z-50 min-w-[200px]"
        style={{ top: y, left: x }}
      >
        <MenuItem icon={<Download size={16} />} label="Download" onClick={onClose} />
        <MenuItem icon={<Share2 size={16} />} label="Share" onClick={onClose} />
        <MenuItem icon={<Edit3 size={16} />} label="Rename" onClick={onClose} />
        <MenuItem icon={<Copy size={16} />} label="Copy" onClick={onClose} />
        <MenuItem icon={<Scissors size={16} />} label="Cut" onClick={onClose} />
        <div className="border-t my-1" />
        <MenuItem
          icon={<Trash2 size={16} />}
          label="Delete"
          onClick={onClose}
          className="text-red-600 hover:bg-red-50"
        />
      </div>
    </>
  );
}

interface MenuItemProps {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  className?: string;
}

function MenuItem({ icon, label, onClick, className = '' }: MenuItemProps) {
  return (
    <button
      className={cn(
        'w-full flex items-center space-x-3 px-4 py-2 hover:bg-gray-100 transition-colors',
        className
      )}
      onClick={onClick}
    >
      {icon}
      <span>{label}</span>
    </button>
  );
}
