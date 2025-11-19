'use client';

import { useState, useRef } from 'react';
import { X, Upload, File, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { UploadProgress } from '@/types';
import { formatFileSize } from '@/lib/utils';

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpload: (files: File[]) => void;
  uploads: UploadProgress[];
}

export default function UploadModal({
  isOpen,
  onClose,
  onUpload,
  uploads,
}: UploadModalProps) {
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      onUpload(files);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      onUpload(files);
    }
  };

  const handleBrowseClick = () => {
    fileInputRef.current?.click();
  };

  const allCompleted = uploads.every((u) => u.status === 'complete');
  const hasUploads = uploads.length > 0;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Upload Files</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {!hasUploads ? (
            /* Drop zone */
            <div
              className={`border-2 border-dashed rounded-xl p-12 text-center transition-colors ${
                dragActive
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-300 hover:border-gray-400'
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <Upload className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Drop files here to upload
              </h3>
              <p className="text-gray-500 mb-6">or</p>
              <button
                onClick={handleBrowseClick}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                Browse Files
              </button>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                className="hidden"
                onChange={handleFileSelect}
              />
            </div>
          ) : (
            /* Upload progress */
            <div className="space-y-3">
              {uploads.map((upload, index) => (
                <div
                  key={index}
                  className="border border-gray-200 rounded-lg p-4"
                >
                  <div className="flex items-start gap-3">
                    {/* Icon */}
                    <div className="flex-shrink-0 mt-1">
                      {upload.status === 'complete' ? (
                        <CheckCircle className="w-5 h-5 text-green-500" />
                      ) : upload.status === 'error' ? (
                        <AlertCircle className="w-5 h-5 text-red-500" />
                      ) : (
                        <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />
                      )}
                    </div>

                    {/* File info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {upload.file.name}
                        </p>
                        <span className="text-xs text-gray-500 flex-shrink-0">
                          {formatFileSize(upload.file.size)}
                        </span>
                      </div>

                      {/* Progress bar */}
                      {upload.status === 'uploading' && (
                        <>
                          <div className="bg-gray-200 rounded-full h-1.5 mb-1">
                            <div
                              className="bg-blue-600 h-1.5 rounded-full transition-all duration-300"
                              style={{ width: `${upload.progress}%` }}
                            />
                          </div>
                          <p className="text-xs text-gray-500">
                            {Math.round(upload.progress)}% uploaded
                          </p>
                        </>
                      )}

                      {upload.status === 'complete' && (
                        <p className="text-xs text-green-600">Upload complete</p>
                      )}

                      {upload.status === 'error' && (
                        <p className="text-xs text-red-600">
                          {upload.error || 'Upload failed'}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200">
          <div className="text-sm text-gray-600">
            {hasUploads && (
              <span>
                {uploads.filter((u) => u.status === 'complete').length} of{' '}
                {uploads.length} files uploaded
              </span>
            )}
          </div>
          <div className="flex gap-2">
            {hasUploads && allCompleted && (
              <button
                onClick={() => {
                  fileInputRef.current?.click();
                }}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
              >
                Upload More
              </button>
            )}
            <button
              onClick={onClose}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              {allCompleted ? 'Done' : 'Close'}
            </button>
          </div>
        </div>

        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          multiple
          className="hidden"
          onChange={handleFileSelect}
        />
      </div>
    </div>
  );
}
