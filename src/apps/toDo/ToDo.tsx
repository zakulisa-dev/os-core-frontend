import React, { FC, useEffect } from 'react';

import { ToDoList } from '@ToDo/components/ToDoList/ToDoList';
import { ToDoInput } from '@ToDo/components/ToDoInput/ToDoInput';
import { ToDoItemDetails } from '@ToDo/components/ToDoItemDetails/ToDoItemDetails';
import { TopWindowError } from '@Components/TopWindowError/TopWindowError';

import styles from './toDo.module.css';
import { AppInstanceId } from '@nameless-os/sdk';
import useToDoStore from '@ToDo/stores/toDo.store';

function isLoggedIn() {
  return false;
}

const ToDo: FC<{ instanceId: AppInstanceId }> = ({ instanceId }) => {
  const activeToDoPage = useToDoStore((state) => state.activeToDoPage);
  const addError = useToDoStore((state) => state.addError);
  const updateError = useToDoStore((state) => state.updateError);
  const getToDoItems = useToDoStore((state) => state.getToDoItems);
  const closeToDoUpdateError = useToDoStore((state) => state.closeToDoUpdateError);
  const closeToDoAddError = useToDoStore((state) => state.closeToDoAddError);

  useEffect(() => {
    if (!isLoggedIn()) {
      return;
    }
    getToDoItems();
  }, []);

  function closeErrors() {
    closeToDoUpdateError();
    closeToDoAddError();
  }

  return (
    <>
      <div className={styles.container}>
        {activeToDoPage !== '' ? (
          <ToDoItemDetails id={activeToDoPage}/>
        ) : (
          <>
            <TopWindowError handleClick={closeErrors} error={updateError || addError}/>
            <ToDoList/>
            <ToDoInput/>
          </>
        )}
      </div>
    </>
  );
};

export { ToDo };
