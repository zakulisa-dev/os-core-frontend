import { FILE_ICON_MAP } from './constants';
import { BreadcrumbSegment } from './types';

export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
};

export const formatDate = (date: number): string => {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(date));
};

export const getFileIcon = (fileName: string): string | null => {
  const extension = fileName.split('.').pop()?.toLowerCase();
  return extension && FILE_ICON_MAP[extension] ? FILE_ICON_MAP[extension] : null;
};

export const buildFullPath = (currentPath: string, name: string): string => {
  return currentPath === '/' ? `/${name}` : `${currentPath}/${name}`;
};

export const pathToBreadcrumbs = (path: string): BreadcrumbSegment[] => {
  const normalizedPath = path.endsWith('/') && path !== '/' ? path.slice(0, -1) : path;

  if (normalizedPath === '/') {
    return [{ name: 'Root', path: '/' }];
  }

  const parts = normalizedPath.split('/').filter(Boolean);
  const breadcrumbs: BreadcrumbSegment[] = [{ name: 'Root', path: '/' }];

  let currentPath = '';
  for (const part of parts) {
    currentPath += `/${part}`;
    breadcrumbs.push({ name: part, path: currentPath });
  }

  return breadcrumbs;
};

export const getFileExtension = (fileName: string): string => {
  const parts = fileName.split('.');
  return parts.length > 1 ? parts.pop()!.toLowerCase() : '';
};

export const isImageFile = (fileName: string): boolean => {
  const ext = getFileExtension(fileName);
  return ['jpg', 'jpeg', 'png', 'gif', 'svg', 'bmp', 'webp', 'ico'].includes(ext);
};