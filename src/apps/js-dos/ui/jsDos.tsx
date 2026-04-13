import React, { useEffect, useRef, useState } from 'react';
import { CoreAPI } from '@nameless-os/sdk';
import styles from './jsDos.module.css';

// Типы для JS-DOS
declare global {
  interface Window {
    Dos: any;
  }
}

interface JSDosEmulatorProps {
  executablePath?: string;
  gameTitle?: string;
  dosboxConfig?: string;
  systemApi: CoreAPI;
}

interface DosInstance {
  fs: any;
  main: (args: string[]) => void;
  exit: () => void;
}

export const JSDosEmulator: React.FC<JSDosEmulatorProps> = ({
                                                              executablePath,
                                                              gameTitle,
                                                              dosboxConfig,
                                                              systemApi
                                                            }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const dosInstanceRef = useRef<DosInstance | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState('Initializing...');

  useEffect(() => {
    initializeDOS();

    return () => {
      // Cleanup при размонтировании
      if (dosInstanceRef.current) {
        dosInstanceRef.current.exit();
        dosInstanceRef.current = null;
      }
    };
  }, []);

  const initializeDOS = async () => {
    if (!canvasRef.current) return;

    try {
      setStatus('Loading JS-DOS...');

      // Загружаем JS-DOS если не загружен
      if (typeof window.Dos === 'undefined') {
        await loadJSDosLibrary();
      }

      setStatus('Initializing DOS environment...');

      console.log('Canvas element:', canvasRef.current);
      console.log('Starting Dos constructor...');

      // Инициализируем DOS (v8 API) - упрощенно, без файлов пока
      const dos = await window.Dos(canvasRef.current, {
        // Пустая конфигурация - просто DOS prompt
      });

      console.log('Dos instance created:', dos);

      // В v8 возвращается объект с методами
      const dosInstance = {
        fs: dos.fs || null,
        main: dos.main || (() => {}),
        exit: () => dos.exit && dos.exit()
      };

      dosInstanceRef.current = dosInstance;

      console.log('DOS initialization complete');
      setStatus('DOS ready. Use file picker to load programs.');
      setIsLoading(false);

    } catch (err) {
      console.error('DOS initialization failed:', err);
      setError(err instanceof Error ? err.message : 'Failed to initialize DOS');
      setIsLoading(false);
    }
  };

  const loadJSDosLibrary = async (): Promise<void> => {
    // Список CDN для резерва (официальные v8 ссылки)
    const cdnUrls = [
      'https://v8.js-dos.com/latest/js-dos.js',
      'https://cdn.jsdelivr.net/npm/js-dos@8/dist/js-dos.js',
      'https://unpkg.com/js-dos@8/dist/js-dos.js'
    ];

    // Проверяем не загружен ли уже
    if (document.querySelector('script[data-jsdos-loaded]') && typeof window.Dos !== 'undefined') {
      return;
    }

    for (const url of cdnUrls) {
      try {
        console.log(`Trying to load JS-DOS from: ${url}`);
        await loadScript(url);
        // Ждем немного чтобы библиотека инициализировалась
        await new Promise(resolve => setTimeout(resolve, 300));

        if (typeof window.Dos !== 'undefined') {
          console.log('JS-DOS loaded successfully from:', url);
          return;
        }
      } catch (err) {
        console.warn(`Failed to load JS-DOS from ${url}:`, err);
        // Удаляем неудачный скрипт
        const failedScript = document.querySelector(`script[src="${url}"]`);
        if (failedScript) {
          failedScript.remove();
        }
      }
    }

    throw new Error('Failed to load JS-DOS from all CDN sources. Check browser console for details.');
  };

  const loadScript = (src: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = src;
      script.setAttribute('data-jsdos-loaded', 'true');
      script.async = true;

      script.onload = () => resolve();
      script.onerror = () => reject(new Error(`Failed to load script: ${src}`));

      document.head.appendChild(script);

      // Timeout через 10 секунд
      setTimeout(() => {
        reject(new Error(`Script loading timeout: ${src}`));
      }, 10000);
    });
  };

  const loadAndRunExecutable = async (dosInstance: DosInstance) => {
    if (!executablePath) return;

    try {
      setStatus('Loading program files...');

      // Читаем файл из файловой системы OS
      const fileData = await systemApi.fileSystem.readFile(executablePath);

      if (executablePath.endsWith('.zip')) {
        // Если это ZIP архив
        setStatus('Extracting archive...');
        await dosInstance.fs.extract(new Uint8Array(fileData));

        // Пытаемся найти main executable в архиве
        const executableName = await findMainExecutable(dosInstance.fs);
        if (executableName) {
          setStatus(`Running ${executableName}...`);
          dosInstance.main(["-c", executableName]);
        } else {
          // Если не нашли exe, просто загружаемся в DOS
          setStatus('Archive extracted. Ready for commands.');
          dosInstance.main([]);
        }
      } else {
        // Если это отдельный исполняемый файл
        const fileName = executablePath.split('/').pop() || 'program.exe';
        setStatus(`Loading ${fileName}...`);

        // Записываем файл в виртуальную файловую систему DOS
        await dosInstance.fs.writeFile(fileName, new Uint8Array(fileData));

        setStatus(`Running ${fileName}...`);
        dosInstance.main(["-c", fileName]);
      }

      setIsLoading(false);
    } catch (err) {
      console.error('Failed to load executable:', err);
      setError(err instanceof Error ? err.message : 'Failed to load program');
      setIsLoading(false);
    }
  };

  const findMainExecutable = async (fs: any): Promise<string | null> => {
    try {
      // Простой поиск .exe файлов в корне
      const files = await fs.readdir('/');
      const executables = files.filter((file: string) =>
        file.toLowerCase().endsWith('.exe') ||
        file.toLowerCase().endsWith('.com') ||
        file.toLowerCase().endsWith('.bat')
      );

      // Приоритет: .exe > .com > .bat
      return executables.find((file: string) => file.toLowerCase().endsWith('.exe')) ||
        executables.find((file: string) => file.toLowerCase().endsWith('.com')) ||
        executables.find((file: string) => file.toLowerCase().endsWith('.bat')) ||
        null;
    } catch {
      return null;
    }
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setIsLoading(true);
      setStatus('Loading selected file...');

      // В v8 проще работать с .jsdos бандлами
      if (file.name.endsWith('.jsdos')) {
        // Перезапускаем DOS с новым бандлом
        if (dosInstanceRef.current) {
          dosInstanceRef.current.exit();
        }

        const fileUrl = URL.createObjectURL(file);
        const dos = await window.Dos(canvasRef.current, {
          url: fileUrl
        });

        dosInstanceRef.current = {
          fs: dos.fs || null,
          main: dos.main || (() => {}),
          exit: () => dos.exit && dos.exit()
        };

        setStatus('Bundle loaded successfully');
      } else {
        // Для других файлов пока просто сообщение
        setStatus('For v8, please use .jsdos bundle files. Convert your files using js-dos studio.');
        setTimeout(() => {
          setStatus('Ready - use .jsdos bundles for best compatibility');
        }, 3000);
      }

      setIsLoading(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load file');
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    if (dosInstanceRef.current) {
      dosInstanceRef.current.exit();
      dosInstanceRef.current = null;
    }
    setIsLoading(true);
    setError(null);
    setStatus('Resetting...');
    setTimeout(() => {
      initializeDOS();
    }, 500);
  };

  if (error) {
    return (
      <div className={styles.errorContainer}>
        <div className={styles.errorIcon}>❌ Error</div>
        <div className={styles.errorMessage}>{error}</div>
        <div className={styles.errorActions}>
          <button
            onClick={handleReset}
            className={styles.retryButton}
          >
            Reset DOS
          </button>
          <button
            onClick={() => window.location.reload()}
            className={styles.reloadButton}
          >
            Reload Page
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {isLoading && (
        <div className={styles.loadingOverlay}>
          <div className={styles.spinner}></div>
          <div className={styles.status}>{status}</div>
        </div>
      )}

      {/* Toolbar */}
      <div className={styles.toolbar}>
        <input
          type="file"
          accept=".jsdos,.exe,.com,.bat,.zip"
          onChange={handleFileSelect}
          className={styles.fileInput}
          disabled={isLoading}
        />
        <button
          onClick={handleReset}
          className={styles.resetButton}
          disabled={isLoading}
          title="Reset DOS environment"
        >
          🔄 Reset
        </button>
        <div className={styles.gameTitle}>
          {gameTitle || 'JS-DOS Emulator'}
        </div>
      </div>

      {/* DOS Canvas */}
      <div className={styles.canvasContainer}>
        <canvas
          ref={canvasRef}
          className={styles.canvas}
        />
      </div>

      {/* Status bar */}
      <div className={styles.statusBar}>
        <span>F11 - Fullscreen | Ctrl+F10 - Mouse capture | Ctrl+Alt+F12 - Exit</span>
        <span>{isLoading ? status : 'Ready'}</span>
      </div>
    </div>
  );
};