import { RefObject, useCallback, useEffect, useState } from 'react';
import { Nullable } from '@nameless-os/sdk';

interface Position {
  top: number;
  left: number;
}

type UseDragNDropProps = {
  ref: RefObject<Nullable<HTMLDivElement>>;
  initialPosition: Position;
  onDrop: (newPosition: Position) => void;
  bounds?: {
    top?: number;
    left?: number;
    right?: number;
    bottom?: number;
  };
  minVisibleWidth?: number;
  minVisibleHeight?: number;
};

export const useDragNDrop = ({
                               ref,
                               initialPosition,
                               onDrop,
                               bounds,
                               minVisibleWidth = 50,
                               minVisibleHeight = 30,
                             }: UseDragNDropProps) => {
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [shift, setShift] = useState({ x: 0, y: 0 });

  const drag = useCallback(
    (event: MouseEvent) => {
      const el = ref.current;
      if (!el) return;

      const rect = el.getBoundingClientRect();
      const width = rect.width;
      const height = rect.height;

      const viewportWidth = document.documentElement.clientWidth;
      const viewportHeight = document.documentElement.clientHeight;

      const limitTop = bounds?.top ?? -height + minVisibleHeight;
      const limitLeft = bounds?.left ?? -width + minVisibleWidth;
      const limitBottom = bounds?.bottom ?? viewportHeight - minVisibleHeight;
      const limitRight = bounds?.right ?? viewportWidth - minVisibleWidth;

      let newLeft = event.clientX - shift.x;
      let newTop = event.clientY - shift.y;

      newTop = Math.max(limitTop, Math.min(newTop, limitBottom));
      newLeft = Math.max(limitLeft, Math.min(newLeft, limitRight));

      setDragOffset({
        x: newLeft - initialPosition.left,
        y: newTop - initialPosition.top,
      });
    },
    [ref, shift, bounds, initialPosition, minVisibleWidth, minVisibleHeight],
  );

  const stopDrag = useCallback(() => {
    const newPos: Position = {
      top: initialPosition.top + dragOffset.y,
      left: initialPosition.left + dragOffset.x,
    };

    setIsDragging(false);
    onDrop(newPos);
    setDragOffset({ x: 0, y: 0 });

    document.removeEventListener('mousemove', drag);
    document.removeEventListener('mouseup', stopDrag);
  }, [drag, dragOffset, initialPosition, onDrop]);

  const startDrag = useCallback(
    (event: React.MouseEvent) => {
      const el = ref.current;
      if (!el) return;
      event.preventDefault();

      const rect = el.getBoundingClientRect();
      setShift({
        x: event.clientX - rect.x,
        y: event.clientY - rect.y,
      });

      setIsDragging(true);
    },
    [ref],
  );

  useEffect(() => {
    if (!isDragging) return;
    document.addEventListener('mousemove', drag);
    document.addEventListener('mouseup', stopDrag);
    return () => {
      document.removeEventListener('mousemove', drag);
      document.removeEventListener('mouseup', stopDrag);
    };
  }, [isDragging, drag, stopDrag]);

  return {
    transform: `translate(${dragOffset.x}px, ${dragOffset.y}px)`,
    isDragging,
    startDrag,
  };
};