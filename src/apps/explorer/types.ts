import { FileEntry } from '@nameless-os/sdk';

export type SortField = 'name' | 'size' | 'modified';
export type SortDirection = 'asc' | 'desc';
export type ViewMode = 'list' | 'grid';

export interface SortState {
  field: SortField;
  direction: SortDirection;
}

export interface ClipboardItem {
  name: string;
  fullPath: string;
  isDirectory: boolean;
  operation: 'copy' | 'cut';
}

export interface FileDragData {
  filePath: string;
  name: string;
  isDirectory: boolean;
}

export interface UploadProgressItem {
  loaded: number;
  total: number;
  status: 'uploading' | 'completed' | 'error';
  error?: string;
}

export interface ContextMenuState {
  x: number;
  y: number;
  item: FileEntry | null;
}

export interface BreadcrumbSegment {
  name: string;
  path: string;
}

export interface ConfirmDialogState {
  show: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
}