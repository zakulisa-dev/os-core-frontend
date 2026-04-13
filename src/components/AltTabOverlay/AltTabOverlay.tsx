import React, { useEffect, useState, useCallback, useRef } from 'react';
import html2canvas from 'html2canvas';
import styles from './altTab.module.css';
import { Nullable, WindowId, WindowProps } from '@nameless-os/sdk';
import { systemApi } from '../../index';

interface Props {
  windows: WindowProps[];
  onSelect: (windowId: WindowId) => void;
  visible: boolean;
}

export const AltTabOverlay: React.FC<Props> = ({ windows, onSelect, visible }) => {
  const [previews, setPreviews] = useState<Record<string, string>>({});
  const [index, setIndex] = useState(0);
  const queueRef = useRef<WindowProps[]>([]);
  const busyRef = useRef(false);
  const intervalRef = useRef<Nullable<number>>(null);
  const lastEnqueueRef = useRef<number>(0);

  const captureNextPreview = useCallback(() => {
    if (busyRef.current || queueRef.current.length === 0) return;

    busyRef.current = true;
    const win = queueRef.current.shift();
    if (!win) {
      busyRef.current = false;
      return;
    }

    const el = document.querySelector(`[data-window-id="${win.id}"]`);
    if (!el) {
      busyRef.current = false;
      return;
    }

    const idleCallback = window.requestIdleCallback || ((cb: () => void) => setTimeout(cb, 1));

    idleCallback(async () => {
      try {
        const canvas = await html2canvas(el as HTMLElement, {
          backgroundColor: null,
          scale: 0.2,
          useCORS: true,
          removeContainer: true,
        });

        const dataUrl = canvas.toDataURL();
        setPreviews((prev) => ({
          ...prev,
          [win.id]: dataUrl,
        }));
      } catch (e) {
        console.warn(`Failed to capture preview for ${win.id}`, e);
      } finally {
        busyRef.current = false;
        captureNextPreview();
      }
    });
  }, []);

  const enqueueWindowsForPreview = useCallback(() => {
    const now = Date.now();
    if (now - lastEnqueueRef.current < 30000) return;
    lastEnqueueRef.current = now;

    queueRef.current = [...windows];
    captureNextPreview();
  }, [windows, captureNextPreview]);


  useEffect(() => {
    enqueueWindowsForPreview();
    intervalRef.current = window.setInterval(enqueueWindowsForPreview, 30000);

    return () => {
      if (intervalRef.current !== null) {
        clearInterval(intervalRef.current);
      }
    };
  }, [enqueueWindowsForPreview]);

  useEffect(() => {
    if (visible) {
      setIndex(0);
    }
  }, [visible]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'KeyQ' && e.altKey) {
        e.preventDefault();
        setIndex((prev) => (prev + 1) % windows.length);
      }

      if (e.code === 'ArrowRight') {
        e.preventDefault();
        setIndex((prev) => (prev + 1) % windows.length);
      }

      if (e.code === 'ArrowLeft') {
        e.preventDefault();
        setIndex((prev) => (prev - 1 + windows.length) % windows.length);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [windows, index, onSelect]);

  if (!visible || windows.length === 0) return null;

  return (
    <div className={styles.overlay}>
      {windows.map((win, i) => (
        <button
          key={win.id}
          className={`${styles.previewBox} ${i === index ? styles.focused : ''}`}
          onClick={() => onSelect(win.id)}
        >
          {previews[win.id] ? (
            <>
              <img src={previews[win.id]} alt={win.title} />
              <button
                className={styles.closeBtn}
                aria-label={`Close window ${win.title}`}
                onClick={(e) => {
                  e.stopPropagation();
                  systemApi.windowManager.closeWindow(win.id);
                }}
                tabIndex={-1}
              >
                ×
              </button>
            </>
          ) : (
            <div className={styles.placeholder}>Предпросмотр</div>
          )}
          <div className={styles.title}>{win.title}</div>
        </button>
      ))}
    </div>
  );
};
