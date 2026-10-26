/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  Key,
  Sparkles,
  Gamepad2,
  Maximize2,
  Minimize2,
  HelpCircle,
  FileSpreadsheet,
  CheckCircle,
  AlertTriangle
} from 'lucide-react';
import { getStoredApiKey } from '../utils/geminiService';

interface HeaderProps {
  onOpenApiKeyModal: () => void;
  onOpenMathAiModal: () => void;
  onOpenClassroomTools: () => void;
  currentPageIndex: number;
  totalPages: number;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenApiKeyModal,
  onOpenMathAiModal,
  onOpenClassroomTools,
  currentPageIndex,
  totalPages,
}) => {
  const [hasApiKey, setHasApiKey] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    const checkKey = () => {
      setHasApiKey(!!getStoredApiKey());
    };
    checkKey();
    window.addEventListener('storage', checkKey);
    return () => window.removeEventListener('storage', checkKey);
  }, []);

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

  return (
    <header className="h-11 bg-neutral-900/95 border-b border-neutral-800/80 px-3 flex items-center justify-between text-neutral-200 select-none backdrop-blur-md z-30 shrink-0 shadow-sm">
      {/* Left: Branding & App Title */}
      <div className="flex items-center gap-2.5">
        <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center text-neutral-950 font-black text-xs shadow-xs">
          π
        </div>
        <div className="flex items-center gap-2">
          <span className="font-extrabold text-xs tracking-wider text-amber-400 font-sans hidden sm:inline">
            MATHEMATICS INTERACTIVE BOARD
          </span>
          <span className="text-[11px] font-medium text-neutral-400 hidden md:inline">
            _ PHẠM HẬU
          </span>
          <span className="text-[10px] bg-neutral-800 px-1.5 py-0.5 rounded text-neutral-400 border border-neutral-700 font-mono">
            Trang {currentPageIndex + 1}/{totalPages}
          </span>
        </div>
      </div>

      {/* Right: Actions & API Key Required Notice */}
      <div className="flex items-center gap-2">
        {/* API Key Setting Button with RED text per AI_INSTRUCTIONS.md */}
        <button
          onClick={onOpenApiKeyModal}
          title="Thiết lập API Key Google Gemini và Model AI"
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all border bg-neutral-800/90 border-neutral-700 text-neutral-200 hover:border-amber-500/50 hover:bg-neutral-800 shadow-sm"
        >
          <Key size={13} className="text-amber-400" />
          <span className="text-[11px] font-bold">Settings (API Key)</span>
          <span className="text-[10px] font-bold text-red-400 bg-red-950/90 px-1.5 py-0.5 rounded border border-red-500/70 ml-0.5 whitespace-nowrap">
            Lấy API key để sử dụng app
          </span>
          {hasApiKey && (
            <CheckCircle size={12} className="text-emerald-400 ml-0.5 shrink-0" title="Đã có Key trong máy" />
          )}
        </button>

        {/* Math AI Pedagogical Assistant Button */}
        <button
          onClick={onOpenMathAiModal}
          title="Trợ lý Sư Phạm Toán Học AI (Giải toán 3 bước & Sinh đề tương tự)"
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-gradient-to-r from-indigo-950/80 to-purple-950/80 border border-indigo-500/40 text-indigo-200 hover:border-indigo-400 hover:text-white transition-all shadow-xs"
        >
          <Sparkles size={13} className="text-amber-300" />
          <span className="text-[11px] font-bold">AI Sư Phạm Toán</span>
        </button>

        {/* Classroom Interactive Gamification Tools (Wheel & Timer) */}
        <button
          onClick={onOpenClassroomTools}
          title="Tiện ích Lớp học: Vòng quay may mắn gọi tên & Đồng hồ đếm ngược"
          className="flex items-center gap-1.5 px-2 py-1 rounded-lg text-xs font-medium bg-neutral-800 border border-neutral-700 text-neutral-300 hover:text-white hover:border-neutral-600 transition-colors"
        >
          <Gamepad2 size={13} className="text-emerald-400" />
          <span className="text-[11px] hidden sm:inline">Tiện Ích Lớp Học</span>
        </button>

        {/* Fullscreen Toggle */}
        <button
          onClick={toggleFullscreen}
          title={isFullscreen ? 'Thu nhỏ màn hình' : 'Toàn màn hình trình chiếu'}
          className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
        >
          {isFullscreen ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
        </button>
      </div>
    </header>
  );
};
