import { useState, useCallback } from 'react';
import { ImageState } from '../types/mediaTypes';

export const useImageControls = () => {
  const [state, setState] = useState<ImageState>({
    zoom: 100,
    position: { x: 0, y: 0 },
    dragging: false,
    dragStart: { x: 0, y: 0 }
  });

  const setZoom = useCallback((zoom: number | ((prev: number) => number)) => {
    setState(prev => {
      const newZoom = typeof zoom === 'function' ? zoom(prev.zoom) : zoom;

      // При зуме меньше или равно 100% - центрируем изображение
      if (newZoom <= 100) {
        return {
          ...prev,
          zoom: newZoom,
          position: { x: 0, y: 0 }
        };
      }

      // При зуме больше 100% - сохраняем пропорциональную позицию
      const zoomRatio = newZoom / prev.zoom;
      return {
        ...prev,
        zoom: newZoom,
        position: {
          x: prev.position.x * zoomRatio,
          y: prev.position.y * zoomRatio
        }
      };
    });
  }, []);

  const setPosition = useCallback((position: { x: number; y: number }) => {
    setState(prev => ({ ...prev, position }));
  }, []);

  const startDragging = useCallback((clientX: number, clientY: number) => {
    setState(prev => ({
      ...prev,
      dragging: true,
      dragStart: { x: clientX - prev.position.x, y: clientY - prev.position.y }
    }));
  }, []);

  const updateDragging = useCallback((clientX: number, clientY: number) => {
    setState(prev => {
      if (!prev.dragging) return prev;

      const newPosition = {
        x: clientX - prev.dragStart.x,
        y: clientY - prev.dragStart.y
      };

      // Ограничиваем перетаскивание только при зуме > 100%
      if (prev.zoom > 100) {
        // Можно добавить ограничения здесь, но пока оставим свободное перетаскивание
        return {
          ...prev,
          position: newPosition
        };
      }

      return prev;
    });
  }, []);

  const stopDragging = useCallback(() => {
    setState(prev => ({ ...prev, dragging: false }));
  }, []);

  const resetView = useCallback(() => {
    setState({
      zoom: 100,
      position: { x: 0, y: 0 },
      dragging: false,
      dragStart: { x: 0, y: 0 }
    });
  }, []);

  const zoomIn = useCallback(() => {
    setZoom(prev => Math.min(500, prev + 25));
  }, [setZoom]);

  const zoomOut = useCallback(() => {
    setZoom(prev => {
      const newZoom = Math.max(10, prev - 25);
      return newZoom;
    });
  }, [setZoom]);

  const handleWheel = useCallback((deltaY: number) => {
    setZoom(prev => {
      const zoomStep = 10;
      const newZoom = deltaY > 0 ? prev - zoomStep : prev + zoomStep;
      return Math.max(10, Math.min(500, newZoom));
    });
  }, [setZoom]);

  return {
    ...state,
    setZoom,
    setPosition,
    startDragging,
    updateDragging,
    stopDragging,
    resetView,
    zoomIn,
    zoomOut,
    handleWheel
  };
};