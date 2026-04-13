import { useState, useRef, useCallback, useEffect } from 'react';
import { Nullable } from '@nameless-os/sdk';

export const useUIVisibility = (playing: boolean, isVideo: boolean) => {
  const [uiVisible, setUiVisible] = useState(true);
  const hideTimer = useRef<Nullable<number>>(null);

  const showUI = useCallback((temporary = false) => {
    setUiVisible(true);

    if (hideTimer.current) {
      window.clearTimeout(hideTimer.current);
      hideTimer.current = null;
    }

    if (isVideo && playing && !temporary) {
      hideTimer.current = window.setTimeout(() => {
        setUiVisible(false);
      }, 1800);
    }
  }, [playing, isVideo]);

  const hideUI = useCallback(() => {
    if (hideTimer.current) {
      window.clearTimeout(hideTimer.current);
      hideTimer.current = null;
    }
    setUiVisible(false);
  }, []);

  const handleUserActivity = useCallback(() => {
    showUI();
  }, [showUI]);

  useEffect(() => {
    showUI();
  }, [playing, showUI]);

  useEffect(() => {
    return () => {
      if (hideTimer.current) {
        window.clearTimeout(hideTimer.current);
      }
    };
  }, []);

  return {
    uiVisible,
    showUI,
    hideUI,
    handleUserActivity
  };
};