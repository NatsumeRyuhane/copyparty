'use client';

import { useState, useEffect } from 'react';
import { ChevronRight, ChevronDown, Home, Clock, Star, Trash2, Users } from 'lucide-react';
import { TreeNode } from '@/lib/types';
import { cn } from '@/lib/utils';
import FileIcon from './FileIcon';

interface SidebarProps {
  currentPath: string;
  onNavigate: (path: string) => void;
  tree: TreeNode[];
}

export default function Sidebar({ currentPath, onNavigate, tree }: SidebarProps) {
  return (
    <div className="w-64 bg-white border-r flex flex-col h-full">
      <div className="p-4">
        <h1 className="text-xl font-bold text-gray-800">CopyParty</h1>
      </div>

      <div className="flex-1 overflow-y-auto">
        {/* Quick access */}
        <div className="px-2 py-2">
          <SidebarItem
            icon={<Home size={18} />}
            label="Home"
            active={currentPath === '/'}
            onClick={() => onNavigate('/')}
          />
          <SidebarItem
            icon={<Clock size={18} />}
            label="Recent"
            active={false}
            onClick={() => {}}
          />
          <SidebarItem
            icon={<Star size={18} />}
            label="Starred"
            active={false}
            onClick={() => {}}
          />
          <SidebarItem
            icon={<Users size={18} />}
            label="Shared"
            active={false}
            onClick={() => {}}
          />
        </div>

        <div className="border-t my-2" />

        {/* Folder tree */}
        <div className="px-2 py-2">
          <div className="text-xs font-medium text-gray-500 px-3 mb-2">FOLDERS</div>
          {tree.map((node) => (
            <TreeNodeItem
              key={node.href}
              node={node}
              level={0}
              currentPath={currentPath}
              onNavigate={onNavigate}
            />
          ))}
        </div>
      </div>

      {/* Storage info */}
      <div className="border-t p-4">
        <div className="text-xs text-gray-500">Storage</div>
        <div className="mt-2">
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div className="bg-blue-500 h-2 rounded-full" style={{ width: '45%' }} />
          </div>
          <div className="text-xs text-gray-600 mt-1">45% of storage used</div>
        </div>
      </div>
    </div>
  );
}

interface SidebarItemProps {
  icon: React.ReactNode;
  label: string;
  active: boolean;
  onClick: () => void;
}

function SidebarItem({ icon, label, active, onClick }: SidebarItemProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'w-full flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors',
        active
          ? 'bg-blue-50 text-blue-600'
          : 'hover:bg-gray-100 text-gray-700'
      )}
    >
      {icon}
      <span className="text-sm font-medium">{label}</span>
    </button>
  );
}

interface TreeNodeItemProps {
  node: TreeNode;
  level: number;
  currentPath: string;
  onNavigate: (path: string) => void;
}

function TreeNodeItem({ node, level, currentPath, onNavigate }: TreeNodeItemProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const hasChildren = node.children && node.children.length > 0;
  const isActive = currentPath === node.href;

  useEffect(() => {
    // Auto-expand if this path is in the current path
    if (currentPath.startsWith(node.href) && node.href !== '/') {
      setIsExpanded(true);
    }
  }, [currentPath, node.href]);

  return (
    <div>
      <button
        onClick={() => {
          if (hasChildren) {
            setIsExpanded(!isExpanded);
          }
          onNavigate(node.href);
        }}
        className={cn(
          'w-full flex items-center space-x-2 px-3 py-1.5 rounded-lg transition-colors text-sm',
          isActive
            ? 'bg-blue-50 text-blue-600'
            : 'hover:bg-gray-100 text-gray-700'
        )}
        style={{ paddingLeft: `${12 + level * 16}px` }}
      >
        {hasChildren && (
          <span className="flex-shrink-0">
            {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
          </span>
        )}
        {!hasChildren && <span className="w-3.5" />}
        <FileIcon
          filename={node.name}
          isDir={true}
          isOpen={isExpanded}
          className="flex-shrink-0"
        />
        <span className="truncate">{node.name}</span>
      </button>

      {hasChildren && isExpanded && (
        <div>
          {node.children!.map((child) => (
            <TreeNodeItem
              key={child.href}
              node={child}
              level={level + 1}
              currentPath={currentPath}
              onNavigate={onNavigate}
            />
          ))}
        </div>
      )}
    </div>
  );
}
