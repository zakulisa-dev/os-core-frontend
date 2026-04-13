import { useEffect, useCallback, RefObject } from 'react';
import { MediaKind } from '../types/mediaTypes';
import { Nullable } from '@nameless-os/sdk';

interface KeyboardControlsProps {
  kind: MediaKind;
  playing: boolean;
  videoRef: RefObject<Nullable<HTMLVideoElement>>;
  onToggleFullscreen: () => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onResetView: () => void;
  onVolumeChange: (volume: number) => void;
  onMuteToggle: () => void;
}

export const useKeyboardControls = ({
                                      kind,
                                      playing,
                                      videoRef,
                                      onToggleFullscreen,
                                      onZoomIn,
                                      onZoomOut,
                                      onResetView,
                                      onVolumeChange,
                                      onMuteToggle
                                    }: KeyboardControlsProps) => {
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'f' || e.key === 'F11') {
      e.preventDefault();
      onToggleFullscreen();
      return;
    }

    if (kind === 'video') {
      const video = videoRef?.current;
      if (!video) return;

      switch (e.key) {
        case ' ':
          e.preventDefault();
          if (playing) video.pause();
          else video.play();
          break;
        case 'ArrowRight':
          video.currentTime = Math.min(video.currentTime + 5, video.duration || video.currentTime);
          break;
        case 'ArrowLeft':
          video.currentTime = Math.max(video.currentTime - 5, 0);
          break;
        case 'ArrowUp':
          e.preventDefault();
          const newVolumeUp = Math.min(1, (video.volume || 0) + 0.1);
          video.volume = newVolumeUp;
          onVolumeChange(newVolumeUp);
          break;
        case 'ArrowDown':
          e.preventDefault();
          const newVolumeDown = Math.max(0, (video.volume || 0) - 0.1);
          video.volume = newVolumeDown;
          onVolumeChange(newVolumeDown);
          break;
        case 'm':
        case 'M':
          onMuteToggle();
          break;
        case 'Home':
          video.currentTime = 0;
          break;
        case 'End':
          video.currentTime = video.duration || 0;
          break;
      }
    } else if (kind === 'image') {
      switch (e.key) {
        case '+':
        case '=':
          onZoomIn();
          break;
        case '-':
          onZoomOut();
          break;
        case '0':
          onResetView();
          break;
      }
    }
  }, [
    kind,
    playing,
    videoRef,
    onToggleFullscreen,
    onZoomIn,
    onZoomOut,
    onResetView,
    onVolumeChange,
    onMuteToggle
  ]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);
};