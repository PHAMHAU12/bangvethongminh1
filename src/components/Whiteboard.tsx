/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useRef, useEffect, useState, useCallback } from 'react';
import {
  BoardConfig,
  BoardElement,
  EraserMode,
  Page,
  PenType,
  Point,
  ShapeElement,
  ShapeType,
  StrokeElement,
  ToolType
} from '../types/emath';
import {
  CANVAS_DIMENSIONS,
  drawBackground,
  drawShape,
  drawStroke,
  renderCanvasPage,
  STROKE_THICKNESSES
} from '../utils/canvasRenderer';

interface WhiteboardProps {
  config: BoardConfig;
  page: Page;
  currentTool: ToolType;
  penType: PenType;
  shapeType: ShapeType;
  eraserMode: EraserMode;
  isDashed?: boolean;
  isDashedShape?: boolean;
  activeColor: string;
  penThicknessIndex: number;
  highlighterThicknessIndex: number;
  highlighterOpacity: number;
  shapeStrokeWidth: number;
  onUpdateElements: (elements: BoardElement[]) => void;
  onSelectImageElement?: (elementId: string | null) => void;
}

export const Whiteboard: React.FC<WhiteboardProps> = ({
  config,
  page,
  currentTool,
  penType,
  shapeType,
  eraserMode,
  isDashed = false,
  isDashedShape = false,
  activeColor,
  penThicknessIndex,
  highlighterThicknessIndex,
  highlighterOpacity,
  shapeStrokeWidth,
  onUpdateElements,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Active interaction states
  const isPointerDownRef = useRef(false);
  const currentStrokeRef = useRef<StrokeElement | null>(null);
  const activeShapePreviewRef = useRef<ShapeElement | null>(null);
  const laserPointsRef = useRef<{ x: number; y: number; time: number }[]>([]);
  const animFrameRef = useRef<number | null>(null);

  // Moving elements in select mode
  const selectedElementIdRef = useRef<string | null>(null);
  const dragElementStartRef = useRef<{ mouseX: number; mouseY: number; originalX: number; originalY: number } | null>(null);

  const dim = CANVAS_DIMENSIONS[config.paperSize];

  // Coordinates translation from screen client to canvas internal resolution
  const getCanvasCoordinates = useCallback((clientX: number, clientY: number): { x: number; y: number } => {
    if (!canvasRef.current) return { x: 0, y: 0 };
    const rect = canvasRef.current.getBoundingClientRect();
    const scaleX = dim.width / rect.width;
    const scaleY = dim.height / rect.height;
    return {
      x: (clientX - rect.left) * scaleX,
      y: (clientY - rect.top) * scaleY,
    };
  }, [dim.width, dim.height]);

  // Main canvas render loop
  const redraw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Render saved elements & background
    renderCanvasPage(
      ctx,
      dim.width,
      dim.height,
      config.background,
      page.elements,
      laserPointsRef.current
    );

    // Render active stroke currently being drawn
    if (currentStrokeRef.current) {
      drawStroke(ctx, currentStrokeRef.current);
    }

    // Render active shape rubber-band preview
    if (activeShapePreviewRef.current) {
      drawShape(ctx, activeShapePreviewRef.current);
    }
  }, [dim.width, dim.height, config.background, page.elements]);

  // Re-draw when page elements or background change
  useEffect(() => {
    redraw();
  }, [redraw]);

  // Laser animation loop
  useEffect(() => {
    let active = true;
    const loop = () => {
      if (laserPointsRef.current.length > 0) {
        const now = performance.now();
        laserPointsRef.current = laserPointsRef.current.filter((p) => now - p.time < 1200);
        redraw();
      }
      if (active) {
        animFrameRef.current = requestAnimationFrame(loop);
      }
    };
    animFrameRef.current = requestAnimationFrame(loop);
    return () => {
      active = false;
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [redraw]);

  // Clipboard Paste support (Ctrl+V) for images & diagrams
  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;
      for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf('image') !== -1) {
          const blob = items[i].getAsFile();
          if (blob) {
            const reader = new FileReader();
            reader.onload = (event) => {
              const dataUrl = event.target?.result as string;
              if (dataUrl) {
                const img = new Image();
                img.onload = () => {
                  const maxW = dim.width * 0.6;
                  const scale = Math.min(1, maxW / img.width);
                  const newImgElement: BoardElement = {
                    id: 'img_' + Date.now(),
                    type: 'image',
                    dataUrl,
                    x: (dim.width - img.width * scale) / 2,
                    y: (dim.height - img.height * scale) / 2,
                    width: img.width * scale,
                    height: img.height * scale,
                  };
                  onUpdateElements([...page.elements, newImgElement]);
                };
                img.src = dataUrl;
              }
            };
            reader.readAsDataURL(blob);
          }
        }
      }
    };

    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, [dim.width, dim.height, page.elements, onUpdateElements]);

  // Drag & drop image files onto canvas
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      const file = files[0];
      if (file.type.startsWith('image/')) {
        const coords = getCanvasCoordinates(e.clientX, e.clientY);
        const reader = new FileReader();
        reader.onload = (ev) => {
          const dataUrl = ev.target?.result as string;
          if (dataUrl) {
            const img = new Image();
            img.onload = () => {
              const maxW = dim.width * 0.5;
              const scale = Math.min(1, maxW / img.width);
              const newImgElement: BoardElement = {
                id: 'img_' + Date.now(),
                type: 'image',
                dataUrl,
                x: coords.x - (img.width * scale) / 2,
                y: coords.y - (img.height * scale) / 2,
                width: img.width * scale,
                height: img.height * scale,
              };
              onUpdateElements([...page.elements, newImgElement]);
            };
            img.src = dataUrl;
          }
        };
        reader.readAsDataURL(file);
      }
    }
  };

  // Pointer Down
  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    // Palm rejection: if touchMode is stylus_only, ignore touch pointer events
    if (config.touchMode === 'stylus_only' && e.pointerType === 'touch') {
      return;
    }

    canvasRef.current?.setPointerCapture(e.pointerId);
    isPointerDownRef.current = true;
    const { x, y } = getCanvasCoordinates(e.clientX, e.clientY);
    const pressure = e.pressure && e.pressure > 0 ? e.pressure : 0.5;
    const isDashedActive = isDashed || isDashedShape;

    if (currentTool === 'pen') {
      const thickness = penType === 'highlighter' 
        ? STROKE_THICKNESSES[highlighterThicknessIndex]
        : STROKE_THICKNESSES[penThicknessIndex];
      const opacity = penType === 'highlighter' ? highlighterOpacity : 1.0;

      currentStrokeRef.current = {
        id: 'stroke_' + Date.now(),
        type: 'stroke',
        penType,
        color: activeColor,
        thickness,
        opacity,
        isDashed: isDashedActive,
        points: [{ x, y, pressure, time: performance.now() }],
      };
      redraw();
    } else if (currentTool === 'eraser') {
      handleEraseAt(x, y);
    } else if (currentTool === 'shape') {
      activeShapePreviewRef.current = {
        id: 'shape_' + Date.now(),
        type: 'shape',
        shapeType,
        color: activeColor,
        strokeWidth: shapeStrokeWidth,
        isDashed: isDashedActive,
        startX: x,
        startY: y,
        endX: x,
        endY: y,
      };
      redraw();
    } else if (currentTool === 'laser') {
      laserPointsRef.current.push({ x, y, time: performance.now() });
      redraw();
    } else if (currentTool === 'select') {
      // Find element clicked under cursor
      const hit = findElementAt(x, y);
      if (hit) {
        selectedElementIdRef.current = hit.id;
        dragElementStartRef.current = {
          mouseX: x,
          mouseY: y,
          originalX: 'x' in hit ? hit.x : 'startX' in hit ? hit.startX : 0,
          originalY: 'y' in hit ? hit.y : 'startY' in hit ? hit.startY : 0,
        };
      } else {
        selectedElementIdRef.current = null;
        dragElementStartRef.current = null;
      }
    }
  };

  // Pointer Move
  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isPointerDownRef.current) return;
    if (config.touchMode === 'stylus_only' && e.pointerType === 'touch') return;

    const { x, y } = getCanvasCoordinates(e.clientX, e.clientY);
    const pressure = e.pressure && e.pressure > 0 ? e.pressure : 0.5;

    if (currentTool === 'pen' && currentStrokeRef.current) {
      currentStrokeRef.current.points.push({ x, y, pressure, time: performance.now() });
      redraw();
    } else if (currentTool === 'eraser') {
      handleEraseAt(x, y);
    } else if (currentTool === 'shape' && activeShapePreviewRef.current) {
      activeShapePreviewRef.current.endX = x;
      activeShapePreviewRef.current.endY = y;
      redraw();
    } else if (currentTool === 'laser') {
      laserPointsRef.current.push({ x, y, time: performance.now() });
      redraw();
    } else if (currentTool === 'select' && selectedElementIdRef.current && dragElementStartRef.current) {
      const dx = x - dragElementStartRef.current.mouseX;
      const dy = y - dragElementStartRef.current.mouseY;
      const updated = page.elements.map((el) => {
        if (el.id !== selectedElementIdRef.current) return el;
        if (el.type === 'image' || el.type === 'text') {
          return {
            ...el,
            x: dragElementStartRef.current!.originalX + dx,
            y: dragElementStartRef.current!.originalY + dy,
          };
        }
        if (el.type === 'shape') {
          const w = el.endX - el.startX;
          const h = el.endY - el.startY;
          const newStart = {
            x: dragElementStartRef.current!.originalX + dx,
            y: dragElementStartRef.current!.originalY + dy,
          };
          return {
            ...el,
            startX: newStart.x,
            startY: newStart.y,
            endX: newStart.x + w,
            endY: newStart.y + h,
          };
        }
        return el;
      });
      onUpdateElements(updated);
    }
  };

  // Pointer Up
  const handlePointerUp = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isPointerDownRef.current) return;
    isPointerDownRef.current = false;
    canvasRef.current?.releasePointerCapture(e.pointerId);

    if (currentTool === 'pen' && currentStrokeRef.current) {
      if (currentStrokeRef.current.points.length > 0) {
        onUpdateElements([...page.elements, currentStrokeRef.current]);
      }
      currentStrokeRef.current = null;
      redraw();
    } else if (currentTool === 'shape' && activeShapePreviewRef.current) {
      const sh = activeShapePreviewRef.current;
      // Ensure shape has non-zero size
      if (Math.hypot(sh.endX - sh.startX, sh.endY - sh.startY) > 5) {
        onUpdateElements([...page.elements, sh]);
      }
      activeShapePreviewRef.current = null;
      redraw();
    } else if (currentTool === 'select') {
      dragElementStartRef.current = null;
    }
  };

  // Eraser algorithm
  const handleEraseAt = (x: number, y: number) => {
    const eraseRadius = 25;
    const remaining = page.elements.filter((el) => {
      if (el.type === 'stroke') {
        // Check if any point in stroke is within erase radius
        const isHit = el.points.some((pt) => Math.hypot(pt.x - x, pt.y - y) <= eraseRadius + el.thickness / 2);
        return !isHit;
      }
      if (el.type === 'shape') {
        const midX = (el.startX + el.endX) / 2;
        const midY = (el.startY + el.endY) / 2;
        return Math.hypot(midX - x, midY - y) > eraseRadius + 15;
      }
      if (el.type === 'image' || el.type === 'text') {
        return Math.hypot(el.x - x, el.y - y) > eraseRadius + 30;
      }
      return true;
    });

    if (remaining.length !== page.elements.length) {
      onUpdateElements(remaining);
    }
  };

  // Hit test helper for selection
  const findElementAt = (x: number, y: number): BoardElement | null => {
    for (let i = page.elements.length - 1; i >= 0; i--) {
      const el = page.elements[i];
      if (el.type === 'image') {
        if (x >= el.x && x <= el.x + el.width && y >= el.y && y <= el.y + el.height) {
          return el;
        }
      } else if (el.type === 'text') {
        if (x >= el.x - 10 && x <= el.x + 300 && y >= el.y - 10 && y <= el.y + el.fontSize * 2) {
          return el;
        }
      } else if (el.type === 'shape') {
        const minX = Math.min(el.startX, el.endX) - 15;
        const maxX = Math.max(el.startX, el.endX) + 15;
        const minY = Math.min(el.startY, el.endY) - 15;
        const maxY = Math.max(el.startY, el.endY) + 15;
        if (x >= minX && x <= maxX && y >= minY && y <= maxY) {
          return el;
        }
      }
    }
    return null;
  };

  // Calculate container and canvas style based on viewMode and zoom
  const isFitWidth = config.viewMode === 'fit_width';

  return (
    <div
      ref={containerRef}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      className={`w-full h-full flex ${
        isFitWidth ? 'justify-center items-start overflow-y-auto p-4' : 'justify-center items-center overflow-hidden p-2'
      }`}
    >
      <div
        className="relative transition-transform duration-75 flex items-center justify-center shadow-2xl"
        style={{
          transform: `scale(${config.zoom})`,
          transformOrigin: isFitWidth ? 'top center' : 'center center',
        }}
      >
        <canvas
          ref={canvasRef}
          width={dim.width}
          height={dim.height}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
          style={{
            width: isFitWidth ? 'min(94vw, 1400px)' : 'auto',
            maxHeight: isFitWidth ? 'none' : '92vh',
            maxWidth: isFitWidth ? 'none' : '95vw',
            aspectRatio: `${dim.width} / ${dim.height}`,
            cursor:
              currentTool === 'pen'
                ? 'crosshair'
                : currentTool === 'eraser'
                ? 'cell'
                : currentTool === 'laser'
                ? 'pointer'
                : currentTool === 'select'
                ? 'move'
                : 'crosshair',
          }}
          className="whiteboard-canvas rounded-lg shadow-2xl block"
        />
      </div>
    </div>
  );
};
