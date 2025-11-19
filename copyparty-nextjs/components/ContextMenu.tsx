'use client';

import { useEffect, useRef } from 'react';
import {
  Download,
  Share2,
  Copy,
  Scissors,
  Trash2,
  Edit3,
  Star,
  Info,
} from 'lucide-react';
import { FileItem } from '@/types';

interface ContextMenuProps {
  item: FileItem | null;
  position: { x: number; y: number };
  onClose: () => void;
  onDownload: (item: FileItem) => void;
  onShare: (item: FileItem) => void;
  onCopy: (item: FileItem) => void;
  onCut: (item: FileItem) => void;
  onRename: (item: FileItem) => void;
  onDelete: (item: FileItem) => void;
  onInfo: (item: FileItem) => void;
}

export default function ContextMenu({
  item,
  position,
  onClose,
  onDownload,
  onShare,
  onCopy,
  onCut,
  onRename,
  onDelete,
  onInfo,
}: ContextMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [onClose]);

  if (!item) return null;

  const menuItems = [
    {
      icon: Download,
      label: 'Download',
      onClick: () => {
        onDownload(item);
        onClose();
      },
      show: !item.is_dir,
    },
    {
      icon: Share2,
      label: 'Share',
      onClick: () => {
        onShare(item);
        onClose();
      },
      show: true,
    },
    {
      icon: Copy,
      label: 'Copy',
      onClick: () => {
        onCopy(item);
        onClose();
      },
      show: true,
    },
    {
      icon: Scissors,
      label: 'Cut',
      onClick: () => {
        onCut(item);
        onClose();
      },
      show: true,
    },
    {
      icon: Edit3,
      label: 'Rename',
      onClick: () => {
        onRename(item);
        onClose();
      },
      show: true,
    },
    {
      icon: Star,
      label: 'Add to starred',
      onClick: () => {
        onClose();
      },
      show: true,
    },
    {
      icon: Info,
      label: 'Details',
      onClick: () => {
        onInfo(item);
        onClose();
      },
      show: true,
    },
    {
      icon: Trash2,
      label: 'Delete',
      onClick: () => {
        onDelete(item);
        onClose();
      },
      show: true,
      danger: true,
    },
  ].filter((item) => item.show);

  return (
    <div
      ref={menuRef}
      className="fixed z-50 bg-white rounded-lg shadow-xl border border-gray-200 py-2 min-w-[200px]"
      style={{
        top: `${position.y}px`,
        left: `${position.x}px`,
      }}
    >
      {menuItems.map((menuItem, index) => {
        const Icon = menuItem.icon;
        return (
          <button
            key={index}
            onClick={menuItem.onClick}
            className={`w-full flex items-center gap-3 px-4 py-2 text-sm transition-colors text-left ${
              menuItem.danger
                ? 'text-red-600 hover:bg-red-50'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            <Icon className="w-4 h-4" />
            <span>{menuItem.label}</span>
          </button>
        );
      })}
    </div>
  );
}
