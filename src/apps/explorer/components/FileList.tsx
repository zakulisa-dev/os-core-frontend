import { FC } from 'react';
import { FileEntry } from '@nameless-os/sdk';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronUp, faChevronDown } from '@fortawesome/free-solid-svg-icons';
import { FileIcon } from './FileIcon';
import { formatDate, formatFileSize } from '../utils';
import { SortField, SortState } from '../types';
import styles from '../fileExplorer.module.css';
import { MouseEvent, DragEvent } from 'react';

interface FileListProps {
  items: FileEntry[];
  selectedItems: Set<string>;
  sortState: SortState;
  onItemClick: (item: FileEntry, event: MouseEvent, index: number) => void;
  onItemDoubleClick: (item: FileEntry) => void;
  onItemDragStart: (e: DragEvent, item: FileEntry) => void;
  onItemDrop: (e: DragEvent, item: FileEntry) => void;
  onContextMenu: (event: MouseEvent, item: FileEntry) => void;
  onToggleSort: (field: SortField) => void;
}

const SortIcon: FC<{ field: SortField; sortState: SortState }> = ({ field, sortState }) => {
  if (sortState.field !== field) {
    return <span className={styles.sortIconPlaceholder}></span>;
  }

  return (
    <FontAwesomeIcon
      icon={sortState.direction === 'asc' ? faChevronUp : faChevronDown}
      className={styles.sortIcon}
    />
  );
};

export const FileList: FC<FileListProps> = ({
                                              items,
                                              selectedItems,
                                              sortState,
                                              onItemClick,
                                              onItemDoubleClick,
                                              onItemDragStart,
                                              onItemDrop,
                                              onContextMenu,
                                              onToggleSort,
                                            }) => {
  return (
    <div className={styles.fileList}>
      <div className={styles.fileListHeader}>
        <button
          className={`${styles.headerButton} ${sortState.field === 'name' ? styles.activeSort : ''}`}
          onClick={() => onToggleSort('name')}
        >
          <span>Name</span>
          <SortIcon field="name" sortState={sortState} />
        </button>

        <button
          className={`${styles.headerButton} ${sortState.field === 'size' ? styles.activeSort : ''}`}
          onClick={() => onToggleSort('size')}
        >
          <span>Size</span>
          <SortIcon field="size" sortState={sortState} />
        </button>

        <button
          className={`${styles.headerButton} ${sortState.field === 'modified' ? styles.activeSort : ''}`}
          onClick={() => onToggleSort('modified')}
        >
          <span>Modified</span>
          <SortIcon field="modified" sortState={sortState} />
        </button>
      </div>

      {items.map((item, index) => (
        <div
          key={`${item.path}-${index}`}
          data-file-item
          className={`${styles.fileItem} ${selectedItems.has(item.name) ? styles.selected : ''}`}
          draggable={true}
          onDragStart={(e) => onItemDragStart(e, item)}
          onDragOver={(e) => {
            if (item.stats.isDirectory) {
              e.preventDefault();
              e.dataTransfer.dropEffect = 'move';
            }
          }}
          onDrop={(e) => {
            if (item.stats.isDirectory) {
              e.preventDefault();
              e.stopPropagation();
              onItemDrop(e, item);
            }
          }}
          onClick={(e) => onItemClick(item, e, index)}
          onDoubleClick={() => onItemDoubleClick(item)}
          onContextMenu={(e) => {
            e.stopPropagation();
            onContextMenu(e, item);
          }}
        >
          <div className={styles.itemName}>
            <FileIcon fileName={item.name} isDirectory={item.stats.isDirectory} />
            <span className={styles.itemText}>{item.name}</span>
          </div>
          <div className={styles.itemSize}>
            {item.stats.isDirectory ? '' : formatFileSize(item.stats.size)}
          </div>
          <div className={styles.itemDate}>{formatDate(+item.stats.modified)}</div>
        </div>
      ))}
    </div>
  );
};