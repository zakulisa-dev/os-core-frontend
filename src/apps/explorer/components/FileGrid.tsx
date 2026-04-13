import { FC, useState } from 'react';
import { FileEntry } from '@nameless-os/sdk';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFile, faFolder } from '@fortawesome/free-solid-svg-icons';
import { getFileIcon } from '../utils';
import styles from '../fileExplorer.module.css';

interface FileGridProps {
  items: FileEntry[];
  selectedItems: Set<string>;
  onItemClick: (item: FileEntry, event: React.MouseEvent, index: number) => void;
  onItemDoubleClick: (item: FileEntry) => void;
  onItemDragStart: (e: React.DragEvent, item: FileEntry) => void;
  onItemDrop: (e: React.DragEvent, item: FileEntry) => void;
  onContextMenu: (event: React.MouseEvent, item: FileEntry) => void;
}

const GridFileIcon: FC<{ fileName: string; isDirectory: boolean }> = ({ fileName, isDirectory }) => {
  const [imageError, setImageError] = useState(false);

  if (isDirectory) {
    return <FontAwesomeIcon icon={faFolder} className={styles.gridIcon} />;
  }

  const customIconPath = getFileIcon(fileName);
  if (customIconPath && !imageError) {
    return (
      <img
        src={customIconPath}
        alt={fileName}
        className={styles.gridIconImage}
        onError={() => setImageError(true)}
      />
    );
  }

  return <FontAwesomeIcon icon={faFile} className={styles.gridIcon} />;
};

export const FileGrid: FC<FileGridProps> = ({
                                              items,
                                              selectedItems,
                                              onItemClick,
                                              onItemDoubleClick,
                                              onItemDragStart,
                                              onItemDrop,
                                              onContextMenu,
                                            }) => {
  return (
    <div className={styles.fileGrid}>
      {items.map((item, index) => (
        <div
          key={`${item.path}-${index}`}
          data-file-item
          className={`${styles.gridItem} ${selectedItems.has(item.name) ? styles.selected : ''}`}
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
          <div className={styles.gridItemIcon}>
            <GridFileIcon fileName={item.name} isDirectory={item.stats.isDirectory} />
          </div>
          <div className={styles.gridItemName} title={item.name}>
            {item.name}
          </div>
        </div>
      ))}
    </div>
  );
};