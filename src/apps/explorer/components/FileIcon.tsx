import { FC } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFile, faFolder } from '@fortawesome/free-solid-svg-icons';
import { getFileIcon } from '../utils';
import styles from '../fileExplorer.module.css';

interface FileIconProps {
  fileName: string;
  isDirectory: boolean;
}

export const FileIcon: FC<FileIconProps> = ({ fileName, isDirectory }) => {
  if (isDirectory) {
    return <FontAwesomeIcon icon={faFolder} className={`${styles.fileIcon} ${styles.folder}`} />;
  }

  const customIconPath = getFileIcon(fileName);
  if (customIconPath) {
    return (
      <img
        src={customIconPath}
        alt={fileName}
        className={`${styles.fileIcon} ${styles.customIcon}`}
        onError={(e) => {
          const target = e.target as HTMLImageElement;
          target.style.display = 'none';
          const fallback = target.nextSibling as HTMLElement;
          if (fallback) fallback.style.display = 'inline';
        }}
      />
    );
  }

  return <FontAwesomeIcon icon={faFile} className={`${styles.fileIcon} ${styles.file}`} />;
};