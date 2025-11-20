// API client for copyparty backend

import axios, { AxiosInstance, AxiosProgressEvent } from 'axios';
import {
  FileEntry,
  DirectoryListing,
  TreeNode,
  SearchResult,
  ShareRequest,
  ShareInfo,
  UploadProgress,
  CopyPartyConfig,
} from './types';

export class CopyPartyAPI {
  private client: AxiosInstance;
  private baseUrl: string;
  private password?: string;

  constructor(config: CopyPartyConfig) {
    this.baseUrl = config.baseUrl.replace(/\/$/, ''); // remove trailing slash
    this.password = config.password;

    this.client = axios.create({
      baseURL: this.baseUrl,
      withCredentials: true, // for cookie-based auth
      headers: {
        'X-Requested-With': 'XMLHttpRequest',
      },
    });

    // Add password to requests if provided
    if (this.password) {
      this.client.interceptors.request.use((config) => {
        if (config.url && !config.url.includes('pw=')) {
          const separator = config.url.includes('?') ? '&' : '?';
          config.url += `${separator}pw=${encodeURIComponent(this.password!)}`;
        }
        return config;
      });
    }
  }

  /**
   * Login to copyparty
   */
  async login(username: string, password: string): Promise<void> {
    const formData = new FormData();
    formData.append('act', 'login');
    formData.append('uname', username);
    formData.append('cppwd', password);

    await this.client.post('/', formData);
    this.password = password;
  }

  /**
   * Logout from copyparty
   */
  async logout(): Promise<void> {
    const formData = new FormData();
    formData.append('act', 'logout');
    await this.client.post('/', formData);
    this.password = undefined;
  }

  /**
   * List directory contents
   */
  async listDirectory(path: string = '/'): Promise<DirectoryListing> {
    const encodedPath = this.encodePath(path);
    const response = await this.client.get(`${encodedPath}?ls`);

    // Parse the directory listing response
    const data = response.data;

    return {
      dirs: data.dirs || [],
      files: data.files || [],
      vpath: data.vpath || path,
    };
  }

  /**
   * Get directory tree
   */
  async getTree(path: string = '/'): Promise<TreeNode[]> {
    const encodedPath = this.encodePath(path);
    const response = await this.client.get(`${encodedPath}?tree`);
    return response.data;
  }

  /**
   * Search for files
   */
  async search(query: string, maxResults: number = 100): Promise<SearchResult[]> {
    const response = await this.client.post(
      '/?srch',
      JSON.stringify({ q: query, n: maxResults }),
      {
        headers: {
          'Content-Type': 'text/plain',
        },
      }
    );
    return response.data;
  }

  /**
   * Upload file
   */
  async uploadFile(
    path: string,
    file: File,
    onProgress?: (progress: UploadProgress) => void
  ): Promise<void> {
    const encodedPath = this.encodePath(path);
    const formData = new FormData();
    formData.append('act', 'bput');
    formData.append('f', file);

    await this.client.post(encodedPath, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (progressEvent: AxiosProgressEvent) => {
        if (onProgress && progressEvent.total) {
          onProgress({
            loaded: progressEvent.loaded,
            total: progressEvent.total,
            percentage: Math.round((progressEvent.loaded * 100) / progressEvent.total),
          });
        }
      },
    });
  }

  /**
   * Upload multiple files
   */
  async uploadFiles(
    path: string,
    files: File[],
    onProgress?: (progress: UploadProgress) => void
  ): Promise<void> {
    for (const file of files) {
      await this.uploadFile(path, file, onProgress);
    }
  }

  /**
   * Download file
   */
  async downloadFile(path: string): Promise<Blob> {
    const encodedPath = this.encodePath(path);
    const response = await this.client.get(encodedPath, {
      responseType: 'blob',
    });
    return response.data;
  }

  /**
   * Get file URL for direct access
   */
  getFileUrl(path: string): string {
    return `${this.baseUrl}${this.encodePath(path)}`;
  }

  /**
   * Create directory
   */
  async createDirectory(path: string, name: string): Promise<void> {
    const encodedPath = this.encodePath(path);
    const formData = new FormData();
    formData.append('act', 'mkdir');
    formData.append('name', name);

    await this.client.post(encodedPath, formData);
  }

  /**
   * Delete files
   */
  async deleteFiles(paths: string[]): Promise<void> {
    const response = await this.client.post(
      '/?delete',
      JSON.stringify(paths),
      {
        headers: {
          'Content-Type': 'text/plain',
        },
      }
    );
    return response.data;
  }

  /**
   * Rename/move file
   */
  async moveFile(sourcePath: string, destinationPath: string): Promise<void> {
    const encodedSource = this.encodePath(sourcePath);
    const encodedDest = encodeURIComponent(destinationPath);

    await this.client.post(`${encodedSource}?move=${encodedDest}`);
  }

  /**
   * Copy file
   */
  async copyFile(sourcePath: string, destinationPath: string): Promise<void> {
    const encodedSource = this.encodePath(sourcePath);
    const encodedDest = encodeURIComponent(destinationPath);

    await this.client.post(`${encodedSource}?copy=${encodedDest}`);
  }

  /**
   * Create file share
   */
  async createShare(request: ShareRequest): Promise<ShareInfo> {
    const response = await this.client.post(
      '/?share',
      JSON.stringify(request),
      {
        headers: {
          'Content-Type': 'text/plain',
        },
      }
    );
    return response.data;
  }

  /**
   * List shares
   */
  async listShares(): Promise<ShareInfo[]> {
    const response = await this.client.get('/?shares');
    return response.data;
  }

  /**
   * Delete share
   */
  async deleteShare(shareKey: string): Promise<void> {
    await this.client.post(`/?eshare=rm&skey=${encodeURIComponent(shareKey)}`);
  }

  /**
   * Download folder as ZIP
   */
  async downloadAsZip(paths: string[]): Promise<Blob> {
    const formData = new FormData();
    formData.append('act', 'zip');
    paths.forEach(path => {
      formData.append('files', path);
    });

    const response = await this.client.post('/', formData, {
      responseType: 'blob',
    });
    return response.data;
  }

  /**
   * Download folder as TAR
   */
  async downloadAsTar(paths: string[]): Promise<Blob> {
    const formData = new FormData();
    formData.append('act', 'tar');
    paths.forEach(path => {
      formData.append('files', path);
    });

    const response = await this.client.post('/', formData, {
      responseType: 'blob',
    });
    return response.data;
  }

  /**
   * Helper: Encode path for URL
   */
  private encodePath(path: string): string {
    // Ensure path starts with /
    if (!path.startsWith('/')) {
      path = '/' + path;
    }

    // Split path and encode each segment
    const segments = path.split('/').filter(Boolean);
    const encoded = segments.map(s => encodeURIComponent(s)).join('/');

    return '/' + encoded;
  }

  /**
   * Helper: Decode path from URL
   */
  decodePath(path: string): string {
    const segments = path.split('/').filter(Boolean);
    return '/' + segments.map(s => decodeURIComponent(s)).join('/');
  }
}

// Create singleton instance that can be configured
let apiInstance: CopyPartyAPI | null = null;

export function getAPI(): CopyPartyAPI {
  if (!apiInstance) {
    // Default configuration - can be overridden
    const baseUrl = typeof window !== 'undefined'
      ? (localStorage.getItem('copyparty_url') || window.location.origin)
      : 'http://localhost:3923';

    apiInstance = new CopyPartyAPI({ baseUrl });
  }
  return apiInstance;
}

export function setAPIConfig(config: CopyPartyConfig): void {
  apiInstance = new CopyPartyAPI(config);
  if (typeof window !== 'undefined' && config.baseUrl) {
    localStorage.setItem('copyparty_url', config.baseUrl);
  }
}
