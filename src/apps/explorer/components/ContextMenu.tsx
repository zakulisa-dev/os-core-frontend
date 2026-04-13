import { FC } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faEdit,
  faCopy,
  faCut,
  faPaste,
  faTrash,
  faFile,
  faFolder,
  faRefresh,
} from '@fortawesome/free-solid-svg-icons';
import { ClipboardItem, ContextMenuState } from '../types';
import styles from '../fileExplorer.module.css';

interface ContextMenuProps {
  contextMenu: ContextMenuState | null;
  selectedCount: number;
  clipboardCount: number;
  onRename: () => void;
  onCopy: () => void;
  onCut: () => void;
  onPaste: () => void;
  onDelete: () => void;
  onNewFile: () => void;
  onNewFolder: () => void;
  onRefresh: () => void;
}

export const ContextMenu: FC<ContextMenuProps> = ({
                                                    contextMenu,
                                                    selectedCount,
                                                    clipboardCount,
                                                    onRename,
                                                    onCopy,
                                                    onCut,
                                                    onPaste,
                                                    onDelete,
                                                    onNewFile,
                                                    onNewFolder,
                                                    onRefresh,
                                                  }) => {
  if (!contextMenu) return null;

  const hasSelection = selectedCount > 0;
  const canPaste = clipboardCount > 0;
  const isDirectory = contextMenu.item?.stats.isDirectory;

  return (
    <div
      className={styles.contextMenu}
      style={{
        left: contextMenu.x,
        top: contextMenu.y,
      }}
    >
      {contextMenu.item ? (
        <>
          {selectedCount === 1 && (
            <button className={styles.contextItem} onClick={onRename}>
              <FontAwesomeIcon icon={faEdit} /> Rename
            </button>
          )}
          <button className={styles.contextItem} onClick={onCopy}>
            <FontAwesomeIcon icon={faCopy} />
            Copy {selectedCount > 1 ? `${selectedCount} items` : ''}
          </button>
          <button className={styles.contextItem} onClick={onCut}>
            <FontAwesomeIcon icon={faCut} />
            Cut {selectedCount > 1 ? `${selectedCount} items` : ''}
          </button>
          {canPaste && isDirectory && (
            <>
              <div className={styles.contextSeparator}></div>
              <button className={styles.contextItem} onClick={onPaste}>
                <FontAwesomeIcon icon={faPaste} />
                Paste {clipboardCount} item{clipboardCount > 1 ? 's' : ''}
              </button>
            </>
          )}
          <div className={styles.contextSeparator}></div>
          <button className={styles.contextItem} onClick={onDelete}>
            <FontAwesomeIcon icon={faTrash} />
            Delete {selectedCount > 1 ? `${selectedCount} items` : ''}
          </button>
        </>
      ) : (
        <>
          {canPaste && (
            <>
              <button className={styles.contextItem} onClick={onPaste}>
                <FontAwesomeIcon icon={faPaste} />
                Paste {clipboardCount} item{clipboardCount > 1 ? 's' : ''}
              </button>
              <div className={styles.contextSeparator}></div>
            </>
          )}
          <button className={styles.contextItem} onClick={onNewFile}>
            <FontAwesomeIcon icon={faFile} /> New File
          </button>
          <button className={styles.contextItem} onClick={onNewFolder}>
            <FontAwesomeIcon icon={faFolder} /> New Folder
          </button>
          <div className={styles.contextSeparator}></div>
          <button className={styles.contextItem} onClick={onRefresh}>
            <FontAwesomeIcon icon={faRefresh} /> Refresh
          </button>
        </>
      )}
    </div>
  );
};