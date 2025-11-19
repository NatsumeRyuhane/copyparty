// Types for copyparty API

export interface FileItem {
  name: string;
  href: string;
  ext?: string;
  sz: number; // Size in bytes
  mt: number; // Modified time (Unix timestamp)
  is_dir?: boolean;
  tags?: Record<string, string>; // MP3 tags, etc.
  // Thumbnail/preview info
  th?: string;
}

export interface DirectoryListing {
  dirs: FileItem[];
  files: FileItem[];
  vpath: string; // Virtual path
  rp: string; // Real path
  perm: {
    r?: boolean; // Read
    w?: boolean; // Write
    m?: boolean; // Move
    d?: boolean; // Delete
  };
}

export interface UploadResponse {
  url: string;
  name: string;
  size: number;
  sha512?: string;
}

export interface ShareInfo {
  url: string;
  exp?: number; // Expiration time
  perm: string;
}

export interface SearchResult {
  files: FileItem[];
  total: number;
}

export interface AuthCookie {
  cppwd?: string;
  cppws?: string;
}

export type ViewMode = 'grid' | 'list';
export type SortField = 'name' | 'size' | 'modified';
export type SortOrder = 'asc' | 'desc';

export interface FileOperation {
  type: 'copy' | 'move' | 'delete' | 'rename';
  source: string;
  destination?: string;
}

export interface UploadProgress {
  file: File;
  progress: number;
  status: 'pending' | 'uploading' | 'complete' | 'error';
  error?: string;
}
