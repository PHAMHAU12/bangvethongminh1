/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useRef } from 'react';
import { PenType, BackgroundType } from '../types/emath';
import {
  STROKE_THICKNESSES,
  LIGHT_THEME_COLORS,
  DARK_THEME_COLORS,
  isDarkBackground
} from '../utils/canvasRenderer';
import { GripHorizontal, X, Feather, Highlighter, Pen, Check } from 'lucide-react';

interface ColorPickerPanelProps {
  isOpen: boolean;
  onClose: () => void;
  background: BackgroundType;
  penType: PenType;
  onSelectPenType: (type: PenType) => void;
  // Separate settings for standard/fountain (Bút viết) vs highlighter (Bút tô)
  penColor: string;
  onSelectPenColor: (color: string) => void;
  penThicknessIndex: number; // 0 to 6 (7 mức)
  onSelectPenThicknessIndex: (index: number) => void;
  highlighterColor: string;
  onSelectHighlighterColor: (color: string) => void;
  highlighterThicknessIndex: number;
  onSelectHighlighterThicknessIndex: (index: number) => void;
  highlighterOpacity: number;
  onChangeHighlighterOpacity: (opacity: number) => void;
  isDashed?: boolean;
  onToggleDashed?: () => void;
  position: { x: number; y: number };
  onUpdatePosition: (pos: { x: number; y: number }) => void;
}

export const ColorPickerPanel: React.FC<ColorPickerPanelProps> = ({
  isOpen,
  onClose,
  background,
  penType,
  onSelectPenType,
  penColor,
  onSelectPenColor,
  penThicknessIndex,
  onSelectPenThicknessIndex,
  highlighterColor,
  onSelectHighlighterColor,
  highlighterThicknessIndex,
  onSelectHighlighterThicknessIndex,
  highlighterOpacity,
  onChangeHighlighterOpacity,
  isDashed = false,
  onToggleDashed,
  position,
  onUpdatePosition,
}) => {
  const isDraggingRef = useRef(false);
  const dragStartRef = useRef({ mouseX: 0, mouseY: 0, startX: 0, startY: 0 });

  if (!isOpen) return null;

  const isDark = isDarkBackground(background);
  const presetColors = isDark ? DARK_THEME_COLORS : LIGHT_THEME_COLORS;

  const isHighlighter = penType === 'highlighter';
  const currentColor = isHighlighter ? highlighterColor : penColor;
  const currentThicknessIndex = isHighlighter ? highlighterThicknessIndex : penThicknessIndex;

  const handlePointerDownDrag = (e: React.PointerEvent) => {
    e.preventDefault();
    e.stopPropagation();
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
      onUpdatePosition({
        x: Math.max(10, Math.min(window.innerWidth - 300, dragStartRef.current.startX + dx)),
        y: Math.max(10, Math.min(window.innerHeight - 380, dragStartRef.current.startY + dy)),
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

  return (
    <div
      style={{ left: `${position.x}px`, top: `${position.y}px` }}
      className="fixed z-50 w-72 bg-neutral-900/95 backdrop-blur-md border border-neutral-700/80 rounded-2xl shadow-2xl p-4 text-neutral-100 select-none text-sm floating-panel"
    >
      {/* Draggable Header */}
      <div className="flex items-center justify-between pb-3 mb-3 border-b border-neutral-800">
        <div
          onPointerDown={handlePointerDownDrag}
          className="flex items-center gap-2 cursor-grab active:cursor-grabbing text-neutral-400 hover:text-neutral-200 flex-1"
          title="Kéo tay nắm để di chuyển bảng màu"
        >
          <GripHorizontal size={18} />
          <span className="font-semibold text-xs tracking-wider uppercase text-neutral-300">
            Bút & Bảng Màu
          </span>
        </div>
        <button
          onClick={onClose}
          className="p-1 text-neutral-400 hover:text-white rounded-lg hover:bg-neutral-800 transition-colors"
        >
          <X size={16} />
        </button>
      </div>

      {/* 3 Pen Types Selector */}
      <div className="mb-4">
        <div className="text-xs text-neutral-400 mb-2 font-medium">Loại bút viết</div>
        <div className="grid grid-cols-3 gap-1.5 p-1 bg-neutral-800/90 rounded-xl">
          <button
            onClick={() => onSelectPenType('standard')}
            className={`flex flex-col items-center justify-center py-2 px-1 rounded-lg text-xs font-medium transition-all ${
              penType === 'standard'
                ? 'bg-neutral-700 text-white shadow-sm ring-1 ring-neutral-500'
                : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800/50'
            }`}
          >
            <Pen size={18} className="mb-1" />
            <span>Bút thường</span>
          </button>

          <button
            onClick={() => onSelectPenType('fountain')}
            className={`flex flex-col items-center justify-center py-2 px-1 rounded-lg text-xs font-medium transition-all ${
              penType === 'fountain'
                ? 'bg-neutral-700 text-white shadow-sm ring-1 ring-neutral-500'
                : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800/50'
            }`}
            title="Nét thanh nét đậm tùy theo hướng và tốc độ viết"
          >
            <Feather size={18} className="mb-1 text-amber-300" />
            <span>Bút máy</span>
          </button>

          <button
            onClick={() => onSelectPenType('highlighter')}
            className={`flex flex-col items-center justify-center py-2 px-1 rounded-lg text-xs font-medium transition-all ${
              penType === 'highlighter'
                ? 'bg-neutral-700 text-white shadow-sm ring-1 ring-neutral-500'
                : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800/50'
            }`}
            title="Bút tô đánh dấu có độ trong suốt"
          >
            <Highlighter size={18} className="mb-1 text-yellow-400" />
            <span>Bút tô</span>
          </button>
        </div>
      </div>

      {/* Dashed line toggle */}
      {onToggleDashed && (
        <div className="mb-4 p-2.5 bg-neutral-800/80 rounded-xl border border-neutral-700/60 flex items-center justify-between">
          <label className="flex items-center gap-2.5 cursor-pointer text-xs">
            <input
              type="checkbox"
              checked={isDashed}
              onChange={onToggleDashed}
              className="rounded accent-amber-500 w-4 h-4 cursor-pointer"
            />
            <span className="text-neutral-200 font-semibold flex items-center gap-1.5">
              <span>Nét đứt đoạn</span>
              <span className="font-mono text-amber-400 tracking-widest text-[11px]">- - -</span>
            </span>
          </label>
          <span className="text-[11px] text-neutral-400 italic">Đường khuất</span>
        </div>
      )}

      {/* 7 Stroke Thickness Levels */}
      <div className="mb-4">
        <div className="flex justify-between items-center text-xs text-neutral-400 mb-2">
          <span className="font-medium">
            Độ dày nét ({isHighlighter ? 'Bút tô' : 'Bút viết'})
          </span>
          <span className="font-mono-numbers text-neutral-300 font-semibold">
            Mức {currentThicknessIndex + 1}/7 ({STROKE_THICKNESSES[currentThicknessIndex]}px)
          </span>
        </div>
        <div className="flex items-center justify-between gap-1 p-1.5 bg-neutral-800/60 rounded-xl">
          {STROKE_THICKNESSES.map((thick, idx) => (
            <button
              key={idx}
              onClick={() => {
                if (isHighlighter) onSelectHighlighterThicknessIndex(idx);
                else onSelectPenThicknessIndex(idx);
              }}
              className={`flex-1 h-9 flex items-center justify-center rounded-lg transition-all ${
                currentThicknessIndex === idx
                  ? 'bg-neutral-700 shadow-sm ring-2 ring-emerald-400/80'
                  : 'hover:bg-neutral-800'
              }`}
              title={`Mức ${idx + 1}: ${thick}px`}
            >
              <span
                className="rounded-full bg-white transition-transform"
                style={{
                  width: `${Math.min(22, Math.max(3, thick * 1.3))}px`,
                  height: `${Math.min(22, Math.max(3, thick * 1.3))}px`,
                  backgroundColor: currentThicknessIndex === idx ? '#34d399' : '#e2e8f0',
                }}
              />
            </button>
          ))}
        </div>
      </div>

      {/* Highlighter Opacity Slider if highlighter is selected */}
      {isHighlighter && (
        <div className="mb-4">
          <div className="flex justify-between items-center text-xs text-neutral-400 mb-1.5">
            <span>Độ trong suốt bút tô</span>
            <span className="font-mono-numbers">{Math.round(highlighterOpacity * 100)}%</span>
          </div>
          <input
            type="range"
            min="0.1"
            max="0.8"
            step="0.05"
            value={highlighterOpacity}
            onChange={(e) => onChangeHighlighterOpacity(parseFloat(e.target.value))}
            className="w-full accent-yellow-400 bg-neutral-700 h-1.5 rounded-lg appearance-none cursor-pointer"
          />
        </div>
      )}

      {/* Preset Colors */}
      <div className="mb-3">
        <div className="text-xs text-neutral-400 mb-2 font-medium">
          Màu có sẵn ({isDark ? 'Bảng đen/xanh' : 'Bảng trắng/vở'})
        </div>
        <div className="grid grid-cols-4 gap-2">
          {presetColors.map((col, idx) => (
            <button
              key={idx}
              onClick={() => {
                if (isHighlighter) onSelectHighlighterColor(col);
                else onSelectPenColor(col);
              }}
              className="h-8 rounded-xl border border-neutral-700/80 flex items-center justify-center transition-transform hover:scale-105 active:scale-95 shadow-sm relative"
              style={{ backgroundColor: col }}
              title={col}
            >
              {currentColor === col && (
                <Check
                  size={16}
                  className={
                    col === '#ffffff' || col === '#fef08a' || col === '#67e8f9'
                      ? 'text-black'
                      : 'text-white'
                  }
                />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Custom Color Input */}
      <div className="flex items-center gap-2 pt-2 border-t border-neutral-800">
        <span className="text-xs text-neutral-400 flex-1">Màu tùy chọn:</span>
        <div className="flex items-center gap-1.5">
          <input
            type="color"
            value={currentColor}
            onChange={(e) => {
              if (isHighlighter) onSelectHighlighterColor(e.target.value);
              else onSelectPenColor(e.target.value);
            }}
            className="w-7 h-7 rounded-lg border-0 bg-transparent cursor-pointer"
          />
          <span className="text-xs font-mono uppercase text-neutral-300">
            {currentColor}
          </span>
        </div>
      </div>
    </div>
  );
};
