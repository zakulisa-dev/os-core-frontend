import { useCallback, useEffect, useState } from 'react';
import { ViewMode } from '../types';
import { VIEW_MODE_STORAGE_KEY } from '../constants';

const isValidViewMode = (value: any): value is ViewMode => {
  return value === 'list' || value === 'grid';
};

export const useViewMode = () => {
  const [viewMode, setViewModeState] = useState<ViewMode>('list');
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const loadViewMode = async () => {
      try {
        const result = await window.localStorage.get(VIEW_MODE_STORAGE_KEY);
        if (result?.value && isValidViewMode(result.value)) {
          setViewModeState(result.value);
        }
      } catch {
        setViewModeState('list');
      } finally {
        setLoaded(true);
      }
    };

    loadViewMode();
  }, []);

  const setViewMode = useCallback(async (mode: ViewMode) => {
    setViewModeState(mode);
    try {
      await window.localStorage.set(VIEW_MODE_STORAGE_KEY, mode);
    } catch (err) {
      console.error('Failed to save view mode:', err);
    }
  }, []);

  return { viewMode, setViewMode, loaded };
};