/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useRef } from 'react';
import { ShapeType } from '../types/emath';
import {
  GripHorizontal,
  X,
  Minus,
  ArrowRight,
  Triangle,
  Square,
  Circle,
  TrendingUp,
  Maximize2,
  Spline,
  GitCommit
} from 'lucide-react';

interface ShapePanelProps {
  isOpen: boolean;
  onClose: () => void;
  selectedShape: ShapeType;
  onSelectShape: (shape: ShapeType) => void;
  isDashed: boolean;
  onToggleDashed: () => void;
  strokeWidth: number;
  onChangeStrokeWidth: (w: number) => void;
  position: { x: number; y: number };
  onUpdatePosition: (pos: { x: number; y: number }) => void;
  onOpenGraphModal?: () => void;
}

export const ShapePanel: React.FC<ShapePanelProps> = ({
  isOpen,
  onClose,
  selectedShape,
  onSelectShape,
  isDashed,
  onToggleDashed,
  strokeWidth,
  onChangeStrokeWidth,
  position,
  onUpdatePosition,
  onOpenGraphModal,
}) => {
  const isDraggingRef = useRef(false);
  const dragStartRef = useRef({ mouseX: 0, mouseY: 0, startX: 0, startY: 0 });

  if (!isOpen) return null;

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
        x: Math.max(10, Math.min(window.innerWidth - 320, dragStartRef.current.startX + dx)),
        y: Math.max(10, Math.min(window.innerHeight - 420, dragStartRef.current.startY + dy)),
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

  const shapesList: { id: ShapeType; label: string; icon: React.ReactNode; group: string }[] = [
    // Đường thẳng & Tia
    { id: 'line', label: 'Đoạn thẳng', icon: <Minus size={18} />, group: 'Đường' },
    { id: 'arrow', label: 'Véc-tơ (Mũi tên)', icon: <ArrowRight size={18} />, group: 'Đường' },
    { id: 'ray', label: 'Tia gốc O', icon: <GitCommit size={18} />, group: 'Đường' },
    // Tam giác
    { id: 'triangle', label: 'Tam giác thường', icon: <Triangle size={18} />, group: 'Tam giác' },
    { id: 'right_triangle', label: 'Tam giác vuông (∟)', icon: <span className="font-bold text-xs">▲∟</span>, group: 'Tam giác' },
    { id: 'isosceles_triangle', label: 'Tam giác cân', icon: <Triangle size={18} className="scale-y-125" />, group: 'Tam giác' },
    { id: 'equilateral_triangle', label: 'Tam giác đều', icon: <Triangle size={18} />, group: 'Tam giác' },
    // Tứ giác & Tròn
    { id: 'rect', label: 'Hình chữ nhật', icon: <Square size={18} className="scale-x-125" />, group: 'Tứ giác & Cong' },
    { id: 'square', label: 'Hình vuông', icon: <Square size={18} />, group: 'Tứ giác & Cong' },
    { id: 'parallelogram', label: 'Hình bình hành', icon: <span className="font-semibold text-xs">▰</span>, group: 'Tứ giác & Cong' },
    { id: 'trapezoid', label: 'Hình thang', icon: <span className="font-semibold text-xs">⏢</span>, group: 'Tứ giác & Cong' },
    { id: 'circle', label: 'Đường tròn (O, R)', icon: <Circle size={18} />, group: 'Tứ giác & Cong' },
    { id: 'ellipse', label: 'Hình Elip', icon: <span className="font-bold text-sm">⬭</span>, group: 'Tứ giác & Cong' },
    // Toán giải tích & Đồ thị
    { id: 'coordinate_oxy', label: 'Hệ toạ độ Oxy', icon: <TrendingUp size={18} />, group: 'Hệ toạ độ & Đồ thị' },
    { id: 'parabola', label: 'Parabol y = ax²', icon: <Spline size={18} />, group: 'Hệ toạ độ & Đồ thị' },
    { id: 'cubic_function', label: 'Hàm bậc 3 (ax³+...)', icon: <TrendingUp size={18} />, group: 'Hệ toạ độ & Đồ thị' },
    { id: 'rational_function', label: 'Hàm nhất biến (1/1)', icon: <GitCommit size={18} />, group: 'Hệ toạ độ & Đồ thị' },
    { id: 'quadratic_rational_function', label: 'Hàm bậc 2 / 1', icon: <Spline size={18} />, group: 'Hệ toạ độ & Đồ thị' },
  ];

  return (
    <div
      style={{ left: `${position.x}px`, top: `${position.y}px` }}
      className="fixed z-50 w-80 bg-neutral-900/95 backdrop-blur-md border border-neutral-700/80 rounded-2xl shadow-2xl p-4 text-neutral-100 select-none text-sm floating-panel max-h-[85vh] overflow-y-auto"
    >
      {/* Header */}
      <div className="flex items-center justify-between pb-3 mb-3 border-b border-neutral-800">
        <div
          onPointerDown={handlePointerDownDrag}
          className="flex items-center gap-2 cursor-grab active:cursor-grabbing text-neutral-400 hover:text-neutral-200 flex-1"
          title="Kéo tay nắm để di chuyển bảng hình học"
        >
          <GripHorizontal size={18} />
          <span className="font-semibold text-xs tracking-wider uppercase text-neutral-300">
            Dựng Hình Toán Học
          </span>
        </div>
        <button
          onClick={onClose}
          className="p-1 text-neutral-400 hover:text-white rounded-lg hover:bg-neutral-800 transition-colors"
        >
          <X size={16} />
        </button>
      </div>

      {/* Button to open advanced Function Graph Modal */}
      {onOpenGraphModal && (
        <button
          onClick={() => {
            onClose();
            onOpenGraphModal();
          }}
          className="w-full mb-3 py-2 px-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-xl font-medium text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
        >
          <TrendingUp size={15} />
          <span>Vẽ Đồ Thị Chi Tiết (Bậc 3, 1/1, 2/1)</span>
        </button>
      )}

      {/* Dashed line and stroke options */}
      <div className="mb-4 flex items-center justify-between p-2 bg-neutral-800/80 rounded-xl">
        <label className="flex items-center gap-2 cursor-pointer text-xs">
          <input
            type="checkbox"
            checked={isDashed}
            onChange={onToggleDashed}
            className="rounded accent-purple-500 w-4 h-4 cursor-pointer"
          />
          <span className="text-neutral-200">Nét đứt (Hình không gian)</span>
        </label>
        
        <div className="flex items-center gap-1.5 text-xs">
          <span className="text-neutral-400">Độ dày:</span>
          <select
            value={strokeWidth}
            onChange={(e) => onChangeStrokeWidth(Number(e.target.value))}
            className="bg-neutral-700 text-white rounded px-1.5 py-0.5 text-xs border border-neutral-600 cursor-pointer"
          >
            <option value={1.5}>1.5px</option>
            <option value={2.5}>2.5px</option>
            <option value={4}>4px</option>
            <option value={6}>6px</option>
          </select>
        </div>
      </div>

      {/* Shape Grid categorized */}
      <div className="space-y-3">
        {['Đường', 'Tam giác', 'Tứ giác & Cong', 'Hệ toạ độ & Đồ thị'].map((groupName) => {
          const groupShapes = shapesList.filter((s) => s.group === groupName);
          return (
            <div key={groupName}>
              <div className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider mb-1.5 px-1">
                {groupName}
              </div>
              <div className="grid grid-cols-2 gap-1.5">
                {groupShapes.map((shape) => (
                  <button
                    key={shape.id}
                    onClick={() => onSelectShape(shape.id)}
                    className={`flex items-center gap-2 px-2.5 py-2 rounded-xl text-xs font-medium transition-all text-left ${
                      selectedShape === shape.id
                        ? 'bg-purple-600 text-white shadow-md shadow-purple-500/30'
                        : 'bg-neutral-800/60 hover:bg-neutral-800 text-neutral-300 hover:text-white'
                    }`}
                  >
                    <span className="shrink-0">{shape.icon}</span>
                    <span className="truncate">{shape.label}</span>
                  </button>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
