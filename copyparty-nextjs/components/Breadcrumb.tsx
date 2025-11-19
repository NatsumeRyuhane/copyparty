'use client';

import { ChevronRight, Home } from 'lucide-react';
import { parseBreadcrumb } from '@/lib/utils';

interface BreadcrumbProps {
  path: string;
  onNavigate: (path: string) => void;
}

export default function Breadcrumb({ path, onNavigate }: BreadcrumbProps) {
  const breadcrumb = parseBreadcrumb(path);

  return (
    <nav className="flex items-center gap-2 px-6 py-4 bg-white border-b border-gray-200">
      {breadcrumb.map((item, index) => (
        <div key={item.path} className="flex items-center gap-2">
          {index > 0 && <ChevronRight className="w-4 h-4 text-gray-400" />}
          <button
            onClick={() => onNavigate(item.path)}
            className={`flex items-center gap-1 px-2 py-1 rounded-md transition-colors ${
              index === breadcrumb.length - 1
                ? 'text-gray-900 font-medium'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            {index === 0 && <Home className="w-4 h-4" />}
            <span>{item.name}</span>
          </button>
        </div>
      ))}
    </nav>
  );
}
