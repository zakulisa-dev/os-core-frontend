import { FC } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch, faTimes } from '@fortawesome/free-solid-svg-icons';
import styles from '../fileExplorer.module.css';

interface SearchBarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

export const SearchBar: FC<SearchBarProps> = ({ searchQuery, onSearchChange }) => {
  return (
    <div className={styles.searchBar}>
      <FontAwesomeIcon icon={faSearch} className={styles.searchIcon} />
      <input
        type="text"
        value={searchQuery}
        onChange={(e) => onSearchChange(e.target.value)}
        placeholder="Search in current directory..."
        className={styles.searchInput}
      />
      {searchQuery && (
        <button onClick={() => onSearchChange('')} className={styles.searchClear}>
          <FontAwesomeIcon icon={faTimes} />
        </button>
      )}
    </div>
  );
};