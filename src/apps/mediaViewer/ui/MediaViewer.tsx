import React, { useRef, useEffect, useState } from 'react';
import { FilePicker } from '@Components/FilePicker/FilePicker'; // Adjust path as needed
import styles from './mediaViewer.module.css';
import { getFileName } from '../utils/mediaUtils';
import { useMediaLoader } from '../hooks/useMediaLoader';
import { useImageControls } from '../hooks/useImageControls';
import { useVideoControls } from '../hooks/useVideoControls';
import { useFullscreen } from '../hooks/useFullscreen';
import { useUIVisibility } from '../hooks/useUIVisibility';
import { useKeyboardControls } from '../hooks/useKeyboardControls';
import { LoadingState } from './components/LoadingState';
import { ErrorState } from './components/ErrorState';
import { ImageViewer } from './components/ImageViewer';
import { VideoViewer } from './components/VideoViewer';

interface EnhancedMediaViewerProps {
  filePath?: string; // Make optional
  onFileChange?: (filePath: string) => void;
}

// Welcome screen component for media viewer
const MediaWelcome: React.FC<{
  onOpenFile: () => void;
}> = ({ onOpenFile }) => {
  return (
    <div className={styles.stateCenter}>
      <div className={styles.welcomeContent}>
        <div className={styles.mediaIcon}>📷</div>
        <h2>Media Viewer</h2>
        <p>Select a media file to get started</p>
        <button
          className={styles.primaryBtn}
          onClick={onOpenFile}
        >
          📂 Open Media File
        </button>
        <div className={styles.supportedFormats}>
          <p>Supported formats:</p>
          <div className={styles.formatList}>
            <span>Images: JPG, PNG, GIF, WEBP, SVG</span>
            <span>Videos: MP4, WEBM, OGV, AVI, MOV</span>
          </div>
        </div>
        <div className={styles.shortcuts}>
          <p>Keyboard shortcuts:</p>
          <ul>
            <li><kbd>Ctrl+O</kbd> - Open file</li>
            <li><kbd>F</kbd> - Toggle fullscreen</li>
            <li><kbd>Space</kbd> - Play/Pause (video)</li>
            <li><kbd>+/-</kbd> - Zoom in/out (image)</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

// eslint-disable-next-line react/prop-types
const MediaViewer: React.FC<EnhancedMediaViewerProps> = React.memo(({
                                                                      filePath: initialFilePath,
                                                                      onFileChange
                                                                    }) => {
  const [currentFilePath, setCurrentFilePath] = useState<string | null>(initialFilePath || null);
  const [showFilePicker, setShowFilePicker] = useState(false);

  const wrapperRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  const { mediaUrl, kind, loading, error, loadMedia, cleanup } = useMediaLoader(currentFilePath);

  const imageControls = useImageControls();
  const videoControls = useVideoControls();
  const { isFullscreen, toggleFullscreen } = useFullscreen(wrapperRef);
  const { uiVisible, handleUserActivity } = useUIVisibility(
    videoControls.playing,
    kind === 'video'
  );

  useKeyboardControls({
    kind,
    playing: videoControls.playing,
    videoRef,
    onToggleFullscreen: toggleFullscreen,
    onZoomIn: imageControls.zoomIn,
    onZoomOut: imageControls.zoomOut,
    onResetView: imageControls.resetView,
    onVolumeChange: videoControls.setVolume,
    onMuteToggle: () => {
      const video = videoRef.current;
      if (video) {
        videoControls.toggleMute(video);
      }
    },
    onOpenFile: () => setShowFilePicker(true) // Add open file shortcut
  });

  useEffect(() => {
    if (currentFilePath) {
      loadMedia();
    }
  }, [loadMedia, currentFilePath]);

  useEffect(() => {
    return cleanup;
  }, [cleanup]);

  useEffect(() => {
    if (initialFilePath && initialFilePath !== currentFilePath) {
      setCurrentFilePath(initialFilePath);
    }
  }, [initialFilePath]);

  // FilePicker handlers
  const handleFileSelect = (filePath: string) => {
    setShowFilePicker(false);
    setCurrentFilePath(filePath);

    if (onFileChange) {
      onFileChange(filePath);
    }
  };

  const handleFilePickerCancel = () => {
    setShowFilePicker(false);
  };

  const handleOpenFile = () => {
    setShowFilePicker(true);
  };

  // Media event handlers
  const handleImageWheel = (e: React.WheelEvent) => {
    if (kind !== 'image') return;
    e.preventDefault();
    imageControls.handleWheel(e.deltaY);
  };

  const handleImageMouseDown = (e: React.MouseEvent) => {
    if (kind !== 'image' || imageControls.zoom <= 100) return;
    imageControls.startDragging(e.clientX, e.clientY);
  };

  const handleImageMouseMove = (e: React.MouseEvent) => {
    if (kind !== 'image') return;
    imageControls.updateDragging(e.clientX, e.clientY);
  };

  const handleVideoLoadedMetadata = () => {
    const video = videoRef.current;
    if (!video) return;

    videoControls.setDuration(video.duration || 0);
    video.volume = videoControls.volume;
    video.muted = videoControls.muted;
  };

  const handleVideoTimeUpdate = () => {
    const video = videoRef.current;
    if (video) {
      videoControls.updateProgress(video);
    }
  };

  const handleVideoPlay = () => {
    videoControls.setPlaying(true);
  };

  const handleVideoPause = () => {
    videoControls.setPlaying(false);
  };

  const handleTogglePlayPause = () => {
    const video = videoRef.current;
    if (video) {
      videoControls.togglePlayPause(video);
    }
  };

  const handleToggleMute = () => {
    const video = videoRef.current;
    if (video) {
      videoControls.toggleMute(video);
    }
  };

  const handleVolumeChange = (volume: number) => {
    const video = videoRef.current;
    if (video) {
      videoControls.changeVolume(video, volume);
    }
  };

  const handleSeek = (progressPercent: number) => {
    const video = videoRef.current;
    if (video) {
      videoControls.seekTo(video, progressPercent);
    }
  };

  // If no file is selected, show welcome screen
  if (!currentFilePath) {
    return (
      <div className={styles.wrapper}>
        <MediaWelcome onOpenFile={handleOpenFile} />

        {showFilePicker && (
          <FilePicker
            isOpen={showFilePicker}
            onFileSelect={handleFileSelect}
            onCancel={handleFilePickerCancel}
            mode="open"
            title="Open Media File"
            fileExtensions={[
              '.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg', '.bmp', '.ico',
              '.mp4', '.webm', '.ogv', '.avi', '.mov', '.wmv', '.flv', '.mkv',
            ]}
            showRecentFiles={true}
            recentFilesKey="recentMediaFiles"
            startPath="/home"
          />
        )}
      </div>
    );
  }

  if (loading) {
    return <LoadingState />;
  }

  if (error) {
    return (
      <div className={styles.wrapper}>
        <ErrorState error={error} onRetry={loadMedia} />

        {showFilePicker && (
          <FilePicker
            isOpen={showFilePicker}
            onFileSelect={handleFileSelect}
            onCancel={handleFilePickerCancel}
            mode="open"
            title="Open Media File"
            fileExtensions={[
              '.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg', '.bmp', '.ico',
              '.mp4', '.webm', '.ogv', '.avi', '.mov', '.wmv', '.flv', '.mkv',
            ]}
            showRecentFiles={true}
            recentFilesKey="recentMediaFiles"
            startPath="/home"
          />
        )}
      </div>
    );
  }

  if (!mediaUrl) {
    return (
      <div className={styles.wrapper}>
        <ErrorState error="No media to display" onRetry={loadMedia} />
        {showFilePicker && (
          <FilePicker
            isOpen={showFilePicker}
            onFileSelect={handleFileSelect}
            onCancel={handleFilePickerCancel}
            mode="open"
            title="Open Media File"
            fileExtensions={[
              '.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg', '.bmp', '.ico',
              '.mp4', '.webm', '.ogv', '.avi', '.mov', '.wmv', '.flv', '.mkv',
            ]}
            showRecentFiles={true}
            recentFilesKey="recentMediaFiles"
            startPath="/home"
          />
        )}
      </div>
    );
  }

  const fileName = getFileName(currentFilePath);

  return (
    <div
      ref={wrapperRef}
      className={styles.wrapper}
      onMouseMove={handleUserActivity}
      onMouseLeave={() => handleUserActivity()}
      onDoubleClick={toggleFullscreen}
    >
      {/* Add Open File button to top bar */}
      <div className={`${styles.topBar} ${uiVisible ? styles.visible : styles.hidden}`}>
        <div className={styles.title}>{fileName}</div>
        <div className={styles.topActions}>
          <button
            className={styles.iconBtn}
            onClick={handleOpenFile}
            title="Open File (Ctrl+O)"
          >
            📂
          </button>
        </div>
      </div>

      {kind === 'image' && (
        <ImageViewer
          mediaUrl={mediaUrl}
          fileName={fileName}
          imageState={imageControls}
          uiVisible={uiVisible}
          isFullscreen={isFullscreen}
          onWheel={handleImageWheel}
          onMouseDown={handleImageMouseDown}
          onMouseMove={handleImageMouseMove}
          onMouseUp={imageControls.stopDragging}
          onZoomIn={imageControls.zoomIn}
          onZoomOut={imageControls.zoomOut}
          onResetView={imageControls.resetView}
          onToggleFullscreen={toggleFullscreen}
        />
      )}

      {kind === 'video' && (
        <VideoViewer
          mediaUrl={mediaUrl}
          fileName={fileName}
          videoState={videoControls}
          uiVisible={uiVisible}
          isFullscreen={isFullscreen}
          videoRef={videoRef}
          onPlay={handleVideoPlay}
          onPause={handleVideoPause}
          onLoadedMetadata={handleVideoLoadedMetadata}
          onTimeUpdate={handleVideoTimeUpdate}
          onProgress={handleVideoTimeUpdate}
          onTogglePlayPause={handleTogglePlayPause}
          onToggleMute={handleToggleMute}
          onVolumeChange={handleVolumeChange}
          onSeek={handleSeek}
          onToggleFullscreen={toggleFullscreen}
        />
      )}

      {showFilePicker && (
        <FilePicker
          isOpen={showFilePicker}
          onFileSelect={handleFileSelect}
          onCancel={handleFilePickerCancel}
          mode="open"
          title="Open Media File"
          fileExtensions={[
            '.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg', '.bmp', '.ico',
            '.mp4', '.webm', '.ogv', '.avi', '.mov', '.wmv', '.flv', '.mkv',
          ]}
          showRecentFiles={true}
          recentFilesKey="recentMediaFiles"
          startPath="/home"
        />
      )}
    </div>
  );
});

MediaViewer.displayName = 'MediaViewer';

export { MediaViewer };