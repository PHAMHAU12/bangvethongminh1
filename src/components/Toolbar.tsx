/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import {
  Pen,
  Feather,
  Highlighter,
  Eraser,
  Shapes,
  Type,
  Image as ImageIcon,
  MousePointer,
  Sparkles,
  Ruler,
  Maximize2,
  Minimize2,
  ZoomIn,
  ZoomOut,
  Lock,
  Unlock,
  RotateCcw,
  RotateCw,
  Palette,
  Layout,
  FileDown,
  FolderOpen,
  Save,
  Plus,
  ChevronLeft,
  ChevronRight,
  GripHorizontal,
  GripVertical,
  Minus,
  SlidersHorizontal,
  FileSpreadsheet,
  Circle,
  Square,
  Triangle,
  ArrowRight,
  Move,
  TrendingUp
} from 'lucide-react';
import { ToolType, PenType, ShapeType, EraserMode, ToolbarDock, ViewMode } from '../types/emath';

interface ToolbarProps {
  currentTool: ToolType;
  penType: PenType;
  shapeType: ShapeType;
  eraserMode: EraserMode;
  dock: ToolbarDock;
  buttonSize: 'compact' | 'normal' | 'large';
  zoom: number;
  isZoomLocked: boolean;
  viewMode: ViewMode;
  canUndo: boolean;
  canRedo: boolean;
  currentPageIndex: number;
  totalPages: number;
  isColorPanelOpen: boolean;
  isShapePanelOpen: boolean;
  isBoardSettingsOpen: boolean;
  isFormulaModalOpen: boolean;
  activeColor: string;
  isDashed?: boolean;
  onToggleDashed?: () => void;
  onSelectTool: (tool: ToolType) => void;
  onSetDock: (dock: ToolbarDock) => void;
  onToggleColorPanel: () => void;
  onToggleShapePanel: () => void;
  onToggleBoardSettings: () => void;
  onOpenFormulaModal: () => void;
  onOpenGraphModal: () => void;
  onOpenImageUpload: () => void;
  onUndo: () => void;
  onRedo: () => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onToggleLockZoom: () => void;
  onToggleViewMode: () => void;
  onPrevPage: () => void;
  onNextPage: () => void;
  onAddPage: () => void;
  onSaveProject: () => void;
  onLoadProject: () => void;
  onExportPdf: () => void;
  onExportImage: () => void;
}

export const Toolbar: React.FC<ToolbarProps> = ({
  currentTool,
  penType,
  shapeType,
  eraserMode,
  dock,
  buttonSize,
  zoom,
  isZoomLocked,
  viewMode,
  canUndo,
  canRedo,
  currentPageIndex,
  totalPages,
  isColorPanelOpen,
  isShapePanelOpen,
  isBoardSettingsOpen,
  isFormulaModalOpen,
  activeColor,
  isDashed = false,
  onToggleDashed,
  onSelectTool,
  onSetDock,
  onToggleColorPanel,
  onToggleShapePanel,
  onToggleBoardSettings,
  onOpenFormulaModal,
  onOpenGraphModal,
  onOpenImageUpload,
  onUndo,
  onRedo,
  onZoomIn,
  onZoomOut,
  onToggleLockZoom,
  onToggleViewMode,
  onPrevPage,
  onNextPage,
  onAddPage,
  onSaveProject,
  onLoadProject,
  onExportPdf,
  onExportImage,
}) => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const isDraggingRef = useRef(false);
  const dragStartPosRef = useRef({ mouseX: 0, mouseY: 0, dockX: 0, dockY: 0 });

  // Handle Fullscreen
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  };

  // Button size classes
  const sizeClasses = {
    compact: 'p-1.5 text-xs',
    normal: 'p-2.5 text-sm',
    large: 'p-3.5 text-base',
  }[buttonSize];

  const iconSizes = {
    compact: 16,
    normal: 20,
    large: 24,
  }[buttonSize];

  // Dynamic Icon for Pen Group based on current penType
  const renderPenIcon = () => {
    if (penType === 'fountain') return <Feather size={iconSizes} />;
    if (penType === 'highlighter') return <Highlighter size={iconSizes} />;
    return <Pen size={iconSizes} />;
  };

  // Dynamic Icon for Shape Group based on current shapeType
  const renderShapeIcon = () => {
    switch (shapeType) {
      case 'circle': return <Circle size={iconSizes} />;
      case 'rect':
      case 'square': return <Square size={iconSizes} />;
      case 'triangle':
      case 'right_triangle': return <Triangle size={iconSizes} />;
      case 'arrow':
      case 'ray': return <ArrowRight size={iconSizes} />;
      case 'parabola':
      case 'cubic_function':
      case 'rational_function':
      case 'quadratic_rational_function':
      case 'coordinate_oxy': return <TrendingUp size={iconSizes} />;
      default: return <Shapes size={iconSizes} />;
    }
  };

  // Dragging logic
  const handlePointerDownDrag = (e: React.PointerEvent) => {
    e.preventDefault();
    e.stopPropagation();
    isDraggingRef.current = true;
    dragStartPosRef.current = {
      mouseX: e.clientX,
      mouseY: e.clientY,
      dockX: dock.x,
      dockY: dock.y,
    };

    const handlePointerMove = (ev: PointerEvent) => {
      if (!isDraggingRef.current) return;
      const dx = ev.clientX - dragStartPosRef.current.mouseX;
      const dy = ev.clientY - dragStartPosRef.current.mouseY;
      const newX = dragStartPosRef.current.dockX + dx;
      const newY = dragStartPosRef.current.dockY + dy;

      // Snap edge detection
      const snapDist = 45;
      const winW = window.innerWidth;
      const winH = window.innerHeight;

      let pos: ToolbarDock['position'] = 'float';
      if (ev.clientX < snapDist) pos = 'left';
      else if (ev.clientX > winW - snapDist) pos = 'right';
      else if (ev.clientY < snapDist) pos = 'top';
      else if (ev.clientY > winH - snapDist) pos = 'bottom';

      onSetDock({
        position: pos,
        x: Math.max(10, Math.min(winW - 100, newX)),
        y: Math.max(10, Math.min(winH - 80, newY)),
        isCollapsed: dock.isCollapsed,
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

  // Double click handle toggles collapse/hide
  const handleDoubleClickHandle = () => {
    onSetDock({
      ...dock,
      isCollapsed: !dock.isCollapsed,
    });
  };

  const isVertical = dock.position === 'left' || dock.position === 'right';

  // Floating or docked positioning style
  const getDockPositionStyle = (): React.CSSProperties => {
    if (dock.position === 'top') {
      return { top: '12px', left: '50%', transform: 'translateX(-50%)' };
    }
    if (dock.position === 'bottom') {
      return { bottom: '12px', left: '50%', transform: 'translateX(-50%)' };
    }
    if (dock.position === 'left') {
      return { left: '12px', top: '50%', transform: 'translateY(-50%)' };
    }
    if (dock.position === 'right') {
      return { right: '12px', top: '50%', transform: 'translateY(-50%)' };
    }
    return { left: `${dock.x}px`, top: `${dock.y}px` };
  };

  // If collapsed, show mini floating restore button
  if (dock.isCollapsed) {
    return (
      <div
        style={getDockPositionStyle()}
        className="fixed z-50 transition-all select-none"
      >
        <button
          onClick={handleDoubleClickHandle}
          className="bg-neutral-900/90 hover:bg-neutral-800 text-white p-3 rounded-2xl shadow-2xl border border-neutral-700/80 flex items-center gap-2 backdrop-blur-md transition-transform hover:scale-105 active:scale-95"
          title="Kích đúp để mở lại thanh công cụ MATHEMATICS INTERACTIVE BOARD _ PHẠM HẬU"
        >
          <Pen size={18} className="text-emerald-400" />
          <span className="text-xs font-semibold tracking-wide pr-1">MATHEMATICS INTERACTIVE BOARD _ PHẠM HẬU</span>
        </button>
      </div>
    );
  }

  return (
    <div
      style={getDockPositionStyle()}
      className={`fixed z-50 select-none bg-neutral-900/95 backdrop-blur-md border border-neutral-700/70 shadow-2xl rounded-2xl text-neutral-200 transition-shadow ${
        isVertical ? 'flex flex-col py-2 px-1.5' : 'flex flex-row items-center px-2 py-1.5'
      }`}
    >
      {/* Drag Handle with Double Click indicator */}
      <div
        onPointerDown={handlePointerDownDrag}
        onDoubleClick={handleDoubleClickHandle}
        className={`cursor-grab active:cursor-grabbing hover:bg-neutral-800 rounded-lg flex items-center justify-center text-neutral-400 hover:text-neutral-100 transition-colors ${
          isVertical ? 'py-1.5 mb-1 w-full' : 'px-1.5 mr-1 h-full'
        }`}
        title="Kéo để di chuyển đến 4 cạnh hoặc bất kỳ đâu. Kích đúp để ẩn thanh công cụ."
      >
        {isVertical ? <GripHorizontal size={16} /> : <GripVertical size={16} />}
      </div>

      {/* Main Tool Buttons */}
      <div className={`flex ${isVertical ? 'flex-col gap-1' : 'flex-row items-center gap-1'}`}>
        {/* Pointer / Select */}
        <button
          onClick={() => onSelectTool('select')}
          className={`${sizeClasses} rounded-xl transition-all ${
            currentTool === 'select'
              ? 'bg-blue-600 text-white font-medium shadow-md shadow-blue-500/30'
              : 'hover:bg-neutral-800 text-neutral-300 hover:text-white'
          }`}
          title="Chọn & Di chuyển (V)"
        >
          <MousePointer size={iconSizes} />
        </button>

        {/* Dynamic Pen Button */}
        <button
          onClick={() => {
            onSelectTool('pen');
            onToggleColorPanel();
          }}
          className={`${sizeClasses} rounded-xl transition-all relative ${
            currentTool === 'pen'
              ? 'bg-emerald-600 text-white font-medium shadow-md shadow-emerald-500/30 ring-2 ring-emerald-400/50'
              : 'hover:bg-neutral-800 text-neutral-300 hover:text-white'
          }`}
          title={`Bút viết tay: ${penType === 'standard' ? 'Bút thường' : penType === 'fountain' ? 'Bút máy nét thanh đậm' : 'Bút tô màu'}`}
        >
          {renderPenIcon()}
          {/* Active Color dot indicator */}
          <span
            className="absolute bottom-1 right-1 w-2 h-2 rounded-full border border-black/40"
            style={{ backgroundColor: activeColor }}
          />
        </button>

        {/* Dynamic Eraser Button */}
        <button
          onClick={() => onSelectTool('eraser')}
          className={`${sizeClasses} rounded-xl transition-all ${
            currentTool === 'eraser'
              ? 'bg-amber-600 text-white font-medium shadow-md shadow-amber-500/30 ring-2 ring-amber-400/50'
              : 'hover:bg-neutral-800 text-neutral-300 hover:text-white'
          }`}
          title={`Tẩy nét vẽ (${eraserMode === 'stroke' ? 'Tẩy nét' : 'Tẩy điểm'})`}
        >
          <Eraser size={iconSizes} />
        </button>

        {/* Dynamic Shapes Button */}
        <button
          onClick={() => {
            onSelectTool('shape');
            onToggleShapePanel();
          }}
          className={`${sizeClasses} rounded-xl transition-all ${
            currentTool === 'shape'
              ? 'bg-purple-600 text-white font-medium shadow-md shadow-purple-500/30 ring-2 ring-purple-400/50'
              : 'hover:bg-neutral-800 text-neutral-300 hover:text-white'
          }`}
          title="Dựng hình toán học (Tam giác, đường tròn, hệ trục Oxy, elip...)"
        >
          {renderShapeIcon()}
        </button>

        {/* Nét Đứt Đoạn (Dashed Line) Quick Toggle Button */}
        {onToggleDashed && (
          <button
            onClick={onToggleDashed}
            className={`${sizeClasses} rounded-xl transition-all relative ${
              isDashed
                ? 'bg-amber-600 text-white font-medium shadow-md shadow-amber-500/40 ring-2 ring-amber-400/60'
                : 'hover:bg-neutral-800 text-neutral-300 hover:text-white'
            }`}
            title={`Vẽ nét đứt đoạn (- - -) cho bút viết & hình học (Phím tắt: D) - Hiện: ${isDashed ? 'ĐANG BẬT' : 'ĐANG TẮT'}`}
          >
            <div className="flex items-center justify-center">
              <svg
                width={iconSizes}
                height={iconSizes}
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.8"
                strokeLinecap="round"
              >
                <line x1="2" y1="12" x2="6.5" y2="12" />
                <line x1="10" y1="12" x2="14.5" y2="12" />
                <line x1="18" y1="12" x2="22" y2="12" />
              </svg>
            </div>
            {isDashed && (
              <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-amber-400 ring-2 ring-neutral-900 animate-pulse" />
            )}
          </button>
        )}

        {/* Function Graph Plotter Button */}
        <button
          onClick={onOpenGraphModal}
          className={`${sizeClasses} rounded-xl hover:bg-neutral-800 text-emerald-400 hover:text-emerald-300 transition-all hover:scale-105 active:scale-95`}
          title="Vẽ đồ thị hàm số (Bậc 3, Nhất biến, Bậc 2 trên bậc 1)"
        >
          <TrendingUp size={iconSizes} />
        </button>

        {/* Text & LaTeX Formula */}
        <button
          onClick={() => {
            onSelectTool('text');
            onOpenFormulaModal();
          }}
          className={`${sizeClasses} rounded-xl transition-all ${
            currentTool === 'text'
              ? 'bg-indigo-600 text-white font-medium shadow-md shadow-indigo-500/30'
              : 'hover:bg-neutral-800 text-neutral-300 hover:text-white'
          }`}
          title="Đánh máy & Chèn công thức toán LaTeX (T)"
        >
          <Type size={iconSizes} />
        </button>

        {/* Laser pointer for lectures */}
        <button
          onClick={() => onSelectTool('laser')}
          className={`${sizeClasses} rounded-xl transition-all ${
            currentTool === 'laser'
              ? 'bg-red-600 text-white font-medium shadow-md shadow-red-500/40 ring-2 ring-red-400/50'
              : 'hover:bg-neutral-800 text-neutral-300 hover:text-white'
          }`}
          title="Bút Laser giảng bài (Tia phát sáng mờ dần)"
        >
          <Sparkles size={iconSizes} />
        </button>

        {/* Virtual Ruler & Protractor */}
        <button
          onClick={() => onSelectTool('ruler')}
          className={`${sizeClasses} rounded-xl transition-all ${
            currentTool === 'ruler'
              ? 'bg-teal-600 text-white font-medium shadow-md shadow-teal-500/30'
              : 'hover:bg-neutral-800 text-neutral-300 hover:text-white'
          }`}
          title="Thước kẻ cm & Thước đo góc ảo"
        >
          <Ruler size={iconSizes} />
        </button>

        {/* Insert Image / Diagram */}
        <button
          onClick={onOpenImageUpload}
          className={`${sizeClasses} rounded-xl hover:bg-neutral-800 text-neutral-300 hover:text-white transition-all`}
          title="Chèn ảnh / Đề thi / Tài liệu minh hoạ"
        >
          <ImageIcon size={iconSizes} />
        </button>
      </div>

      {/* Divider */}
      <div className={`bg-neutral-700/80 my-1 ${isVertical ? 'h-[1px] w-full my-1.5' : 'w-[1px] h-6 mx-1.5'}`} />

      {/* Sub-panels & Adjustments */}
      <div className={`flex ${isVertical ? 'flex-col gap-1' : 'flex-row items-center gap-1'}`}>
        {/* Colors & Thickness panel toggle */}
        <button
          onClick={onToggleColorPanel}
          className={`${sizeClasses} rounded-xl transition-all ${
            isColorPanelOpen
              ? 'bg-neutral-700 text-white shadow-inner'
              : 'hover:bg-neutral-800 text-neutral-300 hover:text-white'
          }`}
          title="Bảng màu & Độ dày nét"
        >
          <Palette size={iconSizes} />
        </button>

        {/* Board Config & Paper Size panel toggle */}
        <button
          onClick={onToggleBoardSettings}
          className={`${sizeClasses} rounded-xl transition-all ${
            isBoardSettingsOpen
              ? 'bg-neutral-700 text-white shadow-inner'
              : 'hover:bg-neutral-800 text-neutral-300 hover:text-white'
          }`}
          title="Khổ bảng (A4, A5, 16:9...) & Nền viết (Ô ly, bảng xanh...)"
        >
          <Layout size={iconSizes} />
        </button>

        {/* Undo / Redo */}
        <button
          onClick={onUndo}
          disabled={!canUndo}
          className={`${sizeClasses} rounded-xl transition-all ${
            canUndo ? 'hover:bg-neutral-800 text-neutral-200' : 'text-neutral-600 cursor-not-allowed'
          }`}
          title="Hoàn tác (Ctrl+Z)"
        >
          <RotateCcw size={iconSizes} />
        </button>

        <button
          onClick={onRedo}
          disabled={!canRedo}
          className={`${sizeClasses} rounded-xl transition-all ${
            canRedo ? 'hover:bg-neutral-800 text-neutral-200' : 'text-neutral-600 cursor-not-allowed'
          }`}
          title="Làm lại (Ctrl+Y)"
        >
          <RotateCw size={iconSizes} />
        </button>
      </div>

      {/* Divider */}
      <div className={`bg-neutral-700/80 my-1 ${isVertical ? 'h-[1px] w-full my-1.5' : 'w-[1px] h-6 mx-1.5'}`} />

      {/* Zoom & View Controls */}
      <div className={`flex ${isVertical ? 'flex-col gap-1' : 'flex-row items-center gap-1'}`}>
        <button
          onClick={onZoomIn}
          disabled={isZoomLocked}
          className={`${sizeClasses} rounded-xl hover:bg-neutral-800 text-neutral-300 hover:text-white transition-all disabled:opacity-40`}
          title="Phóng to"
        >
          <ZoomIn size={iconSizes} />
        </button>

        <button
          onClick={onZoomOut}
          disabled={isZoomLocked}
          className={`${sizeClasses} rounded-xl hover:bg-neutral-800 text-neutral-300 hover:text-white transition-all disabled:opacity-40`}
          title="Thu nhỏ"
        >
          <ZoomOut size={iconSizes} />
        </button>

        {/* Lock Zoom toggle */}
        <button
          onClick={onToggleLockZoom}
          className={`${sizeClasses} rounded-xl transition-all ${
            isZoomLocked ? 'bg-amber-700/70 text-amber-200' : 'hover:bg-neutral-800 text-neutral-400 hover:text-neutral-200'
          }`}
          title={isZoomLocked ? 'Đang khóa mức thu phóng' : 'Khóa mức thu phóng'}
        >
          {isZoomLocked ? <Lock size={iconSizes} /> : <Unlock size={iconSizes} />}
        </button>

        {/* View Mode: Fit page vs Fit width */}
        <button
          onClick={onToggleViewMode}
          className={`${sizeClasses} rounded-xl hover:bg-neutral-800 text-neutral-300 hover:text-white transition-all font-mono-numbers text-xs px-2`}
          title={viewMode === 'fit_page' ? 'Chế độ: Vừa trọn trang' : 'Chế độ: Vừa chiều ngang để cuộn'}
        >
          {viewMode === 'fit_page' ? 'Trọn' : 'Cuộn'}
        </button>

        {/* Fullscreen */}
        <button
          onClick={toggleFullscreen}
          className={`${sizeClasses} rounded-xl hover:bg-neutral-800 text-neutral-300 hover:text-white transition-all`}
          title={isFullscreen ? 'Thoát toàn màn hình' : 'Toàn màn hình'}
        >
          {isFullscreen ? <Minimize2 size={iconSizes} /> : <Maximize2 size={iconSizes} />}
        </button>
      </div>

      {/* Divider */}
      <div className={`bg-neutral-700/80 my-1 ${isVertical ? 'h-[1px] w-full my-1.5' : 'w-[1px] h-6 mx-1.5'}`} />

      {/* Page Navigation */}
      <div className={`flex ${isVertical ? 'flex-col gap-1' : 'flex-row items-center gap-1'}`}>
        <button
          onClick={onPrevPage}
          disabled={currentPageIndex === 0}
          className={`${sizeClasses} rounded-xl hover:bg-neutral-800 text-neutral-300 disabled:opacity-30`}
          title="Trang trước"
        >
          <ChevronLeft size={iconSizes} />
        </button>

        <span className="text-xs font-mono-numbers font-medium text-neutral-300 px-1 text-center whitespace-nowrap">
          {currentPageIndex + 1}/{totalPages}
        </span>

        <button
          onClick={onNextPage}
          disabled={currentPageIndex === totalPages - 1}
          className={`${sizeClasses} rounded-xl hover:bg-neutral-800 text-neutral-300 disabled:opacity-30`}
          title="Trang sau"
        >
          <ChevronRight size={iconSizes} />
        </button>

        <button
          onClick={onAddPage}
          className={`${sizeClasses} rounded-xl hover:bg-emerald-900/60 text-emerald-400 hover:text-emerald-300 transition-all`}
          title="Thêm trang mới"
        >
          <Plus size={iconSizes} />
        </button>
      </div>
    </div>
  );
};
