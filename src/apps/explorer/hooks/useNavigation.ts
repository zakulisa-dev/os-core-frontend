import { useCallback, useState } from 'react';

export const useNavigation = () => {
  const [currentPath, setCurrentPath] = useState('/home');
  const [history, setHistory] = useState(['/home']);
  const [historyIndex, setHistoryIndex] = useState(0);

  const navigateTo = useCallback((path: string) => {
    if (path !== currentPath) {
      const newHistory = history.slice(0, historyIndex + 1);
      newHistory.push(path);
      setHistory(newHistory);
      setHistoryIndex(newHistory.length - 1);
      setCurrentPath(path);
    }
  }, [currentPath, history, historyIndex]);

  const goBack = useCallback(() => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      setHistoryIndex(newIndex);
      setCurrentPath(history[newIndex]);
    }
  }, [historyIndex, history]);

  const goForward = useCallback(() => {
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1;
      setHistoryIndex(newIndex);
      setCurrentPath(history[newIndex]);
    }
  }, [historyIndex, history]);

  const goUp = useCallback(() => {
    if (currentPath !== '/') {
      const parentPath = currentPath.split('/').slice(0, -1).join('/') || '/';
      navigateTo(parentPath);
    }
  }, [currentPath, navigateTo]);

  const goHome = useCallback(() => {
    navigateTo('/home');
  }, [navigateTo]);

  const canGoBack = historyIndex > 0;
  const canGoForward = historyIndex < history.length - 1;
  const canGoUp = currentPath !== '/';

  return {
    currentPath,
    setCurrentPath,
    navigateTo,
    goBack,
    goForward,
    goUp,
    goHome,
    canGoBack,
    canGoForward,
    canGoUp,
  };
};