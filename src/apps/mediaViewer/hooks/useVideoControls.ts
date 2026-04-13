import { useState, useCallback } from 'react';
import { VideoState } from '../types/mediaTypes';

export const useVideoControls = () => {
  const [state, setState] = useState<VideoState>({
    playing: false,
    progress: 0,
    buffered: 0,
    duration: 0,
    volume: 1,
    muted: false
  });

  const updateProgress = useCallback((video: HTMLVideoElement) => {
    if (!video || !video.duration) return;

    const progress = (video.currentTime / video.duration) * 100;

    let buffered = 0;
    try {
      const ranges = video.buffered;
      if (ranges.length) {
        const end = ranges.end(ranges.length - 1);
        buffered = Math.min(100, (end / video.duration) * 100);
      }
    } catch (error) {
    }

    setState(prev => ({ ...prev, progress, buffered }));
  }, []);

  const setPlaying = useCallback((playing: boolean) => {
    setState(prev => ({ ...prev, playing }));
  }, []);

  const setDuration = useCallback((duration: number) => {
    setState(prev => ({ ...prev, duration }));
  }, []);

  const setVolume = useCallback((volume: number) => {
    setState(prev => ({ ...prev, volume }));
  }, []);

  const setMuted = useCallback((muted: boolean) => {
    setState(prev => ({ ...prev, muted }));
  }, []);

  const setProgress = useCallback((progress: number) => {
    setState(prev => ({ ...prev, progress }));
  }, []);

  const togglePlayPause = useCallback((video: HTMLVideoElement) => {
    if (video.paused) {
      video.play();
    } else {
      video.pause();
    }
  }, []);

  const toggleMute = useCallback((video: HTMLVideoElement) => {
    video.muted = !video.muted;
    setMuted(video.muted);
  }, [setMuted]);

  const changeVolume = useCallback((video: HTMLVideoElement, newVolume: number) => {
    video.volume = newVolume;
    setVolume(newVolume);
    if (newVolume > 0 && video.muted) {
      video.muted = false;
      setMuted(false);
    }
  }, [setVolume, setMuted]);

  const seekTo = useCallback((video: HTMLVideoElement, progressPercent: number) => {
    if (!video.duration) return;
    video.currentTime = (progressPercent / 100) * video.duration;
    setProgress(progressPercent);
  }, [setProgress]);

  return {
    ...state,
    updateProgress,
    setPlaying,
    setDuration,
    setVolume,
    setMuted,
    setProgress,
    togglePlayPause,
    toggleMute,
    changeVolume,
    seekTo
  };
};