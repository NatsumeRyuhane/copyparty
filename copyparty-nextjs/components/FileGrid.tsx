'use client';

import { FileItem } from '@/types';
import {
  Folder,
  FileText,
  Image as ImageIcon,
  Video,
  Music,
  FileArchive,
  FileCode,
  File,
  MoreVertical,
} from 'lucide-react';
import { formatFileSize, formatDate, getFileType } from '@/lib/utils';
import { useState } from 'react';

interface FileGridProps {
  items: FileItem[];
  onItemClick: (item: FileItem) => void;
  onItemContextMenu: (item: FileItem, event: React.MouseEvent) => void;
}

function getFileIcon(item: FileItem) {
  if (item.is_dir) {
    return <Folder className="w-8 h-8 text-blue-500" />;
  }

  const type = getFileType(item.name);

  switch (type) {
    case 'image':
      return <ImageIcon className="w-8 h-8 text-green-500" />;
    case 'video':
      return <Video className="w-8 h-8 text-purple-500" />;
    case 'audio':
      return <Music className="w-8 h-8 text-pink-500" />;
    case 'archive':
      return <FileArchive className="w-8 h-8 text-orange-500" />;
    case 'code':
      return <FileCode className="w-8 h-8 text-blue-600" />;
    case 'document':
      return <FileText className="w-8 h-8 text-red-500" />;
    default:
      return <File className="w-8 h-8 text-gray-500" />;
  }
}

function FileCard({
  item,
  onClick,
  onContextMenu,
}: {
  item: FileItem;
  onClick: () => void;
  onContextMenu: (e: React.MouseEvent) => void;
}) {
  const [showMenu, setShowMenu] = useState(false);

  return (
    <div
      className="group relative flex flex-col items-center p-4 rounded-lg border border-gray-200 hover:border-blue-400 hover:bg-blue-50/50 transition-all cursor-pointer"
      onClick={onClick}
      onContextMenu={onContextMenu}
    >
      {/* Icon/Thumbnail */}
      <div className="mb-3 relative">
        {getFileIcon(item)}
      </div>

      {/* File name */}
      <div className="w-full text-center">
        <p className="text-sm font-medium text-gray-900 truncate px-1">
          {item.name}
        </p>
        {!item.is_dir && (
          <p className="text-xs text-gray-500 mt-1">
            {formatFileSize(item.sz)} · {formatDate(item.mt)}
          </p>
        )}
      </div>

      {/* More options button */}
      <button
        className="absolute top-2 right-2 p-1 rounded-md opacity-0 group-hover:opacity-100 hover:bg-white/80 transition-opacity"
        onClick={(e) => {
          e.stopPropagation();
          setShowMenu(!showMenu);
        }}
      >
        <MoreVertical className="w-4 h-4 text-gray-600" />
      </button>
    </div>
  );
}

export default function FileGrid({
  items,
  onItemClick,
  onItemContextMenu,
}: FileGridProps) {
  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Folder className="w-16 h-16 text-gray-300 mb-4" />
        <p className="text-gray-500 text-lg">This folder is empty</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 p-6">
      {items.map((item) => (
        <FileCard
          key={item.href}
          item={item}
          onClick={() => onItemClick(item)}
          onContextMenu={(e) => onItemContextMenu(item, e)}
        />
      ))}
    </div>
  );
}
