import { useEffect, useMemo, useState } from 'react';
import { FileEntry } from '@nameless-os/sdk';

export const useSearch = (items: FileEntry[]) => {
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    setSearchQuery('');
  }, [items]);

  const filteredItems = useMemo(() => {
    if (!searchQuery.trim()) return items;

    const query = searchQuery.toLowerCase();
    return items.filter((item) => item.name.toLowerCase().includes(query));
  }, [items, searchQuery]);

  return { searchQuery, setSearchQuery, filteredItems };
};