import React, { FC, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faSearch,
  faFilter,
  faSort,
  faTimes,
  faChevronDown,
  faChevronUp,
  faSortAmountDown,
  faSortAmountUp
} from '@fortawesome/free-solid-svg-icons';
import { useTranslation } from 'react-i18next';
import classNames from 'classnames';

import { Button } from '@Components/Button/Button';
import { ChildrenNever } from '@Interfaces/childrenNever.interface';
import useToDoStore, { FilterType, SortType } from '@ToDo/stores/toDo.store';

import styles from './ToDoFilter.module.css';

const ToDoFilter: FC<ChildrenNever> = () => {
  const searchQuery = useToDoStore((state) => state.searchQuery);
  const currentFilter = useToDoStore((state) => state.currentFilter);
  const currentSort = useToDoStore((state) => state.currentSort);
  const sortOrder = useToDoStore((state) => state.sortOrder);
  const selectedCategories = useToDoStore((state) => state.selectedCategories);
  const selectedPriorities = useToDoStore((state) => state.selectedPriorities);

  const setSearchQuery = useToDoStore((state) => state.setSearchQuery);
  const setFilter = useToDoStore((state) => state.setFilter);
  const setSort = useToDoStore((state) => state.setSort);
  const toggleSortOrder = useToDoStore((state) => state.toggleSortOrder);
  const setSelectedCategories = useToDoStore((state) => state.setSelectedCategories);
  const setSelectedPriorities = useToDoStore((state) => state.setSelectedPriorities);
  const clearAllFilters = useToDoStore((state) => state.clearAllFilters);
  const getCategories = useToDoStore((state) => state.getCategories);
  const getStats = useToDoStore((state) => state.getStats);

  const [isFilterExpanded, setIsFilterExpanded] = useState(false);
  const [isSortExpanded, setIsSortExpanded] = useState(false);

  const { t } = useTranslation('toDo');

  const stats = getStats();
  const categories = getCategories();

  const filterOptions: { value: FilterType; label: string; count: number }[] = [
    { value: 'all', label: 'Все', count: stats.total },
    { value: 'active', label: 'Активные', count: stats.active },
    { value: 'completed', label: 'Выполненные', count: stats.completed },
    { value: 'overdue', label: 'Просроченные', count: stats.overdue },
  ];

  const sortOptions: { value: SortType; label: string }[] = [
    { value: 'createdAt', label: 'По дате создания' },
    { value: 'dueDate', label: 'По сроку выполнения' },
    { value: 'priority', label: 'По приоритету' },
    { value: 'heading', label: 'По заголовку' },
    { value: 'category', label: 'По категории' },
  ];

  const priorityOptions = [
    { value: 'high' as const, label: 'Высокий', color: '#ff4444' },
    { value: 'medium' as const, label: 'Средний', color: '#ffaa00' },
    { value: 'low' as const, label: 'Низкий', color: '#00aa44' },
  ];

  function handleCategoryToggle(category: string) {
    const updated = selectedCategories.includes(category)
      ? selectedCategories.filter(c => c !== category)
      : [...selectedCategories, category];
    setSelectedCategories(updated);
  }

  function handlePriorityToggle(priority: 'low' | 'medium' | 'high') {
    const updated = selectedPriorities.includes(priority)
      ? selectedPriorities.filter(p => p !== priority)
      : [...selectedPriorities, priority];
    setSelectedPriorities(updated);
  }

  const hasActiveFilters = searchQuery || currentFilter !== 'all' ||
    selectedCategories.length > 0 || selectedPriorities.length > 0;

  return (
    <div className={styles.filterContainer}>
      {/* Поисковая строка */}
      <div className={styles.searchContainer}>
        <div className={styles.searchInputWrapper}>
          <FontAwesomeIcon icon={faSearch} className={styles.searchIcon} />
          <input
            type="text"
            className={styles.searchInput}
            placeholder="Поиск задач..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <Button
              className={styles.clearSearchButton}
              onClick={() => setSearchQuery('')}
              aria-label="Очистить поиск"
            >
              <FontAwesomeIcon icon={faTimes} />
            </Button>
          )}
        </div>
      </div>

      {/* Основные фильтры */}
      <div className={styles.quickFilters}>
        {filterOptions.map((option) => (
          <Button
            key={option.value}
            className={classNames(styles.filterButton, {
              [styles.active]: currentFilter === option.value,
              [styles.disabled]: option.count === 0,
            })}
            onClick={() => setFilter(option.value)}
            disabled={option.count === 0}
          >
            <span>{option.label}</span>
            <span className={styles.count}>{option.count}</span>
          </Button>
        ))}
      </div>

      {/* Расширенные фильтры */}
      <div className={styles.advancedFilters}>
        {/* Кнопка сортировки */}
        <div className={styles.sortContainer}>
          <Button
            className={classNames(styles.expandButton, {
              [styles.expanded]: isSortExpanded,
            })}
            onClick={() => setIsSortExpanded(!isSortExpanded)}
          >
            <FontAwesomeIcon icon={faSort} />
            <span>Сортировка</span>
            <FontAwesomeIcon
              icon={isSortExpanded ? faChevronUp : faChevronDown}
              className={styles.expandIcon}
            />
          </Button>

          {isSortExpanded && (
            <div className={styles.sortDropdown}>
              <div className={styles.sortOrder}>
                <Button
                  className={styles.sortOrderButton}
                  onClick={toggleSortOrder}
                >
                  <FontAwesomeIcon
                    icon={sortOrder === 'desc' ? faSortAmountDown : faSortAmountUp}
                  />
                  <span>{sortOrder === 'desc' ? 'По убыванию' : 'По возрастанию'}</span>
                </Button>
              </div>
              <div className={styles.sortOptions}>
                {sortOptions.map((option) => (
                  <Button
                    key={option.value}
                    className={classNames(styles.sortOption, {
                      [styles.active]: currentSort === option.value,
                    })}
                    onClick={() => setSort(option.value, sortOrder)}
                  >
                    {option.label}
                  </Button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Кнопка фильтров */}
        <div className={styles.filterDropdownContainer}>
          <Button
            className={classNames(styles.expandButton, {
              [styles.expanded]: isFilterExpanded,
              [styles.hasActiveFilters]: selectedCategories.length > 0 || selectedPriorities.length > 0,
            })}
            onClick={() => setIsFilterExpanded(!isFilterExpanded)}
          >
            <FontAwesomeIcon icon={faFilter} />
            <span>Фильтры</span>
            {(selectedCategories.length > 0 || selectedPriorities.length > 0) && (
              <span className={styles.filterCount}>
                {selectedCategories.length + selectedPriorities.length}
              </span>
            )}
            <FontAwesomeIcon
              icon={isFilterExpanded ? faChevronUp : faChevronDown}
              className={styles.expandIcon}
            />
          </Button>

          {isFilterExpanded && (
            <div className={styles.filterDropdown}>
              {/* Приоритеты */}
              {priorityOptions.length > 0 && (
                <div className={styles.filterGroup}>
                  <h4 className={styles.filterGroupTitle}>Приоритет</h4>
                  <div className={styles.filterOptions}>
                    {priorityOptions.map((priority) => (
                      <label
                        key={priority.value}
                        className={styles.filterOption}
                      >
                        <input
                          type="checkbox"
                          checked={selectedPriorities.includes(priority.value)}
                          onChange={() => handlePriorityToggle(priority.value)}
                          className={styles.checkbox}
                        />
                        <div
                          className={styles.priorityIndicator}
                          style={{ backgroundColor: priority.color }}
                        />
                        <span>{priority.label}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {/* Категории */}
              {categories.length > 0 && (
                <div className={styles.filterGroup}>
                  <h4 className={styles.filterGroupTitle}>Категории</h4>
                  <div className={styles.filterOptions}>
                    {categories.map((category) => (
                      <label
                        key={category}
                        className={styles.filterOption}
                      >
                        <input
                          type="checkbox"
                          checked={selectedCategories.includes(category)}
                          onChange={() => handleCategoryToggle(category)}
                          className={styles.checkbox}
                        />
                        <span>{category}</span>
                        <span className={styles.categoryCount}>
                          ({stats.byCategory[category] || 0})
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Кнопка сброса фильтров */}
        {hasActiveFilters && (
          <Button
            className={styles.clearFiltersButton}
            onClick={clearAllFilters}
          >
            <FontAwesomeIcon icon={faTimes} />
            <span>Сбросить</span>
          </Button>
        )}
      </div>
    </div>
  );
};

export { ToDoFilter };