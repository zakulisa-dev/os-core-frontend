import React, { FC, useEffect, useRef } from 'react';

import { ChildrenNever } from '@Interfaces/childrenNever.interface';
import { Error } from '@Components/Error/Error';
import { Loading } from '@Components/Loading/Loading';
import { ToDoItem } from '@ToDo/components/ToDoItem/ToDoItem';

import styles from './toDoList.module.css';
import useToDoStore from '@ToDo/stores/toDo.store';

const ToDoList: FC<ChildrenNever> = React.memo(() => {
  const toDoList = useToDoStore((state) => state.toDoList);
  const getFilteredTasks = useToDoStore((state) => state.getFilteredTasks);
  const getStats = useToDoStore((state) => state.getStats);
  const clearCompletedItems = useToDoStore((state) => state.clearCompletedItems);
  const currentFilter = useToDoStore((state) => state.currentFilter);
  const searchQuery = useToDoStore((state) => state.searchQuery);
  const selectedCategories = useToDoStore((state) => state.selectedCategories);
  const selectedPriorities = useToDoStore((state) => state.selectedPriorities);

  const isLoading = useToDoStore((state) => state.isToDoListLoading);
  const error = useToDoStore((state) => state.toDoListError);
  const getToDoItems = useToDoStore((state) => state.getToDoItems);

  const listRef = useRef<HTMLUListElement>(null);

  // Получаем отфильтрованные задачи
  const filteredTasks = getFilteredTasks();
  const stats = getStats();

  useEffect(() => {
    if (!listRef.current) return;
    listRef.current.scrollTop = listRef.current.scrollHeight;
  }, [toDoList.length]);

  if (isLoading) {
    return (
      <div className={styles.container}>
        <Loading/>
      </div>
    );
  }

  if (error !== '') {
    return (
      <div className={styles.container}>
        <Error refetch={getToDoItems}/>
      </div>
    );
  }

  // Показываем разные сообщения в зависимости от фильтров
  const hasActiveFilters = searchQuery || currentFilter !== 'all' ||
    selectedCategories.length > 0 || selectedPriorities.length > 0;

  if (toDoList.length === 0) {
    return (
      <div className={styles.container}>
        <div className={styles.header}>
          <h2 className={styles.title}>Задачи</h2>
        </div>
        <div className={styles.emptyState}>
          <div className={styles.emptyIcon}>📝</div>
          <h3 className={styles.emptyTitle}>Пока нет задач</h3>
          <p className={styles.emptyDescription}>Добавьте первую задачу, чтобы начать</p>
        </div>
      </div>
    );
  }

  if (filteredTasks.length === 0 && hasActiveFilters) {
    return (
      <div className={styles.container}>
        <div className={styles.header}>
          <h2 className={styles.title}>Задачи</h2>
          <div className={styles.stats}>
            <span className={styles.counter}>
              {stats.completed} из {stats.total} выполнено
            </span>
            <div className={styles.progressBar}>
              <div
                className={styles.progress}
                style={{ width: `${stats.completionRate}%` }}
              />
            </div>
            {stats.completed > 0 && (
              <button
                className={styles.clearButton}
                onClick={clearCompletedItems}
                title="Очистить выполненные"
              >
                Очистить выполненные
              </button>
            )}
          </div>
        </div>
        <div className={styles.emptyState}>
          <div className={styles.emptyIcon}>🔍</div>
          <h3 className={styles.emptyTitle}>Нет задач по фильтру</h3>
          <p className={styles.emptyDescription}>
            Попробуйте изменить параметры поиска или очистить фильтры
          </p>
        </div>
      </div>
    );
  }

  const activeTasks = filteredTasks.filter(item => !item.isComplete);
  const completedTasks = filteredTasks.filter(item => item.isComplete);

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2 className={styles.title}>
          Задачи
          {hasActiveFilters && (
            <span className={styles.filterIndicator}>
              ({filteredTasks.length} из {stats.total})
            </span>
          )}
        </h2>
        <div className={styles.stats}>
          <span className={styles.counter}>
            {stats.completed} из {stats.total} выполнено
          </span>
          <div className={styles.progressBar}>
            <div
              className={styles.progress}
              style={{ width: `${stats.completionRate}%` }}
            />
          </div>
          {stats.completed > 0 && (
            <button
              className={styles.clearButton}
              onClick={clearCompletedItems}
              title="Очистить выполненные"
            >
              Очистить выполненные
            </button>
          )}
        </div>
      </div>
      <div className={styles.content} ref={listRef}>
        {activeTasks.length > 0 && (
          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>
              Активные ({activeTasks.length})
            </h3>
            <ul className={styles.toDoItemsContainer}>
              {activeTasks.map((toDoItem) => (
                <ToDoItem key={toDoItem.id} id={toDoItem.id}/>
              ))}
            </ul>
          </div>
        )}
        {completedTasks.length > 0 && (
          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>
              Выполненные ({completedTasks.length})
            </h3>
            <ul className={styles.toDoItemsContainer}>
              {completedTasks.map((toDoItem) => (
                <ToDoItem key={toDoItem.id} id={toDoItem.id}/>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
});

ToDoList.displayName = 'ToDoList';

export { ToDoList };