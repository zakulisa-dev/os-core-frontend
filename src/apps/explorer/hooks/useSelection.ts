import { useCallback, useEffect, useState } from 'react';
import { FileEntry } from '@nameless-os/sdk';

export const useSelection = (items: FileEntry[]) => {
  const [selectedItems, setSelectedItems] = useState(new Set<string>());
  const [lastSelectedIndex, setLastSelectedIndex] = useState<number | null>(null);

  useEffect(() => {
    setSelectedItems(new Set());
    setLastSelectedIndex(null);
  }, [items.length]);

  const handleItemClick = useCallback(
    (item: FileEntry, event: React.MouseEvent, index: number) => {
      if (event.ctrlKey || event.metaKey) {
        const newSelected = new Set(selectedItems);
        if (newSelected.has(item.name)) {
          newSelected.delete(item.name);
        } else {
          newSelected.add(item.name);
        }
        setSelectedItems(newSelected);
        setLastSelectedIndex(index);
      } else if (event.shiftKey && lastSelectedIndex !== null) {
        const start = Math.min(lastSelectedIndex, index);
        const end = Math.max(lastSelectedIndex, index);
        const newSelected = new Set<string>();
        for (let i = start; i <= end; i++) {
          newSelected.add(items[i].name);
        }
        setSelectedItems(newSelected);
      } else {
        setSelectedItems(new Set([item.name]));
        setLastSelectedIndex(index);
      }
    },
    [selectedItems, lastSelectedIndex, items]
  );

  const clearSelection = useCallback(() => {
    setSelectedItems(new Set());
    setLastSelectedIndex(null);
  }, []);

  const selectAll = useCallback(() => {
    setSelectedItems(new Set(items.map((item) => item.name)));
  }, [items]);

  return {
    selectedItems,
    setSelectedItems,
    handleItemClick,
    clearSelection,
    selectAll,
  };
};