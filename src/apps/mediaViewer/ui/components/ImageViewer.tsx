import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faArrowsRotate,
  faCompress,
  faExpand,
  faMagnifyingGlassMinus,
  faMagnifyingGlassPlus,
} from '@fortawesome/free-solid-svg-icons';
import styles from '../mediaViewer.module.css';
import { ImageState } from '../../types/mediaTypes';

interface ImageViewerProps {
  mediaUrl: string;
  fileName: string;
  imageState: ImageState;
  uiVisible: boolean;
  isFullscreen: boolean;
  onWheel: (e: React.WheelEvent) => void;
  onMouseDown: (e: React.MouseEvent) => void;
  onMouseMove: (e: React.MouseEvent) => void;
  onMouseUp: () => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onResetView: () => void;
  onToggleFullscreen: () => void;
}

export const ImageViewer: React.FC<ImageViewerProps> = ({
                                                          mediaUrl,
                                                          fileName,
                                                          imageState,
                                                          uiVisible,
                                                          isFullscreen,
                                                          onWheel,
                                                          onMouseDown,
                                                          onMouseMove,
                                                          onMouseUp,
                                                          onZoomIn,
                                                          onZoomOut,
                                                          onResetView,
                                                          onToggleFullscreen,
                                                        }) => {
  const { zoom, position, dragging } = imageState;

  // Обработчики с предотвращением всплытия
  const handleZoomOut = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onZoomOut();
  };

  const handleZoomIn = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onZoomIn();
  };

  const handleResetView = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onResetView();
  };

  const handleToggleFullscreen = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onToggleFullscreen();
  };

  // Блокируем двойной клик на панели управления
  const handleControlsClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  const handleControlsDoubleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  return (
    <>
      {/* Основная область с изображением */}
      <div className={styles.media}>
        <div
          onWheel={onWheel}
          onMouseDown={onMouseDown}
          onMouseMove={onMouseMove}
          onMouseUp={onMouseUp}
          onMouseLeave={onMouseUp}
          style={{
            cursor: zoom > 100 ? (dragging ? 'grabbing' : 'grab') : 'default',
            width: '100%',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden'
          }}
        >
          <img
            src={mediaUrl}
            alt={fileName}
            className={styles.image}
            style={{
              maxWidth: '100%',
              maxHeight: '100%',
              transform: zoom <= 100
                ? `scale(${zoom / 100})` // Масштабируем относительно 100%
                : `scale(${zoom / 100}) translate(${position.x}px, ${position.y}px)`, // При зуме > 100% добавляем позицию
              transformOrigin: 'center center',
              transition: dragging ? 'none' : 'transform 0.1s ease-out'
            }}
            draggable={false}
          />
        </div>
      </div>

      {/* Панель управления внизу как у видео */}
      <div
        className={`${styles.controls} ${uiVisible ? styles.visible : styles.hidden}`}
        onClick={handleControlsClick}
        onDoubleClick={handleControlsDoubleClick}
      >
        <div className={styles.controlsRow}>
          <button
            className={styles.iconBtn}
            onClick={handleZoomOut}
            onDoubleClick={handleControlsDoubleClick}
            title="Zoom out (-)"
          >
            <FontAwesomeIcon icon={faMagnifyingGlassMinus}/>
          </button>

          <div style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '14px',
            color: 'var(--muted)'
          }}>
            {zoom}%
          </div>

          <button
            className={styles.iconBtn}
            onClick={handleZoomIn}
            onDoubleClick={handleControlsDoubleClick}
            title="Zoom in (+)"
          >
            <FontAwesomeIcon icon={faMagnifyingGlassPlus}/>
          </button>

          <button
            className={styles.iconBtn}
            onClick={handleResetView}
            onDoubleClick={handleControlsDoubleClick}
            title="Reset zoom (0)"
          >
            <FontAwesomeIcon icon={faArrowsRotate}/>
          </button>

          <button
            className={styles.iconBtn}
            onClick={handleToggleFullscreen}
            onDoubleClick={handleControlsDoubleClick}
            title="Fullscreen (F)"
          >
            <FontAwesomeIcon icon={isFullscreen ? faCompress : faExpand}/>
          </button>
        </div>
      </div>
    </>
  );
};