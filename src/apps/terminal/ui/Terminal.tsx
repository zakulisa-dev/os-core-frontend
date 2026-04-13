import React, { FC, useEffect, useRef, useState, useCallback } from 'react';
import { processTerminalInput } from '@Apps/terminal/processTerminalInput';
import styles from '@Apps/terminal/ui/terminal.module.css';
import { useTerminalStore } from '@Apps/terminal/stores/useTerminal.store';
import { AppInstanceId } from '@nameless-os/sdk';

export const Terminal: FC<{ appId: AppInstanceId }> = React.memo(({ appId }) => {
  const {
    get,
    addCommand,
    pushInputHistory,
    resetAutocomplete,
  } = useTerminalStore();

  const terminalData = get(appId);
  const entries = terminalData?.entries || [];
  const inputHistory = terminalData?.inputHistory || [];
  const currentDirectory = terminalData?.currentDirectory || '/home';

  const [currentInput, setCurrentInput] = useState('');
  const [inputHistoryIndex, setInputHistoryIndex] = useState(-1);

  const listRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const buildPrompt = useCallback((directory: string = currentDirectory) => {
    const displayPath = directory === '/home' ? '~' : directory;
    return { displayPath, fullPrompt: `root@nameless-os:${displayPath}$` };
  }, [currentDirectory]);

  const handleChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    setCurrentInput(event.target.value);
    setInputHistoryIndex(-1);
    resetAutocomplete(appId);
  }, [appId, resetAutocomplete]);

  const handleKeyDown = useCallback((event: React.KeyboardEvent<HTMLInputElement>) => {
    switch (event.key) {
      case 'ArrowUp':
        event.preventDefault();
        if (inputHistory.length > 0) {
          const newIndex = inputHistoryIndex === -1
            ? inputHistory.length - 1
            : Math.max(0, inputHistoryIndex - 1);
          setInputHistoryIndex(newIndex);
          setCurrentInput(inputHistory[newIndex] || '');
        }
        break;

      case 'ArrowDown':
        event.preventDefault();
        if (inputHistoryIndex >= 0) {
          const newIndex = inputHistoryIndex + 1;
          if (newIndex >= inputHistory.length) {
            setInputHistoryIndex(-1);
            setCurrentInput('');
          } else {
            setInputHistoryIndex(newIndex);
            setCurrentInput(inputHistory[newIndex] || '');
          }
        }
        break;

      case 'Tab':
        event.preventDefault();
        // TODO: Implement autocomplete
        break;

      case 'Escape':
        setCurrentInput('');
        setInputHistoryIndex(-1);
        break;

      case 'l':
        if (event.ctrlKey) {
          event.preventDefault();
          // TODO: Clear screen
        }
        break;

      case 'c':
        if (event.ctrlKey) {
          event.preventDefault();
          setCurrentInput('');
          setInputHistoryIndex(-1);
        }
        break;
    }
  }, [inputHistory, inputHistoryIndex]);

  const handleSubmit = useCallback((event: React.SyntheticEvent) => {
    event.preventDefault();
    const command = currentInput.trim();
    if (!command) return;

    addCommand(appId, command);

    processTerminalInput(command, appId);
    pushInputHistory(appId, command);

    setCurrentInput('');
    setInputHistoryIndex(-1);
    resetAutocomplete(appId);
  }, [currentInput, appId, addCommand, pushInputHistory, resetAutocomplete]);

  const handleTerminalClick = useCallback((event: React.MouseEvent) => {
    const selection = window.getSelection();
    if (selection && selection.toString().length > 0) {
      return;
    }

    const target = event.target as HTMLElement;
    if (target.tagName === 'SPAN' || target.tagName === 'PRE' || target.closest('pre')) {
      setTimeout(() => {
        const newSelection = window.getSelection();
        if (!newSelection || newSelection.toString().length === 0) {
          if (!terminalData?.isInputInterceptorEnabled) {
            inputRef.current?.focus();
          }
        }
      }, 100);
      return;
    }

    if (!terminalData?.isInputInterceptorEnabled) {
      inputRef.current?.focus();
    }
  }, [terminalData?.isInputInterceptorEnabled]);

  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight;
    }
  }, [entries]);

  useEffect(() => {
    if (!terminalData?.isInputInterceptorEnabled) {
      inputRef.current?.focus();
    }
  }, [terminalData?.isInputInterceptorEnabled]);

  if (!terminalData) return null;

  const { displayPath } = buildPrompt();

  return (
    // eslint-disable-next-line jsx-a11y/no-static-element-interactions
    <div className={styles.wrapper} onClick={handleTerminalClick} ref={listRef}>
      <div className={styles.content}>
        {entries.map((entry) => {
          if (entry.type === 'command') {
            const entryDisplayPath = entry.directory === '/home' ? '~' : entry.directory;
            return (
              <div key={entry.id} className={styles.entry}>
                <div className={styles.commandLine}>
                  <span className={styles.prompt}>
                    <span className={styles.user}>root@nameless-os</span>
                    <span className={styles.separator}>:</span>
                    <span className={styles.tilda}>{entryDisplayPath}</span>
                    <span className={styles.dollar}>$ </span>
                  </span>
                  <span className={styles.command}>{entry.content}</span>
                </div>
              </div>
            );
          } else {
            return (
              <div key={entry.id} className={styles.entry}>
                <pre className={`${styles.output} ${
                  entry.type === 'error' ? styles.error : ''
                }`} dangerouslySetInnerHTML={{ __html: entry.content }} />
              </div>
            );
          }
        })}
        {!terminalData.isInputInterceptorEnabled ? (
          <div className={styles.inputLine}>
            <span className={styles.prompt}>
              <span className={styles.user}>root@nameless-os</span>
              <span className={styles.separator}>:</span>
              <span className={styles.tilda}>{displayPath}</span>
              <span className={styles.dollar}>$ </span>
            </span>
            <form onSubmit={handleSubmit} className={styles.inputForm}>
              <input
                ref={inputRef}
                type="text"
                className={styles.input}
                onChange={handleChange}
                value={currentInput}
                onKeyDown={handleKeyDown}
                spellCheck={false}
                autoComplete="off"
                autoFocus
              />
            </form>
          </div>
        ) : (
          <div className={styles.inputLine}>
            <span className={styles.interceptorPrompt}>&gt; </span>
            <form onSubmit={handleSubmit} className={styles.inputForm}>
              <input
                ref={inputRef}
                type="text"
                className={styles.input}
                onChange={handleChange}
                value={currentInput}
                onKeyDown={handleKeyDown}
                spellCheck={false}
                autoComplete="off"
                autoFocus
              />
            </form>
          </div>
        )}
      </div>
    </div>
  );
});

Terminal.displayName = 'Terminal';