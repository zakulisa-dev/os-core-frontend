import React, { FC, useMemo, useRef, useState } from 'react';
import { Resizable } from 're-resizable';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes, faWindowMinimize, faWindowRestore } from '@fortawesome/free-solid-svg-icons';
import { WindowProps } from '@nameless-os/sdk';
import { Button } from '@Components/Button/Button';

import styles from './window.module.css';
import { useDragNDrop } from '@Hooks';
import { systemApi } from '../../index';

interface Props {
  windowProps: WindowProps;
}

export const Window: FC<Props> = ({ windowProps }: Props) => {
  const windowTop = useRef<HTMLDivElement>(null);
  const ref = useRef<HTMLDivElement>(null);

  const { width, height } = windowProps.size;
  const { top, left } = windowProps.position;
  const [position, setPosition] = useState({ left, top });
  const [size, setSize] = useState({ width, height });

  const MemoizedContent = useMemo(() => {
    return React.createElement(windowProps.component);
  }, [windowProps.id]);

  const { startDrag, transform } = useDragNDrop({
    ref,
    initialPosition: position,
    onDrop: (pos) => {
      systemApi.windowManager.moveWindow(windowProps.id, pos);
      setPosition(pos);
    },
  });

  const handleClose = () => {
    systemApi.app.stopApp(windowProps.appInstanceId);
  }

  return (
    <>
      {!windowProps.minimized && (
        // eslint-disable-next-line jsx-a11y/no-static-element-interactions
        <div
          data-window-id={windowProps.id}
          className={styles.window}
          style={{
            top: windowProps.fullscreen ? 0 : position.top,
            left: windowProps.fullscreen ? 0 : position.left,
            zIndex: windowProps.fullscreen ? 1000000 : windowProps.zIndex,
            border: windowProps.fullscreen ? 'none' : '3px solid #343030',
            width: windowProps.fullscreen ? '100%' : size.width,
            height: windowProps.fullscreen ? '100%' : size.height,
            transform,
          }}
          ref={ref}
          onMouseDown={() => systemApi.windowManager.focusWindow(windowProps.id)}
        >
          <Resizable
            size={windowProps.fullscreen ? { width: '100vw', height: '100vh' } : size}
            minWidth={600}
            minHeight={400}
            maxWidth={windowProps.fullscreen ? '100vw' : window.innerWidth - position.left}
            maxHeight={windowProps.fullscreen ? '100vh' : window.innerHeight - position.top}
            onResize={(e, direction, ref, d) => {
              const newWidth = width + d.width;
              const newHeight = height + d.height;

              let newLeft = left;
              let newTop = top;

              if (direction.includes('left') || direction.includes('Left')) {
                newLeft = left - d.width;
              }

              if (direction.includes('top')) {
                newTop = top - d.height;
              }

              setPosition({ left: newLeft, top: newTop });
              setSize({ width: newWidth, height: newHeight });
            }}
            onResizeStop={() => {
              systemApi.windowManager.resizeWindow(windowProps.id, size);
              systemApi.windowManager.moveWindow(windowProps.id, position);
            }}
            enable={{
              top: true,
              right: true,
              bottom: true,
              left: true,
              topRight: true,
              bottomRight: true,
              bottomLeft: true,
              topLeft: true,
            }}
          >
            {!windowProps.fullscreen ? (
              <div
                className={`${styles.windowTop} ${windowProps.focused ? styles.active : styles.inactive}`}
                style={{ width: windowProps.fullscreen ? '100%' : size.width - 6 }}
                ref={windowTop}
                tabIndex={0}
                role="button"
                onMouseDown={startDrag}
              >
                <div className={styles.title} role="button" tabIndex={0}>
                  {windowProps.title}
                </div>
                <div className={styles.buttonsContainer}>
                  <Button
                    className={`${styles.collapseBtn} ${styles.btn}`}
                    onClick={() => systemApi.windowManager.minimizeWindow(windowProps.id)}
                    aria-label="minimize window"
                  >
                    <FontAwesomeIcon icon={faWindowMinimize}/>
                  </Button>
                  <Button
                    aria-label="toggle fullscreen"
                    className={`${styles.collapseBtn} ${styles.btn}`}
                    onClick={() => systemApi.windowManager.toggleFullscreen(windowProps.id)}
                  >
                    <FontAwesomeIcon icon={faWindowRestore}/>
                  </Button>
                  <Button
                    className={`${styles.closeBtn} ${styles.btn}`}
                    aria-label="close window"
                    onClick={handleClose}
                  >
                    <FontAwesomeIcon icon={faTimes}/>
                  </Button>
                </div>
              </div>
            ) : null}
            <div style={{ width: windowProps.fullscreen ? '100vw' : size.width - 6, height: windowProps.fullscreen ? '100vh' : size.height - 35 }} className={styles.windowBody} role="button" tabIndex={0}>
              {MemoizedContent}
            </div>
          </Resizable>
        </div>
      )}
    </>
  );
};
