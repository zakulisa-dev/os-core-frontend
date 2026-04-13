import React, { RefObject } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlay } from '@fortawesome/free-solid-svg-icons';
import styles from '../mediaViewer.module.css';
import { VideoState } from '../../types/mediaTypes';
import { VideoControls } from './VideoControls';
import { Nullable } from '@nameless-os/sdk';

interface VideoViewerProps {
  mediaUrl: string;
  fileName: string;
  videoState: VideoState;
  uiVisible: boolean;
  isFullscreen: boolean;
  videoRef: RefObject<Nullable<HTMLVideoElement>>;
  onPlay: () => void;
  onPause: () => void;
  onLoadedMetadata: () => void;
  onTimeUpdate: () => void;
  onProgress: () => void;
  onTogglePlayPause: () => void;
  onToggleMute: () => void;
  onVolumeChange: (volume: number) => void;
  onSeek: (progress: number) => void;
  onToggleFullscreen: () => void;
}

export const VideoViewer: React.FC<VideoViewerProps> = ({
                                                          mediaUrl,
                                                          videoState,
                                                          uiVisible,
                                                          isFullscreen,
                                                          videoRef,
                                                          onPlay,
                                                          onPause,
                                                          onLoadedMetadata,
                                                          onTimeUpdate,
                                                          onProgress,
                                                          onTogglePlayPause,
                                                          onToggleMute,
                                                          onVolumeChange,
                                                          onSeek,
                                                          onToggleFullscreen
                                                        }) => {
  const { playing } = videoState;

  return (
    <>
      <div className={styles.media} onClick={onTogglePlayPause}>
        {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
        <video
          ref={videoRef}
          src={mediaUrl}
          className={styles.video}
          onLoadedMetadata={onLoadedMetadata}
          onTimeUpdate={onTimeUpdate}
          onProgress={onProgress}
          onPlay={onPlay}
          onPause={onPause}
          controls={false}
          playsInline
        />
        {!playing && (
          <button
            className={`${styles.centerPlay} ${uiVisible ? styles.visible : styles.hidden}`}
            onClick={onTogglePlayPause}
            aria-label="Play"
          >
            <FontAwesomeIcon icon={faPlay} />
          </button>
        )}
      </div>
      <VideoControls
        videoState={videoState}
        uiVisible={uiVisible}
        isFullscreen={isFullscreen}
        onTogglePlayPause={onTogglePlayPause}
        onToggleMute={onToggleMute}
        onVolumeChange={onVolumeChange}
        onSeek={onSeek}
        onToggleFullscreen={onToggleFullscreen}
      />
    </>
  );
};