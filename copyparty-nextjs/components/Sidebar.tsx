'use client';

import {
  Home,
  Clock,
  Star,
  Share2,
  Trash2,
  HardDrive,
  ChevronRight,
  X,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface SidebarProps {
  currentPath: string;
  onNavigate: (path: string) => void;
  isOpen: boolean;
  onClose: () => void;
}

const menuItems = [
  { icon: Home, label: 'Home', path: '/', color: 'text-blue-600' },
  { icon: Clock, label: 'Recent', path: '/recent', color: 'text-green-600' },
  { icon: Star, label: 'Starred', path: '/starred', color: 'text-yellow-600' },
  { icon: Share2, label: 'Shared', path: '/shared', color: 'text-purple-600' },
  { icon: Trash2, label: 'Trash', path: '/trash', color: 'text-red-600' },
];

export default function Sidebar({
  currentPath,
  onNavigate,
  isOpen,
  onClose,
}: SidebarProps) {
  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed lg:sticky top-0 left-0 h-screen bg-white border-r border-gray-200 z-50 transition-transform duration-300',
          'w-64 flex flex-col',
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        )}
      >
        {/* Close button for mobile */}
        <div className="lg:hidden flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="font-semibold text-gray-900">Menu</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4 px-3">
          <div className="space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentPath === item.path;

              return (
                <button
                  key={item.path}
                  onClick={() => {
                    onNavigate(item.path);
                    onClose();
                  }}
                  className={cn(
                    'w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors text-left',
                    isActive
                      ? 'bg-blue-50 text-blue-700 font-medium'
                      : 'text-gray-700 hover:bg-gray-100'
                  )}
                >
                  <Icon
                    className={cn('w-5 h-5', isActive ? item.color : 'text-gray-500')}
                  />
                  <span className="flex-1">{item.label}</span>
                  {isActive && <ChevronRight className="w-4 h-4" />}
                </button>
              );
            })}
          </div>

          {/* Storage info */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <div className="px-3">
              <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                <HardDrive className="w-4 h-4" />
                <span>Storage</span>
              </div>
              <div className="bg-gray-200 rounded-full h-2 mb-2">
                <div
                  className="bg-blue-600 h-2 rounded-full"
                  style={{ width: '45%' }}
                />
              </div>
              <p className="text-xs text-gray-500">4.5 GB of 10 GB used</p>
            </div>
          </div>
        </nav>
      </aside>
    </>
  );
}
