import { useCallback, useEffect, useState } from 'react';
import { FileEntry, getErrorMessage } from '@nameless-os/sdk';
import { systemApi } from '../../../index';

export const useFileSystem = (currentPath: string) => {
  const [items, setItems] = useState<FileEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const loadDirectory = useCallback(async (path: string) => {
    if (!systemApi.fileSystem) {
      setError('File system not available');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const files = await systemApi.fileSystem.readDir(path);
      setItems(files);
    } catch (err) {
      setError(getErrorMessage(err) || 'Failed to load directory');
    } finally {
      setLoading(false);
    }
  }, []);

  const refresh = useCallback(() => {
    loadDirectory(currentPath);
  }, [currentPath, loadDirectory]);

  useEffect(() => {
    loadDirectory(currentPath);
  }, [currentPath, loadDirectory]);

  return { items, loading, error, setError, refresh };
};