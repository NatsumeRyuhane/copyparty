// Utility functions

import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Merge Tailwind CSS classes
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format file size to human-readable string
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';

  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB', 'PB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}

/**
 * Format Unix timestamp to human-readable date
 */
export function formatDate(timestamp: number): string {
  const date = new Date(timestamp * 1000);
  const now = new Date();
  const diff = now.getTime() - date.getTime();

  // Less than 24 hours ago
  if (diff < 86400000) {
    const hours = Math.floor(diff / 3600000);
    if (hours < 1) {
      const minutes = Math.floor(diff / 60000);
      return `${minutes} minute${minutes !== 1 ? 's' : ''} ago`;
    }
    return `${hours} hour${hours !== 1 ? 's' : ''} ago`;
  }

  // Less than 7 days ago
  if (diff < 604800000) {
    const days = Math.floor(diff / 86400000);
    return `${days} day${days !== 1 ? 's' : ''} ago`;
  }

  // Format as date
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
  });
}

/**
 * Get file extension from filename
 */
export function getFileExtension(filename: string): string {
  const parts = filename.split('.');
  return parts.length > 1 ? parts[parts.length - 1].toLowerCase() : '';
}

/**
 * Get file icon type based on extension
 */
export function getFileType(filename: string): string {
  const ext = getFileExtension(filename);

  const imageExts = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'svg', 'webp', 'ico'];
  const videoExts = ['mp4', 'avi', 'mov', 'wmv', 'flv', 'mkv', 'webm'];
  const audioExts = ['mp3', 'wav', 'ogg', 'flac', 'm4a', 'aac', 'wma'];
  const docExts = ['pdf', 'doc', 'docx', 'txt', 'rtf', 'odt'];
  const codeExts = ['js', 'ts', 'tsx', 'jsx', 'py', 'java', 'cpp', 'c', 'h', 'cs', 'php', 'rb', 'go', 'rs', 'swift'];
  const archiveExts = ['zip', 'rar', '7z', 'tar', 'gz', 'bz2', 'xz'];
  const sheetExts = ['xls', 'xlsx', 'csv', 'ods'];
  const presentationExts = ['ppt', 'pptx', 'odp'];

  if (imageExts.includes(ext)) return 'image';
  if (videoExts.includes(ext)) return 'video';
  if (audioExts.includes(ext)) return 'audio';
  if (docExts.includes(ext)) return 'document';
  if (codeExts.includes(ext)) return 'code';
  if (archiveExts.includes(ext)) return 'archive';
  if (sheetExts.includes(ext)) return 'spreadsheet';
  if (presentationExts.includes(ext)) return 'presentation';

  return 'file';
}

/**
 * Check if file is an image
 */
export function isImage(filename: string): boolean {
  return getFileType(filename) === 'image';
}

/**
 * Check if file is a video
 */
export function isVideo(filename: string): boolean {
  return getFileType(filename) === 'video';
}

/**
 * Join path segments
 */
export function joinPath(...segments: string[]): string {
  return segments
    .filter(Boolean)
    .join('/')
    .replace(/\/+/g, '/')
    .replace(/\/$/, '') || '/';
}

/**
 * Get parent path
 */
export function getParentPath(path: string): string {
  if (path === '/' || !path) return '/';
  const segments = path.split('/').filter(Boolean);
  segments.pop();
  return '/' + segments.join('/');
}

/**
 * Get filename from path
 */
export function getFilename(path: string): string {
  const segments = path.split('/').filter(Boolean);
  return segments[segments.length - 1] || '';
}

/**
 * Parse breadcrumb from path
 */
export function parseBreadcrumb(path: string): Array<{ name: string; path: string }> {
  const segments = path.split('/').filter(Boolean);
  const breadcrumb = [{ name: 'Home', path: '/' }];

  let currentPath = '';
  segments.forEach((segment) => {
    currentPath += '/' + segment;
    breadcrumb.push({
      name: segment,
      path: currentPath,
    });
  });

  return breadcrumb;
}

/**
 * Download file from URL
 */
export function downloadFile(url: string, filename: string) {
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Copy text to clipboard
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (error) {
    console.error('Failed to copy to clipboard:', error);
    return false;
  }
}
