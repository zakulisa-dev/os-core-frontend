import { MediaKind } from '@Apps/mediaViewer/types/mediaTypes';

export const getMediaType = (path: string): MediaKind => {
  const ext = path.split('.').pop()?.toLowerCase() || '';
  const imageExts = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp', 'ico'];
  const videoExts = ['mp4', 'webm', 'ogg', 'ogv', 'avi', 'mov', 'm4v'];

  if (imageExts.includes(ext)) return 'image';
  if (videoExts.includes(ext)) return 'video';
  return 'unknown';
};

export const getMimeType = (filePath: string, mediaKind: MediaKind): string => {
  const ext = filePath.split('.').pop()?.toLowerCase() || '';

  if (mediaKind === 'image') {
    const imageMimes: Record<string, string> = {
      jpg: 'image/jpeg', jpeg: 'image/jpeg', png: 'image/png',
      gif: 'image/gif', webp: 'image/webp', svg: 'image/svg+xml',
      bmp: 'image/bmp', ico: 'image/x-icon'
    };
    return imageMimes[ext] || 'image/*';
  }

  if (mediaKind === 'video') {
    const videoMimes: Record<string, string> = {
      mp4: 'video/mp4', webm: 'video/webm', ogg: 'video/ogg',
      ogv: 'video/ogg', m4v: 'video/mp4', mov: 'video/quicktime',
      avi: 'video/x-msvideo'
    };
    return videoMimes[ext] || 'video/*';
  }

  return 'application/octet-stream';
};

export const formatTime = (seconds: number): string => {
  if (!isFinite(seconds)) return '0:00';
  const minutes = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60).toString().padStart(2, '0');
  return `${minutes}:${secs}`;
};

export const getFileName = (filePath: string): string => {
  return filePath.split(/[\\/]/).pop() || 'media';
};
