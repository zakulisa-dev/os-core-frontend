import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faPlay, faPause, faExpand, faCompress,
  faVolumeHigh, faVolumeXmark
} from '@fortawesome/free-solid-svg-icons';
import styles from '../mediaViewer.module.css';
import { VideoState } from '../../types/mediaTypes';
import { formatTime } from '../../utils/mediaUtils';

interface VideoControlsProps {
  videoState: VideoState;
  uiVisible: boolean;
  isFullscreen: boolean;
  onTogglePlayPause: () => void;
  onToggleMute: () => void;
  onVolumeChange: (volume: number) => void;
  onSeek: (progress: number) => void;
  onToggleFullscreen: () => void;
}

export const VideoControls: React.FC<VideoControlsProps> = ({
                                                              videoState,
                                                              uiVisible,
                                                              isFullscreen,
                                                              onTogglePlayPause,
                                                              onToggleMute,
                                                              onVolumeChange,
                                                              onSeek,
                                                              onToggleFullscreen
                                                            }) => {
  const { playing, progress, buffered, duration, volume, muted } = videoState;

  const currentTime = (progress / 100) * duration;

  return (
    <div className={`${styles.controls} ${uiVisible ? styles.visible : styles.hidden}`}>
      <div className={styles.controlsRow}>
        <button
          className={styles.iconBtn}
          onClick={onTogglePlayPause}
          title="Play/Pause (Space)"
        >
          <FontAwesomeIcon icon={playing ? faPause : faPlay} />
        </button>
        <div className={styles.progressWrap}>
          <div className={styles.bufferBar} style={{ width: `${buffered}%` }} />
          <input
            className={styles.progress}
            type="range"
            min={0}
            max={100}
            step={0.1}
            value={isFinite(progress) ? progress : 0}
            onChange={(e) => onSeek(parseFloat(e.target.value))}
          />
        </div>
        <div className={styles.time}>
          {formatTime(currentTime)} / {formatTime(duration)}
        </div>
        <button
          className={styles.iconBtn}
          onClick={onToggleFullscreen}
          title="Fullscreen (F)"
        >
          <FontAwesomeIcon icon={isFullscreen ? faCompress : faExpand} />
        </button>
      </div>
      <div className={styles.controlsRow}>
        <button
          className={styles.iconBtn}
          onClick={onToggleMute}
          title={muted ? 'Unmute (M)' : 'Mute (M)'}
        >
          <FontAwesomeIcon icon={muted || volume === 0 ? faVolumeXmark : faVolumeHigh} />
        </button>
        <input
          className={styles.volume}
          type="range"
          min={0}
          max={1}
          step={0.05}
          value={muted ? 0 : volume}
          onChange={(e) => onVolumeChange(parseFloat(e.target.value))}
        />
        <div className={styles.volumeText}>
          {Math.round((muted ? 0 : volume) * 100)}%
        </div>
      </div>
    </div>
  );
};