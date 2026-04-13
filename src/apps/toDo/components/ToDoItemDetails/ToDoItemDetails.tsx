import { ChangeEvent, FC, useEffect, useRef, useState } from 'react';
import classNames from 'classnames';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faEdit,
  faSave,
  faTimes,
  faArrowLeft,
  faSpinner,
  faCheckCircle,
  faClock,
  faToggleOn,
  faToggleOff
} from '@fortawesome/free-solid-svg-icons';

import { ChildrenNever } from '@Interfaces/childrenNever.interface';
import { TopWindowError } from '@Components/TopWindowError/TopWindowError';
import { Button } from '@Components/Button/Button';

import styles from './ToDoItemDetails.module.css';
import useToDoStore from '@ToDo/stores/toDo.store';

interface Props extends ChildrenNever {
  id: string;
}

function isLoggedIn() {
  return false;
}

const ToDoItemDetails: FC<Props> = ({ id }: Props) => {
  const toDoItem = useToDoStore(
    (state) => state.toDoList[state.toDoList.findIndex((el) => el.id === id)],
  );
  const isUpdateLoading = useToDoStore((state) => state.isUpdateLoading);
  const updateError = useToDoStore((state) => state.updateError);
  const closeToDoUpdateError = useToDoStore((state) => state.closeToDoUpdateError);
  const changeActiveToDoPage = useToDoStore((state) => state.changeActiveToDoPage);
  const updateToDoItem = useToDoStore((state) => state.updateToDoItem);
  const updateToDoItemLocal = useToDoStore((state) => state.updateToDoItemLocal);

  const [text, setText] = useState(toDoItem.heading);
  const [description, setDescription] = useState(toDoItem.description);
  const [isComplete, setIsComplete] = useState(toDoItem.isComplete);
  const [isEditable, setIsEditable] = useState(false);

  const nameRef = useRef<HTMLInputElement>(null);

  const { t } = useTranslation('toDo');

  useEffect(() => {
    if (!isEditable) {
      return;
    }
    nameRef.current?.focus();
  }, [isEditable]);

  useEffect(() => {
    closeToDoUpdateError();
  }, []);

  function handleChangeName(event: ChangeEvent<HTMLInputElement>) {
    setText(event.target.value);
  }

  function handleChangeDescription(event: ChangeEvent<HTMLTextAreaElement>) {
    setDescription(event.target.value);
  }

  function handleChangeIsComplete() {
    setIsComplete((prev) => !prev);
  }

  function setIsEditableToTrue() {
    setIsEditable(true);
  }

  function handleBack() {
    closeToDoUpdateError();
    changeActiveToDoPage('');
  }

  function handleCancel() {
    setIsEditable(false);
    setText(toDoItem.heading);
    setDescription(toDoItem.description);
    setIsComplete(toDoItem.isComplete);
  }

  function handleSave() {
    if (isLoggedIn()) {
      updateToDoItem({
        id,
        description,
        heading: text,
        isComplete,
      });
    } else {
      updateToDoItemLocal({
        id,
        description,
        heading: text,
        isComplete,
      });
    }
    setIsEditable(false);
  }

  function closeUpdateError() {
    closeToDoUpdateError();
  }

  const hasUnsavedChanges =
    text !== toDoItem.heading ||
    description !== toDoItem.description ||
    isComplete !== toDoItem.isComplete;

  return (
    <>
      <TopWindowError handleClick={closeUpdateError} error={updateError} />

      <div className={styles.container}>
        {/* Header */}
        <div className={styles.header}>
          <Button
            onClick={handleBack}
            className={styles.backButton}
            aria-label={t('back')}
          >
            <FontAwesomeIcon icon={faArrowLeft} />
          </Button>

          <h2 className={styles.title}>
            {t('taskDetails')}
          </h2>

          <div className={classNames(styles.statusBadge, {
            [styles.statusCompleted]: isComplete,
            [styles.statusInProgress]: !isComplete,
          })}>
            <FontAwesomeIcon
              icon={isComplete ? faCheckCircle : faClock}
              className={styles.statusIcon}
            />
            <span>{isComplete ? t('completed') : t('inProcess')}</span>
          </div>
        </div>

        {/* Content */}
        <div className={styles.content}>
          <form className={styles.form}>
            {/* Heading */}
            <div className={styles.field}>
              <label className={styles.label}>{t('heading')}:</label>
              <input
                type="text"
                className={classNames(styles.input, {
                  [styles.inputEditable]: isEditable,
                })}
                value={text}
                onChange={handleChangeName}
                disabled={!isEditable}
                ref={nameRef}
                aria-label={t('heading')}
              />
            </div>

            {/* Description */}
            <div className={styles.field}>
              <label className={styles.label}>{t('description')}:</label>
              <textarea
                className={classNames(styles.textarea, {
                  [styles.textareaEditable]: isEditable,
                })}
                value={description}
                onChange={handleChangeDescription}
                disabled={!isEditable}
                aria-label={t('description')}
                placeholder={!description && !isEditable ? t('noDescription') : ''}
                rows={4}
              />
            </div>

            {/* Status Toggle (только в режиме редактирования) */}
            <AnimatePresence>
              {isEditable && (
                <motion.div
                  className={styles.statusToggle}
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <span className={styles.label}>{t('status')}:</span>
                  <Button
                    className={classNames(styles.toggleButton, {
                      [styles.toggleActive]: isComplete,
                    })}
                    onClick={handleChangeIsComplete}
                    aria-label={t('changeStatus')}
                  >
                    <FontAwesomeIcon
                      icon={isComplete ? faToggleOn : faToggleOff}
                      className={styles.toggleIcon}
                    />
                    <span>{isComplete ? t('completed') : t('inProcess')}</span>
                  </Button>
                </motion.div>
              )}
            </AnimatePresence>
          </form>
        </div>

        {/* Actions */}
        <div className={styles.actions}>
          <AnimatePresence mode="wait">
            {!isEditable ? (
              <motion.div
                className={styles.actionGroup}
                key="view-actions"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <Button
                  onClick={setIsEditableToTrue}
                  className={classNames(styles.actionButton, styles.editButton)}
                  aria-label={t('edit')}
                >
                  <FontAwesomeIcon icon={faEdit} />
                  <span>{t('edit')}</span>
                </Button>
              </motion.div>
            ) : (
              <motion.div
                className={styles.actionGroup}
                key="edit-actions"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <Button
                  onClick={handleCancel}
                  className={classNames(styles.actionButton, styles.cancelButton)}
                  aria-label={t('cancel')}
                  disabled={isUpdateLoading}
                >
                  <FontAwesomeIcon icon={faTimes} />
                  <span>{t('cancel')}</span>
                </Button>

                <Button
                  className={classNames(styles.actionButton, styles.saveButton, {
                    [styles.saveDisabled]: !hasUnsavedChanges || isUpdateLoading,
                  })}
                  onClick={handleSave}
                  disabled={!hasUnsavedChanges || isUpdateLoading}
                  aria-label={t('save')}
                >
                  {isUpdateLoading ? (
                    <>
                      <FontAwesomeIcon icon={faSpinner} spin />
                      <span>{t('saving')}</span>
                    </>
                  ) : (
                    <>
                      <FontAwesomeIcon icon={faSave} />
                      <span>{t('save')}</span>
                    </>
                  )}
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </>
  );
};

export { ToDoItemDetails };