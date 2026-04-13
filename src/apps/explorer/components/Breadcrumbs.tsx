import { FC } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronRight } from '@fortawesome/free-solid-svg-icons';
import { pathToBreadcrumbs } from '../utils';
import styles from '../fileExplorer.module.css';

interface BreadcrumbsProps {
  currentPath: string;
  onNavigate: (path: string) => void;
}

export const Breadcrumbs: FC<BreadcrumbsProps> = ({ currentPath, onNavigate }) => {
  const breadcrumbs = pathToBreadcrumbs(currentPath);

  return (
    <div className={styles.breadcrumbs}>
      {breadcrumbs.map((segment, index) => (
        <span key={segment.path} className={styles.breadcrumbSegment}>
          <button
            className={styles.breadcrumbButton}
            onClick={() => onNavigate(segment.path)}
          >
            {segment.name}
          </button>
          {index < breadcrumbs.length - 1 && (
            <FontAwesomeIcon icon={faChevronRight} className={styles.breadcrumbSeparator} />
          )}
        </span>
      ))}
    </div>
  );
};