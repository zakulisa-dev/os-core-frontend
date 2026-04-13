import React, { FC, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faAngleDown, faAngleUp, faCheck, faTimes, faTrashAlt } from '@fortawesome/free-solid-svg-icons';
import { useTranslation } from 'react-i18next';
import classNames from 'classnames';

import { Button } from '@Components/Button/Button';
import { ChildrenNever } from '@Interfaces/childrenNever.interface';

import styles from './toDoItem.module.css';
import useToDoStore from '@ToDo/stores/toDo.store';

interface Props extends ChildrenNever {
  id: string;
}

function isLoggedIn() {
  return false;
}

// Функция для получения preview описания
function getDescriptionPreview(description: string, maxLength: number = 100): string {
  if (description.length <= maxLength) return description;

  // Ищем последний пробел в пределах maxLength, чтобы не обрезать слово
  const truncated = description.substring(0, maxLength);
  const lastSpaceIndex = truncated.lastIndexOf(' ');

  return lastSpaceIndex > 0
    ? truncated.substring(0, lastSpaceIndex) + '...'
    : truncated + '...';
}

// eslint-disable-next-line react/display-name
const ToDoItem: FC<Props> = React.memo(({ id }: Props) => {
  const toDoItem = useToDoStore(
    (state) => state.toDoList[state.toDoList.findIndex((el) => el.id === id)],
  );
  const changeActiveToDoPage = useToDoStore((state) => state.changeActiveToDoPage);
  const deleteToDoItem = useToDoStore((state) => state.deleteToDoItem);
  const deleteToDoItemLocal = useToDoStore((state) => state.deleteToDoItemLocal);
  const updateToDoItem = useToDoStore((state) => state.updateToDoItem);
  const updateToDoItemLocal = useToDoStore((state) => state.updateToDoItemLocal);

  const [isDescriptionCollapsed, setIsDescriptionCollapsed] = useState(true);

  const { t } = useTranslation('toDo');

  function handleChangeActiveToDoPage() {
    changeActiveToDoPage(id);
  }

  function toggleIsDescriptionCollapsed() {
    setIsDescriptionCollapsed((prev) => !prev);
  }

  function handleDeleteItem() {
    if (isLoggedIn()) {
      deleteToDoItem(id);
    } else {
      deleteToDoItemLocal(id);
    }
  }

  function handleToggleToDoItem() {
    if (isLoggedIn()) {
      updateToDoItem({
        ...toDoItem,
        isComplete: !toDoItem.isComplete,
      });
    } else {
      updateToDoItemLocal({
        ...toDoItem,
        isComplete: !toDoItem.isComplete,
      });
    }
  }

  const hasDescription = Boolean(toDoItem.description?.trim());
  const isLongDescription = toDoItem.description && toDoItem.description.length > 100;
  const descriptionPreview = toDoItem.description ? getDescriptionPreview(toDoItem.description) : '';
  const showFullDescription = !isDescriptionCollapsed && hasDescription;
  const showPreviewOnly = isDescriptionCollapsed && hasDescription;

  return (
    <li
      className={classNames(styles.toDoItem, {
        [styles.completed]: toDoItem.isComplete,
        [styles.hasDescription]: hasDescription,
      })}
      data-cy="todo-item"
    >
      <motion.div
        className={styles.text}
        initial={{ y: 10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.2, ease: "easeOut" }}
      >
        <div className={styles.textRow}>
          <Button
            onClick={handleChangeActiveToDoPage}
            className={classNames(styles.textButton, {
              [styles.completed]: toDoItem.isComplete,
            })}
            aria-label={t('goToToDoEditPage')}
          >
            {toDoItem.heading}
          </Button>

          {hasDescription && (
            <Button
              className={classNames(styles.collapseButton, {
                [styles.expanded]: !isDescriptionCollapsed,
                [styles.hasLongDescription]: isLongDescription,
              })}
              onClick={toggleIsDescriptionCollapsed}
              aria-label={t('toggleCollapseDescription')}
            >
              <FontAwesomeIcon
                icon={isDescriptionCollapsed ? faAngleDown : faAngleUp}
              />
            </Button>
          )}
        </div>

        {/* Preview описания в свернутом виде */}
        {showPreviewOnly && (
          <motion.div
            className={styles.descriptionPreview}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            {descriptionPreview}
            {isLongDescription && (
              <span className={styles.expandHint}>
                {' '}
                <Button
                  className={styles.expandButton}
                  onClick={toggleIsDescriptionCollapsed}
                  aria-label={t('expandDescription')}
                >
                  читать далее
                </Button>
              </span>
            )}
          </motion.div>
        )}

        {/* Полное описание в развернутом виде */}
        <AnimatePresence initial={false}>
          {showFullDescription && (
            <motion.div
              className={styles.description}
              initial="collapsed"
              animate="open"
              exit="collapsed"
              variants={{
                open: {
                  opacity: 1,
                  height: 'auto',
                  marginTop: '0.5rem'
                },
                collapsed: {
                  opacity: 0,
                  height: 0,
                  marginTop: 0
                },
              }}
              transition={{
                duration: 0.3,
                ease: "easeInOut",
                opacity: { duration: 0.2 }
              }}
            >
              {toDoItem.description}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      <div className={styles.actionsContainer}>
        <Button
          className={classNames(styles.button, {
            [styles.checkButton]: !toDoItem.isComplete,
            [styles.uncheckButton]: toDoItem.isComplete,
          })}
          onClick={handleToggleToDoItem}
          aria-label={`${t('toggleItemWithText')} ${toDoItem.heading}`}
        >
          <FontAwesomeIcon
            icon={toDoItem.isComplete ? faTimes : faCheck}
          />
        </Button>

        <Button
          className={`${styles.button} ${styles.deleteButton}`}
          onClick={handleDeleteItem}
          aria-label={`${t('deleteItemWithText')} ${toDoItem.heading}`}
        >
          <FontAwesomeIcon icon={faTrashAlt} />
        </Button>
      </div>
    </li>
  );
});

export { ToDoItem };