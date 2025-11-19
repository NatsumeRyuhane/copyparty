// API client for copyparty backend

import axios, { AxiosInstance } from 'axios';
import {
  DirectoryListing,
  FileItem,
  UploadResponse,
  ShareInfo,
  SearchResult,
} from '@/types';

class CopyPartyAPI {
  private client: AxiosInstance;
  private baseURL: string;

  constructor(baseURL: string = '') {
    this.baseURL = baseURL;
    this.client = axios.create({
      baseURL,
      withCredentials: true, // Include cookies for authentication
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  /**
   * List files and directories at a given path
   */
  async listDirectory(path: string = '/'): Promise<DirectoryListing> {
    try {
      const response = await this.client.get(`${path}?ls`);
      return this.parseDirectoryListing(response.data);
    } catch (error) {
      console.error('Error listing directory:', error);
      throw error;
    }
  }

  /**
   * Get directory tree structure
   */
  async getTree(path: string = '/'): Promise<any> {
    try {
      const response = await this.client.get(`${path}?tree`);
      return response.data;
    } catch (error) {
      console.error('Error getting tree:', error);
      throw error;
    }
  }

  /**
   * Search for files
   */
  async search(query: string, path: string = '/'): Promise<SearchResult> {
    try {
      const response = await this.client.get(`${path}?q=${encodeURIComponent(query)}`);
      return {
        files: response.data.files || [],
        total: response.data.total || 0,
      };
    } catch (error) {
      console.error('Error searching:', error);
      throw error;
    }
  }

  /**
   * Upload a file using multipart form data
   */
  async uploadFile(
    path: string,
    file: File,
    onProgress?: (progress: number) => void
  ): Promise<UploadResponse> {
    const formData = new FormData();
    formData.append('f', file);

    try {
      const response = await this.client.post(`${path}?j`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          if (onProgress && progressEvent.total) {
            const progress = (progressEvent.loaded / progressEvent.total) * 100;
            onProgress(progress);
          }
        },
      });

      return response.data;
    } catch (error) {
      console.error('Error uploading file:', error);
      throw error;
    }
  }

  /**
   * Delete a file or directory
   */
  async deleteFile(path: string): Promise<void> {
    try {
      await this.client.post(`${path}?delete`);
    } catch (error) {
      console.error('Error deleting file:', error);
      throw error;
    }
  }

  /**
   * Copy a file or directory
   */
  async copyFile(source: string, destination: string): Promise<void> {
    try {
      await this.client.post(`${source}?copy=${encodeURIComponent(destination)}`);
    } catch (error) {
      console.error('Error copying file:', error);
      throw error;
    }
  }

  /**
   * Move/rename a file or directory
   */
  async moveFile(source: string, destination: string): Promise<void> {
    try {
      await this.client.post(`${source}?move=${encodeURIComponent(destination)}`);
    } catch (error) {
      console.error('Error moving file:', error);
      throw error;
    }
  }

  /**
   * Create a new directory
   */
  async createDirectory(path: string, name: string): Promise<void> {
    try {
      await this.client.post(`${path}?mkdir`, { name });
    } catch (error) {
      console.error('Error creating directory:', error);
      throw error;
    }
  }

  /**
   * Create a share link
   */
  async createShare(path: string, expiration?: number): Promise<ShareInfo> {
    try {
      const data: any = { path };
      if (expiration) {
        data.eshare = expiration;
      }
      const response = await this.client.post('/?share', data);
      return response.data;
    } catch (error) {
      console.error('Error creating share:', error);
      throw error;
    }
  }

  /**
   * Get recent uploads
   */
  async getRecentUploads(): Promise<FileItem[]> {
    try {
      const response = await this.client.get('/?ru');
      return response.data.files || [];
    } catch (error) {
      console.error('Error getting recent uploads:', error);
      throw error;
    }
  }

  /**
   * Get thumbnail URL for a file
   */
  getThumbnailUrl(path: string): string {
    return `${this.baseURL}${path}?th`;
  }

  /**
   * Get download URL for a file
   */
  getDownloadUrl(path: string): string {
    return `${this.baseURL}${path}?dl`;
  }

  /**
   * Parse directory listing response
   */
  private parseDirectoryListing(data: any): DirectoryListing {
    // The copyparty API returns a specific format
    // We need to parse it into our DirectoryListing type
    const dirs: FileItem[] = [];
    const files: FileItem[] = [];

    if (Array.isArray(data)) {
      // Parse the array response
      data.forEach((item: any) => {
        const fileItem: FileItem = {
          name: item[0] || item.name,
          href: item[1] || item.href,
          sz: item[2] || item.sz || 0,
          mt: item[3] || item.mt || 0,
          is_dir: item[4] || item.is_dir || false,
        };

        if (fileItem.is_dir) {
          dirs.push(fileItem);
        } else {
          files.push(fileItem);
        }
      });
    } else if (data.dirs && data.files) {
      // Already in the correct format
      return data;
    }

    return {
      dirs,
      files,
      vpath: data.vpath || '/',
      rp: data.rp || '/',
      perm: data.perm || { r: true, w: false, m: false, d: false },
    };
  }
}

// Export a singleton instance
export const api = new CopyPartyAPI(
  typeof window !== 'undefined' ? window.location.origin : ''
);

export default CopyPartyAPI;
