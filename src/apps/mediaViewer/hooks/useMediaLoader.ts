import { useState, useCallback } from 'react';
import { systemApi } from '../../../index';
import { MediaState } from '../types/mediaTypes';
import { getMediaType, getMimeType } from '../utils/mediaUtils';
import { getErrorMessage } from '@nameless-os/sdk';

export const useMediaLoader = (filePath: string) => {
  const [state, setState] = useState<MediaState>({
    mediaUrl: null,
    kind: 'unknown',
    loading: true,
    error: ''
  });

  const loadMedia = useCallback(async () => {
    setState(prev => ({ ...prev, loading: true, error: '' }));

    try {
      const mediaKind = getMediaType(filePath);

      if (mediaKind === 'unknown') {
        setState(prev => ({
          ...prev,
          loading: false,
          error: 'Unsupported file format',
          kind: mediaKind
        }));
        return;
      }

      console.log(mediaKind, 'zzz');

      const fileData = await systemApi.fileSystem.readFile(filePath);
      const mimeType = getMimeType(filePath, mediaKind);
      const blob = new Blob([fileData], { type: mimeType });
      const url = URL.createObjectURL(blob);

      setState(prev => ({
        ...prev,
        mediaUrl: url,
        kind: mediaKind,
        loading: false,
        error: ''
      }));
    } catch (error) {
      console.error('Failed to load media:', error);
      setState(prev => ({
        ...prev,
        loading: false,
        error: getErrorMessage(error) ?? 'Failed to load media'
      }));
    }
  }, [filePath]);

  const cleanup = useCallback(() => {
    if (state.mediaUrl) {
      URL.revokeObjectURL(state.mediaUrl);
    }
  }, [state.mediaUrl]);

  return {
    ...state,
    loadMedia,
    cleanup
  };
};