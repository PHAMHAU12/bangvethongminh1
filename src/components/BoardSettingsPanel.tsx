/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useRef } from 'react';
import { BackgroundType, PaperSize, ViewMode, BoardConfig } from '../types/emath';
import {
  GripHorizontal,
  X,
  FileText,
  Monitor,
  Smartphone,
  Tablet,
  Check,
  Download,
  Upload,
  FileDown,
  Image as ImageIcon,
  Touchpad,
  Settings,
  Grid
} from 'lucide-react';

interface BoardSettingsPanelProps {
  isOpen: boolean;
  onClose: () => void;
  config: BoardConfig;
  onUpdateConfig: (newConfig: Partial<BoardConfig>) => void;
  onSelectPaperSize: (size: PaperSize) => void;
  onSelectBackground: (bg: BackgroundType) => void;
  onExportPdf: () => void;
  onExportImage: () => void;
  onExportWord?: () => void;
  onExportPowerPoint?: () => void;
  onSaveProject: () => void;
  onLoadProject: () => void;
  position: { x: number; y: number };
  onUpdatePosition: (pos: { x: number; y: number }) => void;
}

export const BoardSettingsPanel: React.FC<BoardSettingsPanelProps> = ({
  isOpen,
  onClose,
  config,
  onUpdateConfig,
  onSelectPaperSize,
  onSelectBackground,
  onExportPdf,
  onExportImage,
  onExportWord,
  onExportPowerPoint,
  onSaveProject,
  onLoadProject,
  position,
  onUpdatePosition,
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
        x: Math.max(10, Math.min(window.innerWidth - 360, dragStartRef.current.startX + dx)),
        y: Math.max(10, Math.min(window.innerHeight - 520, dragStartRef.current.startY + dy)),
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

  const paperSizes: { id: PaperSize; label: string; desc: string; icon: React.ReactNode; group: 'print' | 'screen' }[] = [
    { id: 'A4', label: 'Khổ A4', desc: '210 × 297 mm (Chuẩn in ấn)', icon: <FileText size={16} />, group: 'print' },
    { id: 'A5', label: 'Khổ A5', desc: '148 × 210 mm (Sổ tay / Vở)', icon: <FileText size={16} />, group: 'print' },
    { id: '16:9', label: 'Bảng ngang 16:9', desc: 'Máy chiếu, TV & Màn hình', icon: <Monitor size={16} />, group: 'screen' },
    { id: '9:16', label: 'Bảng dọc 9:16', desc: 'Điện thoại di động', icon: <Smartphone size={16} />, group: 'screen' },
    { id: '16:10', label: 'Tablet 16:10', desc: 'Máy tính bảng Android', icon: <Tablet size={16} />, group: 'screen' },
    { id: '4:3', label: 'iPad 4:3', desc: 'Tỷ lệ màn hình iPad', icon: <Tablet size={16} />, group: 'screen' },
    { id: '3:2', label: 'Surface 3:2', desc: 'Microsoft Surface', icon: <Monitor size={16} />, group: 'screen' },
  ];

  const backgrounds: { id: BackgroundType; label: string; previewClass: string; textColor: string }[] = [
    { id: 'oly', label: 'Nền ô ly', previewClass: 'bg-white border-sky-300', textColor: 'text-neutral-800' },
    { id: 'grid', label: 'Nền lưới vuông', previewClass: 'bg-slate-50 border-slate-300', textColor: 'text-neutral-800' },
    { id: 'ruled', label: 'Nền trắng kẻ ngang', previewClass: 'bg-white border-rose-300', textColor: 'text-neutral-800' },
    { id: 'white', label: 'Nền trắng trơn', previewClass: 'bg-white border-neutral-300', textColor: 'text-neutral-800' },
    { id: 'green', label: 'Bảng xanh', previewClass: 'bg-[#1b4332] border-[#2d6a4f]', textColor: 'text-emerald-100' },
    { id: 'green_oly', label: 'Bảng xanh ô ly', previewClass: 'bg-[#1e3f20] border-emerald-600', textColor: 'text-emerald-100' },
    { id: 'green_ruled', label: 'Bảng xanh kẻ ngang', previewClass: 'bg-[#1b4332] border-emerald-500', textColor: 'text-emerald-100' },
    { id: 'black', label: 'Bảng đen', previewClass: 'bg-neutral-900 border-neutral-700', textColor: 'text-neutral-200' },
  ];

  return (
    <div
      style={{ left: `${position.x}px`, top: `${position.y}px` }}
      className="fixed z-50 w-88 bg-neutral-900/95 backdrop-blur-md border border-neutral-700/80 rounded-2xl shadow-2xl p-4 text-neutral-100 select-none text-sm floating-panel max-h-[88vh] overflow-y-auto"
    >
      {/* Header */}
      <div className="flex items-center justify-between pb-3 mb-3 border-b border-neutral-800">
        <div
          onPointerDown={handlePointerDownDrag}
          className="flex items-center gap-2 cursor-grab active:cursor-grabbing text-neutral-400 hover:text-neutral-200 flex-1"
          title="Kéo tay nắm để di chuyển cài đặt bảng"
        >
          <GripHorizontal size={18} />
          <span className="font-semibold text-xs tracking-wider uppercase text-neutral-300">
            Khổ Bảng & Nền Viết
          </span>
        </div>
        <button
          onClick={onClose}
          className="p-1 text-neutral-400 hover:text-white rounded-lg hover:bg-neutral-800 transition-colors"
        >
          <X size={16} />
        </button>
      </div>

      {/* 1. Khổ giấy in ấn */}
      <div className="mb-4">
        <div className="text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-2">
          Khổ giấy in ấn (Xuất PDF chuẩn)
        </div>
        <div className="grid grid-cols-2 gap-2">
          {paperSizes.filter((p) => p.group === 'print').map((item) => (
            <button
              key={item.id}
              onClick={() => onSelectPaperSize(item.id)}
              className={`p-2.5 rounded-xl border text-left transition-all ${
                config.paperSize === item.id
                  ? 'border-emerald-500 bg-emerald-950/40 text-white ring-1 ring-emerald-500'
                  : 'border-neutral-800 bg-neutral-800/40 hover:bg-neutral-800 text-neutral-300'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="font-bold text-xs">{item.label}</span>
                {config.paperSize === item.id && <Check size={14} className="text-emerald-400" />}
              </div>
              <div className="text-[11px] text-neutral-400">{item.desc}</div>
            </button>
          ))}
        </div>
      </div>

      {/* 2. Khổ bảng trình chiếu / thiết bị */}
      <div className="mb-4">
        <div className="text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-2">
          Khổ bảng thiết bị & trình chiếu
        </div>
        <div className="grid grid-cols-2 gap-2">
          {paperSizes.filter((p) => p.group === 'screen').map((item) => (
            <button
              key={item.id}
              onClick={() => onSelectPaperSize(item.id)}
              className={`p-2 rounded-xl border text-left transition-all ${
                config.paperSize === item.id
                  ? 'border-emerald-500 bg-emerald-950/40 text-white ring-1 ring-emerald-500'
                  : 'border-neutral-800 bg-neutral-800/40 hover:bg-neutral-800 text-neutral-300'
              }`}
            >
              <div className="flex items-center justify-between mb-0.5">
                <span className="font-semibold text-xs">{item.label}</span>
                {config.paperSize === item.id && <Check size={14} className="text-emerald-400" />}
              </div>
              <div className="text-[10px] text-neutral-400 truncate">{item.desc}</div>
            </button>
          ))}
        </div>
      </div>

      {/* 3. Nền bảng (8 nền) */}
      <div className="mb-4">
        <div className="text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-2">
          Nền bảng viết (8 kiểu nền)
        </div>
        <div className="grid grid-cols-2 gap-2">
          {backgrounds.map((bg) => (
            <button
              key={bg.id}
              onClick={() => onSelectBackground(bg.id)}
              className={`p-2 rounded-xl border flex items-center gap-2.5 transition-all text-left ${
                config.background === bg.id
                  ? 'border-emerald-500 ring-2 ring-emerald-500/50 bg-neutral-800'
                  : 'border-neutral-800 hover:border-neutral-700 bg-neutral-800/40'
              }`}
            >
              <div
                className={`w-7 h-7 rounded-lg border flex-shrink-0 shadow-inner ${bg.previewClass}`}
              />
              <span className="text-xs font-medium text-neutral-200 truncate">{bg.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* 4. Chế độ hiển thị & Cảm ứng */}
      <div className="mb-4 pt-3 border-t border-neutral-800 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs text-neutral-300">Chế độ xem trang:</span>
          <div className="flex bg-neutral-800 p-0.5 rounded-lg text-xs">
            <button
              onClick={() => onUpdateConfig({ viewMode: 'fit_page' })}
              className={`px-2.5 py-1 rounded-md transition-all ${
                config.viewMode === 'fit_page' ? 'bg-neutral-700 text-white font-medium shadow-sm' : 'text-neutral-400 hover:text-white'
              }`}
            >
              Vừa trọn trang
            </button>
            <button
              onClick={() => onUpdateConfig({ viewMode: 'fit_width' })}
              className={`px-2.5 py-1 rounded-md transition-all ${
                config.viewMode === 'fit_width' ? 'bg-neutral-700 text-white font-medium shadow-sm' : 'text-neutral-400 hover:text-white'
              }`}
            >
              Vừa chiều ngang
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-xs text-neutral-300">Kích thước nút:</span>
          <div className="flex bg-neutral-800 p-0.5 rounded-lg text-xs">
            {(['compact', 'normal', 'large'] as const).map((sz) => (
              <button
                key={sz}
                onClick={() => onUpdateConfig({ buttonSize: sz })}
                className={`px-2 py-1 rounded-md transition-all ${
                  config.buttonSize === sz ? 'bg-neutral-700 text-white font-medium shadow-sm' : 'text-neutral-400 hover:text-white'
                }`}
              >
                {sz === 'compact' ? 'Nhỏ' : sz === 'normal' ? 'Vừa' : 'Lớn'}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-xs text-neutral-300">Thao tác cảm ứng:</span>
          <select
            value={config.touchMode}
            onChange={(e) => onUpdateConfig({ touchMode: e.target.value as any })}
            className="bg-neutral-800 text-neutral-200 text-xs rounded-lg px-2 py-1 border border-neutral-700 cursor-pointer"
          >
            <option value="all">Bút + Ngón tay chạm</option>
            <option value="stylus_only">Chỉ bút (Khử lòng bàn tay)</option>
          </select>
        </div>
      </div>

      {/* 5. Xuất bản & Lưu trữ */}
      <div className="pt-3 border-t border-neutral-800">
        <div className="text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-2">
          Xuất bản & Lưu trữ bài giảng
        </div>
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={onExportPdf}
            className="flex items-center justify-center gap-1.5 py-2 px-3 bg-red-600/90 hover:bg-red-600 text-white rounded-xl text-xs font-semibold transition-all shadow-md shadow-red-900/30"
          >
            <FileDown size={15} />
            <span>Xuất PDF ({config.paperSize})</span>
          </button>

          <button
            onClick={onExportPowerPoint}
            className="flex items-center justify-center gap-1.5 py-2 px-3 bg-amber-700/90 hover:bg-amber-600 text-white rounded-xl text-xs font-semibold transition-all shadow-md"
            title="Xuất slide trình chiếu PowerPoint"
          >
            <Monitor size={15} />
            <span>Xuất Slides (PPTX)</span>
          </button>

          <button
            onClick={onExportWord}
            className="flex items-center justify-center gap-1.5 py-2 px-3 bg-blue-700/90 hover:bg-blue-600 text-white rounded-xl text-xs font-semibold transition-all shadow-md"
            title="Xuất giáo án tài liệu Word"
          >
            <FileText size={15} />
            <span>Xuất Word (DOCX)</span>
          </button>

          <button
            onClick={onExportImage}
            className="flex items-center justify-center gap-1.5 py-2 px-3 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 rounded-xl text-xs font-medium transition-all"
          >
            <ImageIcon size={15} />
            <span>Lưu ảnh PNG</span>
          </button>

          <button
            onClick={onSaveProject}
            className="flex items-center justify-center gap-1.5 py-2 px-3 bg-emerald-700 hover:bg-emerald-600 text-white rounded-xl text-xs font-medium transition-all"
          >
            <Download size={15} />
            <span>Lưu file .emath</span>
          </button>

          <button
            onClick={onLoadProject}
            className="flex items-center justify-center gap-1.5 py-2 px-3 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 rounded-xl text-xs font-medium transition-all"
          >
            <Upload size={15} />
            <span>Mở file .emath</span>
          </button>
        </div>
      </div>
    </div>
  );
};
