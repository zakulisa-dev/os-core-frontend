import React, { FC, useRef, useState } from 'react';
import { DesktopIcon as DesktopIconType } from '../stores/icon.store';
import styles from './desktopIcon.module.css';

interface DesktopIconProps {
  icon: DesktopIconType;
  selected: boolean;
  onDoubleClick: () => void;
  onSelect: (multiSelect?: boolean) => void;
  onDragStart?: (iconId: string) => void;
  onDragEnd?: () => void;
  onPositionChange?: (iconId: string, position: { x: number; y: number }) => void;
}

export const DesktopIcon: FC<DesktopIconProps> = ({
                                                    icon,
                                                    selected,
                                                    onDoubleClick,
                                                    onSelect,
                                                    onDragStart,
                                                    onDragEnd,
                                                    onPositionChange
                                                  }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const iconRef = useRef<HTMLDivElement>(null);
  const clickTimeout = useRef<NodeJS.Timeout | null>(null);
  const lastClickTime = useRef(0);
  const hasMoved = useRef(false);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return;

    const rect = iconRef.current?.getBoundingClientRect();
    if (!rect) return;

    const newDragOffset = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    };
    setDragOffset(newDragOffset);
    hasMoved.current = false;

    const startPosition = { x: e.clientX, y: e.clientY };

    const handleMouseMove = (e: MouseEvent) => {
      // Проверяем, переместился ли курсор достаточно для начала перетаскивания
      const distance = Math.sqrt(
        Math.pow(e.clientX - startPosition.x, 2) +
        Math.pow(e.clientY - startPosition.y, 2)
      );

      if (distance > 5 && !isDragging) {
        setIsDragging(true);
        onDragStart?.(icon.id);
        hasMoved.current = true;
      }

      if (isDragging || distance > 5) {
        const newPosition = {
          x: e.clientX - newDragOffset.x,
          y: e.clientY - newDragOffset.y
        };
        onPositionChange?.(icon.id, newPosition);
      }
    };

    const handleMouseUp = (e: MouseEvent) => {
      if (isDragging) {
        setIsDragging(false);
        onDragEnd?.();
      }

      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();

    // Если было перетаскивание, не обрабатываем клик
    if (hasMoved.current) {
      return;
    }

    const currentTime = Date.now();
    const timeDiff = currentTime - lastClickTime.current;

    // Проверяем двойной клик (менее 400ms между кликами)
    if (timeDiff < 400) {
      // Двойной клик
      if (clickTimeout.current) {
        clearTimeout(clickTimeout.current);
        clickTimeout.current = null;
      }
      onDoubleClick();
      lastClickTime.current = 0; // Сбрасываем для предотвращения тройного клика
    } else {
      // Первый клик - выделяем сразу без задержки
      onSelect(e.ctrlKey || e.metaKey);

      // Устанавливаем таймер для сброса состояния двойного клика
      if (clickTimeout.current) {
        clearTimeout(clickTimeout.current);
      }
      clickTimeout.current = setTimeout(() => {
        lastClickTime.current = 0;
      }, 400);

      lastClickTime.current = currentTime;
    }
  };

  const iconElement = icon.icon.startsWith('http') || icon.icon.startsWith('/') ? (
    <img src={icon.icon} alt={icon.name} className={styles.iconImage} />
  ) : (
    <span className={styles.iconEmoji}>{icon.icon}</span>
  );

  return (
    <div
      ref={iconRef}
      className={`${styles.desktopIcon} ${selected ? styles.selected : ''} ${isDragging ? styles.dragging : ''}`}
      style={{
        position: 'absolute',
        left: icon.position.x,
        top: icon.position.y,
        userSelect: 'none'
      }}
      onMouseDown={handleMouseDown}
      onClick={handleClick}
      onContextMenu={(e) => e.stopPropagation()}
    >
      <div className={styles.iconContainer}>
        {iconElement}
      </div>
      <div className={styles.iconLabel}>
        {icon.name}
      </div>
    </div>
  );
};