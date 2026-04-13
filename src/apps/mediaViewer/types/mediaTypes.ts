import { Nullable } from '@nameless-os/sdk';

export type MediaKind = 'image' | 'video' | 'unknown';

export interface MediaViewerProps {
  filePath: string;
}

export interface MediaState {
  mediaUrl: Nullable<string>;
  kind: MediaKind;
  loading: boolean;
  error: string;
}

export interface ImageState {
  zoom: number;
  position: { x: number; y: number };
  dragging: boolean;
  dragStart: { x: number; y: number };
}

export interface VideoState {
  playing: boolean;
  progress: number;
  buffered: number;
  duration: number;
  volume: number;
  muted: boolean;
}

export interface UIState {
  isFullscreen: boolean;
  uiVisible: boolean;
}