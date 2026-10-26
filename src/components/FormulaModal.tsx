/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import katex from 'katex';
import { X, Check, Type, Sparkles } from 'lucide-react';

interface FormulaModalProps {
  isOpen: boolean;
  onClose: () => void;
  onInsertText: (content: string, isFormula: boolean, latex?: string, fontSize?: number) => void;
  defaultColor?: string;
}

export const FormulaModal: React.FC<FormulaModalProps> = ({
  isOpen,
  onClose,
  onInsertText,
  defaultColor = '#ffffff',
}) => {
  const [tab, setTab] = useState<'text' | 'formula'>('formula');
  const [textContent, setTextContent] = useState('');
  const [latexInput, setLatexInput] = useState('\\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}');
  const [fontSize, setFontSize] = useState(24);
  const [previewHtml, setPreviewHtml] = useState('');
  const previewRef = useRef<HTMLDivElement>(null);

  // Update KaTeX preview
  useEffect(() => {
    if (tab === 'formula' && latexInput) {
      try {
        const rendered = katex.renderToString(latexInput, {
          displayMode: true,
          throwOnError: false,
        });
        setPreviewHtml(rendered);
      } catch (e) {
        setPreviewHtml('<span style="color: #ef4444">Lỗi cú pháp LaTeX</span>');
      }
    }
  }, [latexInput, tab]);

  if (!isOpen) return null;

  const quickSymbols = [
    { label: 'x²', tex: 'x^2' },
    { label: '√x', tex: '\\sqrt{x}' },
    { label: 'a/b', tex: '\\frac{a}{b}' },
    { label: '±', tex: '\\pm' },
    { label: 'π', tex: '\\pi' },
    { label: 'α', tex: '\\alpha' },
    { label: 'β', tex: '\\beta' },
    { label: 'θ', tex: '\\theta' },
    { label: 'Δ', tex: '\\Delta' },
    { label: '≠', tex: '\\neq' },
    { label: '≤', tex: '\\le' },
    { label: '≥', tex: '\\ge' },
    { label: '∈', tex: '\\in' },
    { label: '⊂', tex: '\\subset' },
    { label: '∪', tex: '\\cup' },
    { label: '∩', tex: '\\cap' },
    { label: '∞', tex: '\\infty' },
    { label: '⊥', tex: '\\perp' },
    { label: '∥', tex: '\\parallel' },
    { label: 'vec{u}', tex: '\\vec{u}' },
    { label: '∫', tex: '\\int_{a}^{b} f(x) dx' },
    { label: 'lim', tex: '\\lim_{x \\to x_0}' },
    { label: '∑', tex: '\\sum_{i=1}^{n}' },
    { label: 'Góc', tex: '\\widehat{ABC}' },
  ];

  const handleInsertSymbol = (tex: string) => {
    setLatexInput((prev) => prev + (prev.endsWith(' ') ? '' : ' ') + tex);
  };

  const handleConfirm = () => {
    if (tab === 'formula') {
      if (!latexInput.trim()) return;
      onInsertText(latexInput, true, latexInput, fontSize);
    } else {
      if (!textContent.trim()) return;
      onInsertText(textContent, false, undefined, fontSize);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-lg bg-neutral-900 border border-neutral-700 rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-4 border-b border-neutral-800">
          <div className="flex items-center gap-2">
            <span className="font-bold text-sm tracking-wide text-neutral-100">
              Đánh máy & Chèn Công thức Toán
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800"
          >
            <X size={18} />
          </button>
        </div>

        {/* Tab Selector */}
        <div className="flex border-b border-neutral-800 bg-neutral-950/50 p-1">
          <button
            onClick={() => setTab('formula')}
            className={`flex-1 py-2 text-xs font-semibold rounded-lg flex items-center justify-center gap-2 transition-all ${
              tab === 'formula'
                ? 'bg-neutral-800 text-indigo-300 shadow-sm'
                : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <Sparkles size={15} />
            <span>Công thức Toán (KaTeX / LaTeX)</span>
          </button>
          <button
            onClick={() => setTab('text')}
            className={`flex-1 py-2 text-xs font-semibold rounded-lg flex items-center justify-center gap-2 transition-all ${
              tab === 'text'
                ? 'bg-neutral-800 text-neutral-100 shadow-sm'
                : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <Type size={15} />
            <span>Văn bản thông thường</span>
          </button>
        </div>

        <div className="p-4 space-y-4">
          {tab === 'formula' ? (
            <>
              {/* LaTeX Input */}
              <div>
                <label className="block text-xs font-medium text-neutral-400 mb-1.5">
                  Nhập mã LaTeX:
                </label>
                <textarea
                  value={latexInput}
                  onChange={(e) => setLatexInput(e.target.value)}
                  rows={3}
                  className="w-full bg-neutral-950 border border-neutral-700 rounded-xl p-3 text-sm font-mono text-neutral-100 focus:outline-none focus:border-indigo-500"
                  placeholder="Ví dụ: \frac{a}{b}, \sqrt{x^2 + y^2}"
                />
              </div>

              {/* Quick Math Symbols Palette */}
              <div>
                <span className="text-xs font-medium text-neutral-400 mb-1.5 block">
                  Ký hiệu nhanh:
                </span>
                <div className="flex flex-wrap gap-1.5 max-h-28 overflow-y-auto p-1 bg-neutral-950/40 rounded-xl border border-neutral-800">
                  {quickSymbols.map((sym, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleInsertSymbol(sym.tex)}
                      className="px-2 py-1 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs rounded-lg font-math transition-colors"
                      title={sym.tex}
                    >
                      {sym.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Live Preview */}
              <div>
                <span className="text-xs font-medium text-neutral-400 mb-1.5 block">
                  Xem trước trực tiếp:
                </span>
                <div
                  className="w-full min-h-16 p-4 bg-neutral-950 border border-neutral-800 rounded-xl flex items-center justify-center text-white overflow-x-auto text-lg"
                  dangerouslySetInnerHTML={{ __html: previewHtml }}
                />
              </div>
            </>
          ) : (
            <div>
              <label className="block text-xs font-medium text-neutral-400 mb-1.5">
                Nội dung văn bản:
              </label>
              <textarea
                value={textContent}
                onChange={(e) => setTextContent(e.target.value)}
                rows={4}
                className="w-full bg-neutral-950 border border-neutral-700 rounded-xl p-3 text-sm text-neutral-100 focus:outline-none focus:border-indigo-500"
                placeholder="Nhập ghi chú, lời giải hoặc đề bài..."
              />
            </div>
          )}

          {/* Font Size */}
          <div className="flex items-center justify-between pt-2">
            <span className="text-xs text-neutral-400">Cỡ chữ:</span>
            <div className="flex items-center gap-2">
              <input
                type="range"
                min="14"
                max="60"
                value={fontSize}
                onChange={(e) => setFontSize(Number(e.target.value))}
                className="w-32 accent-indigo-500 bg-neutral-800 h-1.5 rounded-lg appearance-none cursor-pointer"
              />
              <span className="text-xs font-mono-numbers text-neutral-300 w-10 text-right">
                {fontSize}px
              </span>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-end gap-2 p-4 border-t border-neutral-800 bg-neutral-950/40">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-neutral-400 hover:text-white rounded-xl hover:bg-neutral-800 transition-colors"
          >
            Hủy bỏ
          </button>
          <button
            onClick={handleConfirm}
            className="px-5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl shadow-md shadow-indigo-900/30 transition-all flex items-center gap-1.5"
          >
            <Check size={16} />
            <span>Chèn lên bảng</span>
          </button>
        </div>
      </div>
    </div>
  );
};
