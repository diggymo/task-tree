import { useCallback, useRef, useState } from 'react';
import type { ViewOffset } from '../types/task';

interface UseCanvasControlsOptions {
  initialViewOffset: ViewOffset;
  initialZoom: number;
  onViewChange?: (viewOffset: ViewOffset, zoom: number) => void;
}

export function useCanvasControls({
  initialViewOffset,
  initialZoom,
  onViewChange,
}: UseCanvasControlsOptions) {
  const [viewOffset, setViewOffset] = useState<ViewOffset>(initialViewOffset);
  const [zoom, setZoom] = useState<number>(initialZoom);
  const [isPanning, setIsPanning] = useState<boolean>(false);
  const [panStart, setPanStart] = useState<ViewOffset>({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMouseDown = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      const isBackground =
        e.target === containerRef.current ||
        (e.target as HTMLElement).classList.contains('canvas');

      if (e.metaKey || e.ctrlKey || isBackground) {
        e.preventDefault();
        setIsPanning(true);
        setPanStart({
          x: e.clientX - viewOffset.x,
          y: e.clientY - viewOffset.y,
        });
      }
    },
    [viewOffset],
  );

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (isPanning) {
        e.preventDefault();
        const newOffset = {
          x: e.clientX - panStart.x,
          y: e.clientY - panStart.y,
        };
        setViewOffset(newOffset);
        onViewChange?.(newOffset, zoom);
      }
    },
    [isPanning, panStart, zoom, onViewChange],
  );

  const handleMouseUp = useCallback(() => {
    setIsPanning(false);
  }, []);

  // Touch event handlers for mobile support
  const handleTouchStart = useCallback(
    (e: React.TouchEvent<HTMLDivElement>) => {
      if (e.touches.length === 1) {
        const touch = e.touches[0];
        const target = e.target as HTMLElement;

        // ドラッグハンドルからのタッチはタスクドラッグ用なので除外
        const isDragHandle =
          target.classList.contains('drag-handle') ||
          target.closest('.drag-handle');

        if (!isDragHandle) {
          setIsPanning(true);
          setPanStart({
            x: touch.clientX - viewOffset.x,
            y: touch.clientY - viewOffset.y,
          });
        }
      }
    },
    [viewOffset],
  );

  const handleTouchMove = useCallback(
    (e: React.TouchEvent<HTMLDivElement>) => {
      if (isPanning && e.touches.length === 1) {
        const touch = e.touches[0];
        const newOffset = {
          x: touch.clientX - panStart.x,
          y: touch.clientY - panStart.y,
        };
        setViewOffset(newOffset);
        onViewChange?.(newOffset, zoom);
      }
    },
    [isPanning, panStart, zoom, onViewChange],
  );

  const handleTouchEnd = useCallback(() => {
    setIsPanning(false);
  }, []);

  const handleWheel = useCallback(
    (e: React.WheelEvent<HTMLDivElement>) => {
      if (e.metaKey || e.ctrlKey) {
        e.preventDefault();

        const delta = e.deltaY > 0 ? -0.1 : 0.1;
        const newZoom = Math.min(Math.max(0.25, zoom + delta), 2);

        if (newZoom === zoom) return;

        const rect = containerRef.current?.getBoundingClientRect();
        if (!rect) return;

        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;

        const canvasX = (mouseX - viewOffset.x) / zoom;
        const canvasY = (mouseY - viewOffset.y) / zoom;

        const newOffsetX = mouseX - canvasX * newZoom;
        const newOffsetY = mouseY - canvasY * newZoom;

        const newOffset = { x: newOffsetX, y: newOffsetY };
        setZoom(newZoom);
        setViewOffset(newOffset);
        onViewChange?.(newOffset, newZoom);
      }
    },
    [zoom, viewOffset, onViewChange],
  );

  const handleZoomIn = useCallback(() => {
    const newZoom = Math.min(2, zoom + 0.1);
    setZoom(newZoom);
    onViewChange?.(viewOffset, newZoom);
  }, [zoom, viewOffset, onViewChange]);

  const handleZoomOut = useCallback(() => {
    const newZoom = Math.max(0.25, zoom - 0.1);
    setZoom(newZoom);
    onViewChange?.(viewOffset, newZoom);
  }, [zoom, viewOffset, onViewChange]);

  const handleReset = useCallback(() => {
    setZoom(1);
    setViewOffset({ x: 0, y: 0 });
    onViewChange?.({ x: 0, y: 0 }, 1);
  }, [onViewChange]);

  return {
    viewOffset,
    zoom,
    isPanning,
    containerRef,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd,
    handleWheel,
    handleZoomIn,
    handleZoomOut,
    handleReset,
    setViewOffset,
    setZoom,
  };
}
