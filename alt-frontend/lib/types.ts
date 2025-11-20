// Type definitions for copyparty API

export interface FileEntry {
  href: string;
  name: string;
  size: number;
  ts: number; // timestamp
  at: number; // access time
  mt: number; // modification time
  dir?: boolean; // is directory
  tags?: Record<string, any>; // music tags, etc.
}

export interface DirectoryListing {
  dirs: FileEntry[];
  files: FileEntry[];
  vpath: string; // current virtual path
}

export interface TreeNode {
  name: string;
  href: string;
  children?: TreeNode[];
}

export interface SearchResult {
  href: string;
  name: string;
  size: number;
  ts: number;
  dir?: boolean;
}

export interface ShareRequest {
  k: string; // share key
  vp: string[]; // virtual paths
  perms?: string[]; // permissions: read, write, move, delete
  exp?: number; // expiration in minutes
  pw?: string; // optional password
}

export interface ShareInfo {
  k: string;
  vp: string;
  pr: string; // permissions
  nf: number; // number of files
  un: string; // username
  t0: number; // creation timestamp
  t1: number; // expiry timestamp
  pw?: boolean; // has password
}

export interface UploadProgress {
  loaded: number;
  total: number;
  percentage: number;
}

export interface CopyPartyConfig {
  baseUrl: string;
  username?: string;
  password?: string;
}
