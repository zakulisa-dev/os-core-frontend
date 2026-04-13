import { useCallback, useEffect } from 'react';
import { FileEntry } from '@nameless-os/sdk';
import { ClipboardItem } from '../types';

interface UseKeyboardShortcutsProps {
  selectedItems: Set<string>;
  items: FileEntry[];
  filteredItems: FileEntry[];
  clipboard: ClipboardItem[];
  copyToClipboard: () => void;
  cutToClipboard: () => void;
  pasteFromClipboard: () => Promise<boolean>;
  handleDelete: () => void;
  handleRename: (item: FileEntry) => void;
  closeContextMenu: () => void;
  setSelectedItems: (items: Set<string>) => void;
  refresh: () => void;
}

export const useKeyboardShortcuts = ({
                                       selectedItems,
                                       items,
                                       filteredItems,
                                       clipboard,
                                       copyToClipboard,
                                       cutToClipboard,
                                       pasteFromClipboard,
                                       handleDelete,
                                       handleRename,
                                       closeContextMenu,
                                       setSelectedItems,
                                       refresh,
                                     }: UseKeyboardShortcutsProps) => {
  const handleKeyDown = useCallback(
    async (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement) return;

      const isCtrlOrCmd = e.ctrlKey || e.metaKey;

      if (isCtrlOrCmd && e.key === 'c' && selectedItems.size > 0) {
        e.preventDefault();
        copyToClipboard();
      } else if (isCtrlOrCmd && e.key === 'x' && selectedItems.size > 0) {
        e.preventDefault();
        cutToClipboard();
      } else if (isCtrlOrCmd && e.key === 'v' && clipboard.length > 0) {
        e.preventDefault();
        try {
          const success = await pasteFromClipboard();
          if (success) refresh();
        } catch (err) {
          console.error('Paste failed:', err);
        }
      } else if (e.key === 'Delete' && selectedItems.size > 0) {
        e.preventDefault();
        handleDelete();
      } else if (e.key === 'F2' && selectedItems.size === 1) {
        e.preventDefault();
        const selectedItemName = Array.from(selectedItems)[0];
        const item = items.find((i) => i.name === selectedItemName);
        if (item) handleRename(item);
      } else if (e.key === 'Escape') {
        setSelectedItems(new Set());
        closeContextMenu();
      } else if (isCtrlOrCmd && e.key === 'a') {
        e.preventDefault();
        setSelectedItems(new Set(filteredItems.map((item) => item.name)));
      }
    },
    [
      selectedItems,
      clipboard,
      copyToClipboard,
      cutToClipboard,
      pasteFromClipboard,
      handleDelete,
      handleRename,
      closeContextMenu,
      setSelectedItems,
      items,
      refresh,
    ]
  );

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);
};