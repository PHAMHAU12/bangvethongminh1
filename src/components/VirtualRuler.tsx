/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef } from 'react';
import { RotateCw, X, Ruler } from 'lucide-react';

interface VirtualRulerProps {
  isVisible: boolean;
  onClose: () => void;
}

export const VirtualRuler: React.FC<VirtualRulerProps> = ({ isVisible, onClose }) => {
  const [position, setPosition] = useState({ x: 220, y: 160 });
  const [rotation, setRotation] = useState(0); // degrees
  const [type, setType] = useState<'ruler' | 'protractor'>('ruler');

  const isDraggingRef = useRef(false);
  const dragStartRef = useRef({ mouseX: 0, mouseY: 0, startX: 0, startY: 0 });

  if (!isVisible) return null;

  const handlePointerDown = (e: React.PointerEvent) => {
    e.preventDefault();
    isDraggingRef.current = true;
    dragStartRef.current = {
      mouseX: e.clientX,
      mouseY: e.clientY,
      startX: position.x,
      startY: position.y,
    };

    const handlePointerMove = (ev: PointerEvent) => {
      if (!isDraggingRef.current) return;
      const dx = ev.clientX - dragStartRef.current.mouseX;
      const dy = ev.clientY - dragStartRef.current.mouseY;
      setPosition({
        x: dragStartRef.current.startX + dx,
        y: dragStartRef.current.startY + dy,
      });
    };

    const handlePointerUp = () => {
      isDraggingRef.current = false;
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
    };

    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);
  };

  const handleRotate = (e: React.MouseEvent) => {
    e.stopPropagation();
    setRotation((prev) => (prev + 15) % 360);
  };

  return (
    <div
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        transform: `rotate(${rotation}deg)`,
        transformOrigin: 'top left',
      }}
      className="fixed z-40 select-none cursor-move touch-none"
    >
      {type === 'ruler' ? (
        // Thước thẳng 30cm
        <div
          onPointerDown={handlePointerDown}
          className="w-[500px] h-20 bg-amber-100/90 border-2 border-amber-600/60 rounded shadow-2xl relative backdrop-blur-xs text-neutral-900"
        >
          {/* Controls Bar on top */}
          <div className="absolute top-1 right-2 flex items-center gap-1 z-10 bg-amber-200/90 rounded px-1.5 py-0.5">
            <button
              onClick={() => setType('protractor')}
              className="text-[10px] font-bold text-amber-900 hover:underline mr-1"
            >
              Đổi sang đo góc
            </button>
            <button
              onClick={handleRotate}
              className="p-1 hover:bg-amber-300 rounded text-neutral-800"
              title="Xoay 15°"
            >
              <RotateCw size={13} />
            </button>
            <span className="text-[10px] font-mono font-bold mr-1">{rotation}°</span>
            <button
              onClick={onClose}
              className="p-1 hover:bg-amber-300 rounded text-neutral-800"
            >
              <X size={13} />
            </button>
          </div>

          {/* Centimeter ticks */}
          <div className="w-full h-10 border-b border-amber-400/50 flex">
            {Array.from({ length: 26 }).map((_, cm) => (
              <div key={cm} className="relative flex-1 h-full border-r border-amber-900">
                <span className="absolute bottom-1 right-1 text-[10px] font-bold font-mono text-neutral-800">
                  {cm + 1}
                </span>
                {/* Millimeter ticks */}
                <div className="absolute top-0 left-0 w-full flex justify-between px-0.5">
                  <div className="w-[1px] h-2 bg-amber-800/60" />
                  <div className="w-[1px] h-2 bg-amber-800/60" />
                  <div className="w-[1px] h-3 bg-amber-800" />
                  <div className="w-[1px] h-2 bg-amber-800/60" />
                </div>
              </div>
            ))}
          </div>

          <div className="p-2 flex items-center justify-between text-xs font-semibold text-amber-900/80">
            <span>MATHEMATICS INTERACTIVE BOARD _ PHẠM HẬU</span>
            <span className="text-[11px] italic font-normal">Kéo để di chuyển • Xoay theo độ</span>
          </div>
        </div>
      ) : (
        // Thước đo góc 180° (Protractor)
        <div
          onPointerDown={handlePointerDown}
          className="w-96 h-48 bg-amber-100/90 border-2 border-amber-600/60 rounded-t-full shadow-2xl relative backdrop-blur-xs text-neutral-900 overflow-hidden"
        >
          <div className="absolute top-2 right-4 flex items-center gap-1 z-10 bg-amber-200/90 rounded px-1.5 py-0.5">
            <button
              onClick={() => setType('ruler')}
              className="text-[10px] font-bold text-amber-900 hover:underline mr-1"
            >
              Đổi sang thước thẳng
            </button>
            <button
              onClick={handleRotate}
              className="p-1 hover:bg-amber-300 rounded text-neutral-800"
              title="Xoay 15°"
            >
              <RotateCw size={13} />
            </button>
            <span className="text-[10px] font-mono font-bold mr-1">{rotation}°</span>
            <button
              onClick={onClose}
              className="p-1 hover:bg-amber-300 rounded text-neutral-800"
            >
              <X size={13} />
            </button>
          </div>

          {/* Center Origin Mark */}
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-4 h-4 border-t-2 border-l-2 border-r-2 border-amber-900 rounded-t-full" />
          <div className="absolute bottom-1 left-1/2 -translate-x-1/2 text-[10px] font-bold text-neutral-800 font-mono">
            0°
          </div>

          {/* Degree radial arcs */}
          <div className="absolute inset-x-8 bottom-0 top-8 border-t-2 border-dashed border-amber-600/40 rounded-t-full flex items-center justify-center">
            <span className="text-xs font-bold text-amber-900 tracking-wider">
              THƯỚC ĐO ĐỘ 180°
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
