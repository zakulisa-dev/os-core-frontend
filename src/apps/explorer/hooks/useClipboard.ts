import { useCallback, useState } from 'react';
import { FileEntry, getErrorMessage } from '@nameless-os/sdk';
import { systemApi } from '../../../index';
import { ClipboardItem } from '../types';
import { buildFullPath } from '../utils';

export const useClipboard = (
  currentPath: string,
  items: FileEntry[],
  selectedItems: Set<string>
) => {
  const [clipboard, setClipboard] = useState<ClipboardItem[]>([]);

  const copyToClipboard = useCallback(() => {
    const selectedFiles = Array.from(selectedItems)
      .map((name) => {
        const item = items.find((i) => i.name === name);
        if (!item) return null;

        const fullPath = buildFullPath(currentPath, name);
        return {
          name,
          fullPath,
          isDirectory: item.stats.isDirectory,
          operation: 'copy' as const,
        };
      })
      .filter(Boolean) as ClipboardItem[];

    setClipboard(selectedFiles);
  }, [selectedItems, items, currentPath]);

  const cutToClipboard = useCallback(() => {
    const selectedFiles = Array.from(selectedItems)
      .map((name) => {
        const item = items.find((i) => i.name === name);
        if (!item) return null;

        const fullPath = buildFullPath(currentPath, name);
        return {
          name,
          fullPath,
          isDirectory: item.stats.isDirectory,
          operation: 'cut' as const,
        };
      })
      .filter(Boolean) as ClipboardItem[];

    setClipboard(selectedFiles);
  }, [selectedItems, items, currentPath]);

  const pasteFromClipboard = useCallback(async (): Promise<boolean> => {
    if (!clipboard.length || !systemApi.fileSystem) return false;

    try {
      for (const clipboardItem of clipboard) {
        const targetPath = buildFullPath(currentPath, clipboardItem.name);

        if (clipboardItem.operation === 'copy') {
          await systemApi.fileSystem.copy(clipboardItem.fullPath, targetPath);
        } else if (clipboardItem.operation === 'cut') {
          await systemApi.fileSystem.move(clipboardItem.fullPath, targetPath);
        }
      }

      if (clipboard.some((item) => item.operation === 'cut')) {
        setClipboard([]);
      }

      return true;
    } catch (err) {
      throw new Error(getErrorMessage(err));
    }
  }, [clipboard, currentPath]);

  return {
    clipboard,
    setClipboard,
    copyToClipboard,
    cutToClipboard,
    pasteFromClipboard,
  };
};