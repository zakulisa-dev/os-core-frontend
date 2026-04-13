// FilePicker.tsx
import React, { useState, useEffect, useCallback, useRef, JSX } from 'react';
import { createPortal } from 'react-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faArrowLeft,
  faArrowRight,
  faArrowUp,
  faFile,
  faFolder,
  faHome,
  faRefresh,
  faTimes,
  faSearch,
  faClock,
  faCheck
} from '@fortawesome/free-solid-svg-icons';
import { FileEntry, getErrorMessage } from '@nameless-os/sdk';
import styles from './filePicker.module.css';
import { systemApi } from '../../index';

export interface RecentFile {
  path: string;
  name: string;
  lastAccessed: number;
}

export interface FilePickerProps {
  isOpen: boolean;
  onFileSelect: (filePath: string) => void;
  onCancel: () => void;

  // Filter options
  fileExtensions?: string[]; // ['.txt', '.js', '.md'] or null for all files
  allowDirectories?: boolean;

  // UI customization
  title?: string;
  startPath?: string;
  showRecentFiles?: boolean;
  recentFilesKey?: string; // localStorage key for recent files

  // Modes
  mode?: 'open' | 'save';
  defaultFileName?: string;
}

interface FilePickerState {
  currentPath: string;
  files: FileEntry[];
  loading: boolean;
  error: string;
  selectedFile: string;
  history: string[];
  historyIndex: number;
  recentFiles: RecentFile[];
  searchQuery: string;
  view: 'browser' | 'recent';
}

// Utility class for managing recent files
export class RecentFilesManager {
  static save(key: string, filePath: string, maxItems: number = 10): void {
    try {
      const existing = this.get(key);
      const fileName = filePath.split('/').pop() || '';

      // Remove existing entry if present
      const filtered = existing.filter(item => item.path !== filePath);

      // Add new entry at the beginning
      const newEntry: RecentFile = {
        path: filePath,
        name: fileName,
        lastAccessed: Date.now()
      };

      filtered.unshift(newEntry);

      // Keep only maxItems
      const trimmed = filtered.slice(0, maxItems);

      localStorage.setItem(key, JSON.stringify(trimmed));
    } catch (error) {
      console.warn('Failed to save recent file:', error);
    }
  }

  static get(key: string): RecentFile[] {
    try {
      const stored = localStorage.getItem(key);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.warn('Failed to load recent files:', error);
      return [];
    }
  }

  static clear(key: string): void {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.warn('Failed to clear recent files:', error);
    }
  }
}

const FilePicker: React.FC<FilePickerProps> = ({
                                                 isOpen,
                                                 onFileSelect,
                                                 onCancel,
                                                 fileExtensions = null,
                                                 allowDirectories = false,
                                                 title = 'Select File',
                                                 startPath = '/home',
                                                 showRecentFiles = true,
                                                 recentFilesKey = 'recentFiles',
                                                 mode = 'open',
                                                 defaultFileName = ''
                                               }) => {
  const [state, setState] = useState<FilePickerState>({
    currentPath: startPath,
    files: [],
    loading: false,
    error: '',
    selectedFile: defaultFileName,
    history: [startPath],
    historyIndex: 0,
    recentFiles: [],
    searchQuery: '',
    view: showRecentFiles ? 'recent' : 'browser'
  });

  const searchInputRef = useRef<HTMLInputElement>(null);

  // Простая блокировка кликов через overlay
  const handleOverlayClick = useCallback((e: React.MouseEvent) => {
    // Закрываем только при клике на сам overlay, а не на содержимое диалога
    if (e.target === e.currentTarget) {
      onCancel();
    }
  }, [onCancel]);

  // Предотвращение всплытия от самого диалога
  const handleDialogClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
  }, []);

  // Блокировка глобальных горячих клавиш
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      onCancel();
    }
    // Блокируем все остальные глобальные клавиши
    e.stopPropagation();
  }, [onCancel]);

  // Эффект для блокировки событий на всей странице
  useEffect(() => {
    if (!isOpen) return;

    // Блокируем скролл страницы
    document.body.style.overflow = 'hidden';

    // Добавляем обработчик клавиш
    document.addEventListener('keydown', handleKeyDown, true);

    return () => {
      // Восстанавливаем скролл
      document.body.style.overflow = '';
      // Убираем обработчик
      document.removeEventListener('keydown', handleKeyDown, true);
    };
  }, [isOpen, handleKeyDown]);

  // Load directory contents
  const loadDirectory = useCallback(async (path: string): Promise<void> => {
    if (!systemApi.fileSystem) {
      setState(prev => ({ ...prev, error: 'File system not available' }));
      return;
    }

    setState(prev => ({ ...prev, loading: true, error: '' }));

    try {
      const entries = await systemApi.fileSystem.readDir(path);

      // Filter files based on extensions and directory settings
      const filtered = entries.filter(entry => {
        if (entry.stats.isDirectory) {
          return true; // Always show directories for navigation
        }

        if (!allowDirectories && entry.stats.isDirectory) {
          return false;
        }

        if (fileExtensions && fileExtensions.length > 0) {
          const ext = '.' + entry.name.split('.').pop()?.toLowerCase();
          return fileExtensions.includes(ext);
        }

        return true;
      });

      // Sort: directories first, then files alphabetically
      filtered.sort((a, b) => {
        if (a.stats.isDirectory && !b.stats.isDirectory) return -1;
        if (!a.stats.isDirectory && b.stats.isDirectory) return 1;
        return a.name.localeCompare(b.name);
      });

      setState(prev => ({ ...prev, files: filtered, loading: false }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: getErrorMessage(error) || 'Failed to load directory',
        loading: false
      }));
    }
  }, [fileExtensions, allowDirectories]);

  // Load recent files
  const loadRecentFiles = useCallback((): void => {
    const recent = RecentFilesManager.get(recentFilesKey);
    setState(prev => ({ ...prev, recentFiles: recent }));
  }, [recentFilesKey]);

  // Navigation functions
  const navigateTo = useCallback((path: string): void => {
    setState(prev => {
      if (path === prev.currentPath) return prev;

      const newHistory = prev.history.slice(0, prev.historyIndex + 1);
      newHistory.push(path);

      return {
        ...prev,
        currentPath: path,
        history: newHistory,
        historyIndex: newHistory.length - 1,
        view: 'browser'
      };
    });
  }, []);

  const goBack = useCallback((): void => {
    setState(prev => {
      if (prev.historyIndex <= 0) return prev;

      const newIndex = prev.historyIndex - 1;
      return {
        ...prev,
        currentPath: prev.history[newIndex],
        historyIndex: newIndex,
        view: 'browser'
      };
    });
  }, []);

  const goForward = useCallback((): void => {
    setState(prev => {
      if (prev.historyIndex >= prev.history.length - 1) return prev;

      const newIndex = prev.historyIndex + 1;
      return {
        ...prev,
        currentPath: prev.history[newIndex],
        historyIndex: newIndex,
        view: 'browser'
      };
    });
  }, []);

  const goUp = useCallback((): void => {
    setState(prev => {
      if (prev.currentPath === '/') return prev;

      const parentPath = prev.currentPath.split('/').slice(0, -1).join('/') || '/';
      navigateTo(parentPath);
      return prev;
    });
  }, [navigateTo]);

  const goHome = useCallback((): void => {
    navigateTo('/home');
  }, [navigateTo]);

  // File selection handlers
  const handleFileClick = useCallback((file: FileEntry): void => {
    if (file.stats.isDirectory) {
      const newPath = state.currentPath === '/'
        ? `/${file.name}`
        : `${state.currentPath}/${file.name}`;
      navigateTo(newPath);
    } else {
      setState(prev => ({ ...prev, selectedFile: file.name }));
    }
  }, [state.currentPath, navigateTo]);

  const handleFileDoubleClick = useCallback((file: FileEntry): void => {
    if (file.stats.isDirectory) {
      const newPath = state.currentPath === '/'
        ? `/${file.name}`
        : `${state.currentPath}/${file.name}`;
      navigateTo(newPath);
    } else {
      const fullPath = state.currentPath === '/'
        ? `/${file.name}`
        : `${state.currentPath}/${file.name}`;

      // Save to recent files
      RecentFilesManager.save(recentFilesKey, fullPath);
      onFileSelect(fullPath);
    }
  }, [state.currentPath, navigateTo, recentFilesKey, onFileSelect]);

  const handleRecentFileSelect = useCallback((recentFile: RecentFile): void => {
    RecentFilesManager.save(recentFilesKey, recentFile.path);
    onFileSelect(recentFile.path);
  }, [recentFilesKey, onFileSelect]);

  const handleConfirm = useCallback((): void => {
    if (mode === 'save' && state.selectedFile.trim()) {
      const fullPath = state.currentPath === '/'
        ? `/${state.selectedFile}`
        : `${state.currentPath}/${state.selectedFile}`;

      RecentFilesManager.save(recentFilesKey, fullPath);
      onFileSelect(fullPath);
      return;
    }

    if (mode === 'open' && state.selectedFile) {
      const fullPath = state.currentPath === '/'
        ? `/${state.selectedFile}`
        : `${state.currentPath}/${state.selectedFile}`;

      RecentFilesManager.save(recentFilesKey, fullPath);
      onFileSelect(fullPath);
    }
  }, [mode, state.selectedFile, state.currentPath, recentFilesKey, onFileSelect]);

  // Search functionality
  const filteredFiles = state.files.filter(file =>
    file.name.toLowerCase().includes(state.searchQuery.toLowerCase())
  );

  const filteredRecentFiles = state.recentFiles.filter(file =>
    file.name.toLowerCase().includes(state.searchQuery.toLowerCase()) ||
    file.path.toLowerCase().includes(state.searchQuery.toLowerCase())
  );

  // Effects
  useEffect(() => {
    if (isOpen && state.view === 'browser') {
      loadDirectory(state.currentPath);
    }
  }, [isOpen, state.currentPath, state.view, loadDirectory]);

  useEffect(() => {
    if (isOpen && showRecentFiles) {
      loadRecentFiles();
    }
  }, [isOpen, showRecentFiles, loadRecentFiles]);

  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isOpen]);

  const getFileIcon = (fileName: string, isDirectory: boolean): JSX.Element => {
    if (isDirectory) {
      return <FontAwesomeIcon icon={faFolder} className={styles.folderIcon} />;
    }

    const ext = fileName.split('.').pop()?.toLowerCase();
    const iconPath = getCustomFileIcon(ext);

    if (iconPath) {
      return (
        <img
          src={iconPath}
          alt={fileName}
          className={styles.customFileIcon}
          onError={(e) => {
            e.currentTarget.style.display = 'none';
            e.currentTarget.nextElementSibling?.setAttribute('style', 'display: inline');
          }}
        />
      );
    }

    return <FontAwesomeIcon icon={faFile} className={styles.fileIcon} />;
  };

  const getCustomFileIcon = (extension?: string): string | null => {
    if (!extension) return null;

    const iconMap: Record<string, string> = {
      'js': 'assets/images/fileExt/js.svg',
      'jsx': 'assets/images/fileExt/js.svg',
      'ts': 'assets/images/fileExt/ts.svg',
      'tsx': 'assets/images/fileExt/ts.svg',
      'jpg': 'assets/images/fileExt/image.svg',
      'jpeg': 'assets/images/fileExt/image.svg',
      'png': 'assets/images/fileExt/image.svg',
      'gif': 'assets/images/fileExt/image.svg',
      'mp4': 'assets/images/fileExt/video.svg',
      'avi': 'assets/images/fileExt/video.svg',
      'mkv': 'assets/images/fileExt/video.svg'
    };

    return iconMap[extension] || null;
  };

  const formatDate = (timestamp: number): string => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(timestamp));
  };

  if (!isOpen) {
    return null;
  }

  const modalContent = (
    <div
      className={styles.overlay}
      onClick={handleOverlayClick}
    >
      <div
        className={styles.filePicker}
        onClick={handleDialogClick}
      >
        <div className={styles.header}>
          <h3 className={styles.title}>{title}</h3>
          <button onClick={onCancel} className={styles.closeButton}>
            <FontAwesomeIcon icon={faTimes} />
          </button>
        </div>
        <div className={styles.toolbar}>
          <div className={styles.navButtons}>
            <button
              className={styles.navBtn}
              onClick={goBack}
              disabled={state.historyIndex === 0}
              title="Back"
            >
              <FontAwesomeIcon icon={faArrowLeft} />
            </button>
            <button
              className={styles.navBtn}
              onClick={goForward}
              disabled={state.historyIndex >= state.history.length - 1}
              title="Forward"
            >
              <FontAwesomeIcon icon={faArrowRight} />
            </button>
            <button
              className={styles.navBtn}
              onClick={goUp}
              disabled={state.currentPath === '/'}
              title="Up"
            >
              <FontAwesomeIcon icon={faArrowUp} />
            </button>
            <button className={styles.navBtn} onClick={goHome} title="Home">
              <FontAwesomeIcon icon={faHome} />
            </button>
            <button
              className={styles.navBtn}
              onClick={() => loadDirectory(state.currentPath)}
              title="Refresh"
            >
              <FontAwesomeIcon icon={faRefresh} />
            </button>
          </div>
          <div className={styles.viewToggle}>
            {showRecentFiles && (
              <>
                <button
                  className={`${styles.toggleBtn} ${state.view === 'recent' ? styles.active : ''}`}
                  onClick={() => setState(prev => ({ ...prev, view: 'recent' }))}
                >
                  <FontAwesomeIcon icon={faClock} />
                  Recent
                </button>
                <button
                  className={`${styles.toggleBtn} ${state.view === 'browser' ? styles.active : ''}`}
                  onClick={() => setState(prev => ({ ...prev, view: 'browser' }))}
                >
                  <FontAwesomeIcon icon={faFolder} />
                  Browse
                </button>
              </>
            )}
          </div>
        </div>
        {state.view === 'browser' && (
          <div className={styles.addressBar}>
            <input
              type="text"
              value={state.currentPath}
              onChange={(e) => setState(prev => ({ ...prev, currentPath: e.target.value }))}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  navigateTo(e.currentTarget.value);
                }
              }}
              className={styles.pathInput}
              placeholder="Enter path..."
            />
          </div>
        )}
        <div className={styles.searchBar}>
          <div className={styles.searchContainer}>
            <FontAwesomeIcon icon={faSearch} className={styles.searchIcon} />
            <input
              ref={searchInputRef}
              type="text"
              value={state.searchQuery}
              onChange={(e) => setState(prev => ({ ...prev, searchQuery: e.target.value }))}
              className={styles.searchInput}
              placeholder="Search files..."
            />
          </div>
        </div>
        {state.error && (
          <div className={styles.errorBar}>
            <span>{state.error}</span>
            <button
              onClick={() => setState(prev => ({ ...prev, error: '' }))}
              className={styles.closeError}
            >
              <FontAwesomeIcon icon={faTimes} />
            </button>
          </div>
        )}
        <div className={styles.content}>
          {state.loading ? (
            <div className={styles.loading}>Loading...</div>
          ) : state.view === 'recent' ? (
            <div className={styles.recentFiles}>
              {filteredRecentFiles.length === 0 ? (
                <div className={styles.emptyState}>
                  {state.searchQuery ? 'No recent files match your search' : 'No recent files'}
                </div>
              ) : (
                filteredRecentFiles.map((recentFile, index) => (
                  <div
                    key={index}
                    className={styles.recentFileItem}
                    onClick={() => handleRecentFileSelect(recentFile)}
                  >
                    <div className={styles.recentFileIcon}>
                      {getFileIcon(recentFile.name, false)}
                    </div>
                    <div className={styles.recentFileInfo}>
                      <div className={styles.recentFileName}>{recentFile.name}</div>
                      <div className={styles.recentFilePath}>{recentFile.path}</div>
                    </div>
                    <div className={styles.recentFileDate}>
                      {formatDate(recentFile.lastAccessed)}
                    </div>
                  </div>
                ))
              )}
            </div>
          ) : (
            <div className={styles.fileList}>
              {filteredFiles.length === 0 ? (
                <div className={styles.emptyState}>
                  {state.searchQuery ? 'No files match your search' : 'No files in this directory'}
                </div>
              ) : (
                filteredFiles.map((file, index) => (
                  <div
                    key={index}
                    className={`${styles.fileItem} ${
                      state.selectedFile === file.name ? styles.selected : ''
                    }`}
                    onClick={() => handleFileClick(file)}
                    onDoubleClick={() => handleFileDoubleClick(file)}
                  >
                    <div className={styles.fileItemIcon}>
                      {getFileIcon(file.name, file.stats.isDirectory)}
                    </div>
                    <div className={styles.fileItemName}>{file.name}</div>
                    {!file.stats.isDirectory && (
                      <div className={styles.fileItemSize}>
                        {formatFileSize(file.stats.size)}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          )}
        </div>
        <div className={styles.footer}>
          {mode === 'save' && (
            <div className={styles.fileNameInput}>
              <label htmlFor="fileName">File name:</label>
              <input
                id="fileName"
                type="text"
                value={state.selectedFile}
                onChange={(e) => setState(prev => ({ ...prev, selectedFile: e.target.value }))}
                className={styles.fileNameField}
                placeholder="Enter file name..."
              />
            </div>
          )}
          <div className={styles.footerButtons}>
            <button onClick={onCancel} className={styles.cancelButton}>
              Cancel
            </button>
            <button
              onClick={handleConfirm}
              disabled={!state.selectedFile.trim()}
              className={styles.confirmButton}
            >
              <FontAwesomeIcon icon={faCheck} />
              {mode === 'save' ? 'Save' : 'Open'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};

const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
};

export { FilePicker };