export const KEYBOARD_SHORTCUTS = {
  COPY: 'copy',
  CUT: 'cut',
  PASTE: 'paste',
  DELETE: 'delete',
  RENAME: 'rename',
  ESCAPE: 'escape',
  SELECT_ALL: 'selectAll',
} as const;

export const FILE_ICON_MAP: Record<string, string> = {
  js: 'assets/images/fileExt/js.svg',
  jsx: 'assets/images/fileExt/js.svg',
  ts: 'assets/images/fileExt/ts.svg',
  tsx: 'assets/images/fileExt/ts.svg',
  jpg: 'assets/images/fileExt/image.svg',
  jpeg: 'assets/images/fileExt/image.svg',
  png: 'assets/images/fileExt/image.svg',
  gif: 'assets/images/fileExt/image.svg',
  svg: 'assets/images/fileExt/image.svg',
  bmp: 'assets/images/fileExt/image.svg',
  ico: 'assets/images/fileExt/image.svg',
  webp: 'assets/images/fileExt/image.svg',
  mp4: 'assets/images/fileExt/video.svg',
  avi: 'assets/images/fileExt/video.svg',
  mkv: 'assets/images/fileExt/video.svg',
  mov: 'assets/images/fileExt/video.svg',
};

export const VIEW_MODE_STORAGE_KEY = 'explorer:viewMode';

export const DRAG_DROP_MIME_TYPE = 'application/file-shortcut';