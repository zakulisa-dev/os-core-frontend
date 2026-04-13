import { useCallback, useEffect, useRef, useState } from 'react';
import { FileEntry, getErrorMessage } from '@nameless-os/sdk';
import { useNavigation } from './hooks/useNavigation';
import { useFileSystem } from './hooks/useFileSystem';
import { useSorting } from './hooks/useSorting';
import { useClipboard } from './hooks/useClipboard';
import { useSelection } from './hooks/useSelection';
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts';
import { useSearch } from './hooks/useSearch';
import { useViewMode } from './hooks/useViewMode';
import { Toolbar } from './components/Toolbar';
import { Breadcrumbs } from './components/Breadcrumbs';
import { SearchBar } from './components/SearchBar';
import { ViewSwitcher } from './components/ViewSwitcher';
import { StatusBar } from './components/StatusBar';
import { FileList } from './components/FileList';
import { FileGrid } from './components/FileGrid';
import { ContextMenu } from './components/ContextMenu';
import { NewItemDialog, RenameDialog } from './components/Dialogs';
import { ConfirmDialog } from './components/ConfirmDialog';
import { EmptyState } from './components/EmptyState';
import { DragDropOverlay } from './components/DragDropOverlay';
import { UploadProgress } from './components/UploadProgress';
import { ContextMenuState, FileDragData, UploadProgressItem } from './types';
import { buildFullPath } from './utils';
import { DRAG_DROP_MIME_TYPE } from './constants';
import styles from './fileExplorer.module.css';
import { systemApi } from 'src';
import { fileRegistry } from '../../api/app/fileAssociations';

export const FileExplorer = () => {
  const [contextMenu, setContextMenu] = useState<ContextMenuState | null>(null);
  const [showNewDialog, setShowNewDialog] = useState(false);
  const [newItemType, setNewItemType] = useState('file');
  const [newItemName, setNewItemName] = useState('');
  const [renameItem, setRenameItem] = useState<{ name: string; newName: string } | null>(null);
  const [dragOverlay, setDragOverlay] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<Record<string, UploadProgressItem>>({});
  const [confirmDelete, setConfirmDelete] = useState<{
    show: boolean;
    count: number;
    onConfirm: () => void;
  }>({ show: false, count: 0, onConfirm: () => {} });

  const containerRef = useRef<HTMLDivElement>(null);

  const navigation = useNavigation();
  const fileSystem = useFileSystem(navigation.currentPath);
  const sorting = useSorting(fileSystem.items);
  const search = useSearch(sorting.sortedItems);
  const selection = useSelection(search.filteredItems);
  const clipboard = useClipboard(navigation.currentPath, fileSystem.items, selection.selectedItems);
  const { viewMode, setViewMode, loaded: viewModeLoaded } = useViewMode();

  const handleNewItem = useCallback(async () => {
    if (!newItemName.trim() || !systemApi.fileSystem) return;

    const fullPath = buildFullPath(navigation.currentPath, newItemName);

    try {
      if (newItemType === 'folder') {
        await systemApi.fileSystem.mkdir(fullPath);
      } else {
        await systemApi.fileSystem.writeFile(fullPath, '');
      }
      fileSystem.refresh();
      setShowNewDialog(false);
      setNewItemName('');
    } catch (err) {
      fileSystem.setError(getErrorMessage(err) || 'Failed to create item');
    }
  }, [newItemName, newItemType, navigation.currentPath, fileSystem]);

  const handleDelete = useCallback(async () => {
    if (selection.selectedItems.size === 0 || !systemApi.fileSystem) return;

    setConfirmDelete({
      show: true,
      count: selection.selectedItems.size,
      onConfirm: async () => {
        try {
          for (const itemName of selection.selectedItems) {
            const fullPath = buildFullPath(navigation.currentPath, itemName);
            const item = fileSystem.items.find((i) => i.name === itemName);
            await systemApi.fileSystem.delete(fullPath, { recursive: item?.stats.isDirectory });
          }

          selection.clearSelection();

          const deletedPaths = Array.from(selection.selectedItems).map((name) =>
            buildFullPath(navigation.currentPath, name)
          );

          clipboard.setClipboard(
            clipboard.clipboard.filter(
              (clipItem) =>
                clipItem.operation === 'copy' || !deletedPaths.includes(clipItem.fullPath)
            )
          );

          fileSystem.refresh();
        } catch (err) {
          fileSystem.setError(getErrorMessage(err) || 'Failed to delete items');
        }
        setConfirmDelete({ show: false, count: 0, onConfirm: () => {} });
        setContextMenu(null);
      },
    });
  }, [selection, navigation.currentPath, fileSystem, clipboard]);

  const handleRename = useCallback((item: FileEntry) => {
    setRenameItem({ name: item.name, newName: item.name });
    setContextMenu(null);
  }, []);

  const confirmRename = useCallback(async () => {
    if (!renameItem?.newName.trim() || !systemApi.fileSystem) return;

    const oldPath = buildFullPath(navigation.currentPath, renameItem.name);
    const newPath = buildFullPath(navigation.currentPath, renameItem.newName);

    try {
      await systemApi.fileSystem.move(oldPath, newPath);

      clipboard.setClipboard(
        clipboard.clipboard.map((clipItem) =>
          clipItem.fullPath === oldPath
            ? { ...clipItem, name: renameItem.newName, fullPath: newPath }
            : clipItem
        )
      );

      fileSystem.refresh();
      setRenameItem(null);
    } catch (err) {
      fileSystem.setError(getErrorMessage(err) || 'Failed to rename item');
    }
  }, [renameItem, navigation.currentPath, fileSystem, clipboard]);

  const handleItemDoubleClick = useCallback(
    (item: FileEntry) => {
      if (item.stats.isDirectory) {
        const newPath = buildFullPath(navigation.currentPath, item.name);
        navigation.navigateTo(newPath);
        return;
      }

      const appId = fileRegistry.getDefaultAppForFile(item.name);
      if (appId) {
        const fullPath = buildFullPath(navigation.currentPath, item.name);
        systemApi.app.startApp(appId, { filePath: fullPath });
      } else {
        fileSystem.setError(`No app registered for file type: ${item.name}`);
      }
    },
    [navigation, fileSystem]
  );

  const handleContextMenu = useCallback(
    (event: React.MouseEvent, item: FileEntry | null) => {
      event.preventDefault();

      if (item && !selection.selectedItems.has(item.name)) {
        selection.setSelectedItems(new Set([item.name]));
      }

      setTimeout(() => {
        const rect = containerRef.current?.getBoundingClientRect();
        if (!rect) return;

        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;

        const menuWidth = 200;
        const menuHeight = 300;

        const adjustedX = x + menuWidth > rect.width ? Math.max(0, rect.width - menuWidth) : x;
        const adjustedY = y + menuHeight > rect.height ? Math.max(0, rect.height - menuHeight) : y;

        setContextMenu({
          x: Math.max(0, adjustedX),
          y: Math.max(0, adjustedY),
          item,
        });
      }, 0);
    },
    [selection]
  );

  const handleItemDragStart = useCallback(
    (e: React.DragEvent, item: FileEntry) => {
      const filePath = buildFullPath(navigation.currentPath, item.name);

      const dragData: FileDragData = {
        filePath,
        name: item.name,
        isDirectory: item.stats.isDirectory,
      };

      e.dataTransfer.setData(DRAG_DROP_MIME_TYPE, JSON.stringify(dragData));
      e.dataTransfer.effectAllowed = 'move';
    },
    [navigation.currentPath]
  );

  const handleItemDrop = useCallback(
    async (e: React.DragEvent, targetFolder: FileEntry) => {
      e.preventDefault();

      const dragData = e.dataTransfer.getData(DRAG_DROP_MIME_TYPE);
      if (!dragData || !systemApi.fileSystem) return;

      const { filePath, name }: FileDragData = JSON.parse(dragData);

      if (name === targetFolder.name) return;

      const targetPath = `${buildFullPath(navigation.currentPath, targetFolder.name)}/${name}`;

      try {
        await systemApi.fileSystem.move(filePath, targetPath);
        fileSystem.refresh();
      } catch (err) {
        fileSystem.setError(getErrorMessage(err) || 'Failed to move item');
      }
    },
    [navigation.currentPath, fileSystem]
  );

  const handleDrop = useCallback(
    async (e: React.DragEvent) => {
      e.preventDefault();
      setDragOverlay(false);

      const files = Array.from(e.dataTransfer.files);
      if (!files.length || !systemApi.fileSystem) return;

      const initialProgress: Record<string, UploadProgressItem> = {};
      files.forEach((file) => {
        initialProgress[file.name] = { loaded: 0, total: file.size, status: 'uploading' };
      });
      setUploadProgress(initialProgress);

      try {
        await Promise.all(
          files.map(async (file) => {
            const fullPath = buildFullPath(navigation.currentPath, file.name);

            try {
              const arrayBuffer = await file.arrayBuffer();
              await systemApi.fileSystem.writeFile(fullPath, (new Uint8Array(arrayBuffer)).toString());

              setUploadProgress((prev) => ({
                ...prev,
                [file.name]: { ...prev[file.name], status: 'completed' },
              }));
            } catch (err) {
              setUploadProgress((prev) => ({
                ...prev,
                [file.name]: { ...prev[file.name], status: 'error', error: getErrorMessage(err) || 'Upload failed' },
              }));
            }
          })
        );

        fileSystem.refresh();
        setTimeout(() => setUploadProgress({}), 2000);
      } catch (err) {
        fileSystem.setError(`Upload failed: ${getErrorMessage(err)}`);
        setTimeout(() => setUploadProgress({}), 5000);
      }
    },
    [navigation.currentPath, fileSystem]
  );

  const handlePaste = useCallback(async () => {
    try {
      const success = await clipboard.pasteFromClipboard();
      if (success) fileSystem.refresh();
      setContextMenu(null);
    } catch (err) {
      fileSystem.setError(getErrorMessage(err) || 'Failed to paste items');
    }
  }, [clipboard, fileSystem]);

  useKeyboardShortcuts({
    selectedItems: selection.selectedItems,
    items: fileSystem.items,
    filteredItems: search.filteredItems,
    clipboard: clipboard.clipboard,
    copyToClipboard: clipboard.copyToClipboard,
    cutToClipboard: clipboard.cutToClipboard,
    pasteFromClipboard: clipboard.pasteFromClipboard,
    handleDelete,
    handleRename,
    closeContextMenu: () => setContextMenu(null),
    setSelectedItems: selection.setSelectedItems,
    refresh: fileSystem.refresh,
  });

  useEffect(() => {
    const handleClickOutside = () => setContextMenu(null);
    if (contextMenu) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [contextMenu]);

  if (!viewModeLoaded) {
    return (
      <div className={styles.fileExplorer}>
        <div className={styles.loading}>Loading...</div>
      </div>
    );
  }

  return (
    <div className={styles.fileExplorer} ref={containerRef}>
      <Toolbar
        canGoBack={navigation.canGoBack}
        canGoForward={navigation.canGoForward}
        canGoUp={navigation.canGoUp}
        hasSelection={selection.selectedItems.size > 0}
        currentPath={navigation.currentPath}
        onGoBack={navigation.goBack}
        onGoForward={navigation.goForward}
        onGoUp={navigation.goUp}
        onGoHome={navigation.goHome}
        onRefresh={fileSystem.refresh}
        onNewItem={() => setShowNewDialog(true)}
        onDelete={handleDelete}
        onPathChange={navigation.setCurrentPath}
        onPathSubmit={navigation.navigateTo}
      />
      <Breadcrumbs currentPath={navigation.currentPath} onNavigate={navigation.navigateTo} />
      <div className={styles.controlBar}>
        <SearchBar searchQuery={search.searchQuery} onSearchChange={search.setSearchQuery} />
        <ViewSwitcher viewMode={viewMode} onViewModeChange={setViewMode} />
      </div>
      {fileSystem.error && (
        <div className={`${styles.statusBar} ${styles.error}`}>
          <span>Error: {fileSystem.error}</span>
          <button onClick={() => fileSystem.setError('')} className={styles.closeError}>
            ×
          </button>
        </div>
      )}
      <div
        className={styles.fileListContainer}
        onDragEnter={(e) => {
          e.preventDefault();
          setDragOverlay(true);
        }}
        onDragLeave={(e) => {
          e.preventDefault();
          if (e.relatedTarget instanceof Node && !e.currentTarget.contains(e.relatedTarget)) {
            setDragOverlay(false);
          }
        }}
        onDragOver={(e) => {
          e.preventDefault();
          e.dataTransfer.dropEffect = 'copy';
        }}
        onDrop={handleDrop}
        onContextMenu={(e) => {
          const target = e.target as HTMLElement;
          if (target && typeof target.closest === 'function' && !target.closest('[data-file-item]')) {
            handleContextMenu(e, null);
          }
        }}
      >
        {fileSystem.loading ? (
          <div className={styles.loading}>Loading...</div>
        ) : search.filteredItems.length === 0 ? (
          <EmptyState searchQuery={search.searchQuery} />
        ) : viewMode === 'list' ? (
          <FileList
            items={search.filteredItems}
            selectedItems={selection.selectedItems}
            sortState={sorting.sortState}
            onItemClick={selection.handleItemClick}
            onItemDoubleClick={handleItemDoubleClick}
            onItemDragStart={handleItemDragStart}
            onItemDrop={handleItemDrop}
            onContextMenu={handleContextMenu}
            onToggleSort={sorting.toggleSort}
          />
        ) : (
          <FileGrid
            items={search.filteredItems}
            selectedItems={selection.selectedItems}
            onItemClick={selection.handleItemClick}
            onItemDoubleClick={handleItemDoubleClick}
            onItemDragStart={handleItemDragStart}
            onItemDrop={handleItemDrop}
            onContextMenu={handleContextMenu}
          />
        )}
        <DragDropOverlay visible={dragOverlay} currentPath={navigation.currentPath} />
        <UploadProgress uploadProgress={uploadProgress} onClose={() => setUploadProgress({})} />
      </div>

      <StatusBar
        items={search.filteredItems}
        selectedItems={selection.selectedItems}
        error=""
        onClearError={() => {}}
      />

      <ContextMenu
        contextMenu={contextMenu}
        selectedCount={selection.selectedItems.size}
        clipboardCount={clipboard.clipboard.length}
        onRename={() => {
          const selectedItem = Array.from(selection.selectedItems)[0];
          const item = fileSystem.items.find((i) => i.name === selectedItem);
          if (item) handleRename(item);
        }}
        onCopy={() => {
          clipboard.copyToClipboard();
          setContextMenu(null);
        }}
        onCut={() => {
          clipboard.cutToClipboard();
          setContextMenu(null);
        }}
        onPaste={handlePaste}
        onDelete={handleDelete}
        onNewFile={() => {
          setShowNewDialog(true);
          setNewItemType('file');
          setContextMenu(null);
        }}
        onNewFolder={() => {
          setShowNewDialog(true);
          setNewItemType('folder');
          setContextMenu(null);
        }}
        onRefresh={() => {
          fileSystem.refresh();
          setContextMenu(null);
        }}
      />
      <NewItemDialog
        show={showNewDialog}
        itemType={newItemType}
        itemName={newItemName}
        onTypeChange={setNewItemType}
        onNameChange={setNewItemName}
        onConfirm={handleNewItem}
        onCancel={() => {
          setShowNewDialog(false);
          setNewItemName('');
        }}
      />
      <RenameDialog
        item={renameItem}
        onNameChange={(name) => setRenameItem((prev) => (prev ? { ...prev, newName: name } : null))}
        onConfirm={confirmRename}
        onCancel={() => setRenameItem(null)}
      />
      <ConfirmDialog
        show={confirmDelete.show}
        title="Confirm Delete"
        message={`Delete ${confirmDelete.count} item${confirmDelete.count > 1 ? 's' : ''}? This action cannot be undone.`}
        onConfirm={confirmDelete.onConfirm}
        onCancel={() => setConfirmDelete({ show: false, count: 0, onConfirm: () => {} })}
      />
    </div>
  );
};