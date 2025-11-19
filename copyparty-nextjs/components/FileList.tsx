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

interface FileListProps {
  items: FileItem[];
  onItemClick: (item: FileItem) => void;
  onItemContextMenu: (item: FileItem, event: React.MouseEvent) => void;
}

function getFileIcon(item: FileItem) {
  if (item.is_dir) {
    return <Folder className="w-5 h-5 text-blue-500" />;
  }

  const type = getFileType(item.name);

  switch (type) {
    case 'image':
      return <ImageIcon className="w-5 h-5 text-green-500" />;
    case 'video':
      return <Video className="w-5 h-5 text-purple-500" />;
    case 'audio':
      return <Music className="w-5 h-5 text-pink-500" />;
    case 'archive':
      return <FileArchive className="w-5 h-5 text-orange-500" />;
    case 'code':
      return <FileCode className="w-5 h-5 text-blue-600" />;
    case 'document':
      return <FileText className="w-5 h-5 text-red-500" />;
    default:
      return <File className="w-5 h-5 text-gray-500" />;
  }
}

export default function FileList({
  items,
  onItemClick,
  onItemContextMenu,
}: FileListProps) {
  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Folder className="w-16 h-16 text-gray-300 mb-4" />
        <p className="text-gray-500 text-lg">This folder is empty</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead className="bg-gray-50 border-b border-gray-200">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Name
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Size
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Modified
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-16">
              <span className="sr-only">Actions</span>
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {items.map((item) => (
            <tr
              key={item.href}
              className="hover:bg-gray-50 cursor-pointer group transition-colors"
              onClick={() => onItemClick(item)}
              onContextMenu={(e) => onItemContextMenu(item, e)}
            >
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center gap-3">
                  {getFileIcon(item)}
                  <span className="text-sm font-medium text-gray-900">
                    {item.name}
                  </span>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {item.is_dir ? '—' : formatFileSize(item.sz)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {formatDate(item.mt)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                <button
                  className="p-1 rounded-md opacity-0 group-hover:opacity-100 hover:bg-gray-200 transition-opacity"
                  onClick={(e) => {
                    e.stopPropagation();
                    onItemContextMenu(item, e);
                  }}
                >
                  <MoreVertical className="w-4 h-4 text-gray-600" />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
