import {
  File,
  FileText,
  Image,
  Video,
  Music,
  Archive,
  Code,
  FileSpreadsheet,
  Presentation,
  Folder,
  FolderOpen,
} from 'lucide-react';

interface FileIconProps {
  filename: string;
  isDir: boolean;
  isOpen?: boolean;
  className?: string;
}

export default function FileIcon({ filename, isDir, isOpen = false, className = '' }: FileIconProps) {
  const getFileExtension = (name: string) => {
    const parts = name.split('.');
    return parts.length > 1 ? parts[parts.length - 1].toLowerCase() : '';
  };

  const ext = getFileExtension(filename);

  const iconProps = {
    className: `${className}`,
    size: 20,
  };

  if (isDir) {
    return isOpen ? <FolderOpen {...iconProps} /> : <Folder {...iconProps} />;
  }

  // Document types
  if (['pdf', 'doc', 'docx', 'txt', 'rtf', 'odt', 'md'].includes(ext)) {
    return <FileText {...iconProps} />;
  }

  // Spreadsheet types
  if (['xls', 'xlsx', 'csv', 'ods'].includes(ext)) {
    return <FileSpreadsheet {...iconProps} />;
  }

  // Presentation types
  if (['ppt', 'pptx', 'odp'].includes(ext)) {
    return <Presentation {...iconProps} />;
  }

  // Image types
  if (['jpg', 'jpeg', 'png', 'gif', 'bmp', 'svg', 'webp', 'ico'].includes(ext)) {
    return <Image {...iconProps} />;
  }

  // Video types
  if (['mp4', 'avi', 'mkv', 'mov', 'wmv', 'flv', 'webm', 'm4v'].includes(ext)) {
    return <Video {...iconProps} />;
  }

  // Audio types
  if (['mp3', 'wav', 'flac', 'ogg', 'aac', 'm4a', 'wma'].includes(ext)) {
    return <Music {...iconProps} />;
  }

  // Archive types
  if (['zip', 'rar', '7z', 'tar', 'gz', 'bz2', 'xz'].includes(ext)) {
    return <Archive {...iconProps} />;
  }

  // Code types
  if (['js', 'ts', 'jsx', 'tsx', 'py', 'java', 'cpp', 'c', 'h', 'cs', 'php', 'rb', 'go', 'rs', 'swift', 'html', 'css', 'json', 'xml', 'yml', 'yaml'].includes(ext)) {
    return <Code {...iconProps} />;
  }

  return <File {...iconProps} />;
}
