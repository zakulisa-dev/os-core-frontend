import classNames from 'classnames';
import React, { FC } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus } from '@fortawesome/free-solid-svg-icons';

import { ChildrenNever } from '@Interfaces/childrenNever.interface';
import { Button } from '@Components/Button/Button';

import styles from './ToDoInput.module.css';
import useToDoStore from '@ToDo/stores/toDo.store';

function isLoggedIn() {
  return false;
}

// eslint-disable-next-line react/display-name
const ToDoInput: FC<ChildrenNever> = React.memo(() => {
  const addToDoItem = useToDoStore((state) => state.addToDoItem);
  const addToDoItemLocal = useToDoStore((state) => state.addToDoItemLocal);

  const { t } = useTranslation('toDo');
  const { register, getValues, handleSubmit, formState, reset, setFocus } = useForm();

  function handleAddToDo() {
    if (isLoggedIn()) {
      addToDoItem(getValues('addToDo'));
      return reset();
    }
    addToDoItemLocal(getValues('addToDo'));
    return reset();
  }

  return (
    <div className={styles.addContainer}>
      <form onSubmit={handleSubmit(handleAddToDo)} className={styles.form} aria-label={t('toDoItemCreateForm')}>
        <input
          type="text"
          className={classNames(styles.input, {
            [styles.inputError]: formState.errors?.addToDo,
          })}
          autoFocus
          required
          {...register('addToDo', {
            required: true,
          })}
          aria-label={t('headingOfNewToDoItem')}
        />
        <Button
          className={styles.addItemButton}
          aria-label={t('addToDoItem')}
          type="submit"
          onClick={() => setFocus('addToDo')}
        >
          <FontAwesomeIcon icon={faPlus} />
        </Button>
      </form>
    </div>
  );
});

export { ToDoInput };
