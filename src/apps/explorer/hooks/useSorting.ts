import { useCallback, useMemo, useState } from 'react';
import { FileEntry } from '@nameless-os/sdk';
import { SortField, SortState } from '../types';

export const useSorting = (items: FileEntry[]) => {
  const [sortState, setSortState] = useState<SortState>({
    field: 'name',
    direction: 'asc',
  });

  const toggleSort = useCallback((field: SortField) => {
    setSortState((prev) => ({
      field,
      direction: prev.field === field && prev.direction === 'asc' ? 'desc' : 'asc',
    }));
  }, []);

  const sortedItems = useMemo(() => {
    return [...items].sort((a, b) => {
      if (a.stats.isDirectory && !b.stats.isDirectory) return -1;
      if (!a.stats.isDirectory && b.stats.isDirectory) return 1;

      let comparison = 0;

      switch (sortState.field) {
        case 'name':
          comparison = a.name.toLowerCase().localeCompare(b.name.toLowerCase());
          break;
        case 'size':
          if (!a.stats.isDirectory && !b.stats.isDirectory) {
            comparison = a.stats.size - b.stats.size;
          } else {
            comparison = a.name.toLowerCase().localeCompare(b.name.toLowerCase());
          }
          break;
        case 'modified':
          comparison = +a.stats.modified - +b.stats.modified;
          break;
      }

      return sortState.direction === 'asc' ? comparison : -comparison;
    });
  }, [items, sortState]);

  return { sortState, sortedItems, toggleSort };
};