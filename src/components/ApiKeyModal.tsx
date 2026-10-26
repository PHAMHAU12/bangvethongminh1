/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  Key,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Cpu,
  Sparkles,
  ShieldCheck,
  X
} from 'lucide-react';
import {
  AVAILABLE_MODELS,
  getStoredApiKey,
  setStoredApiKey,
  getStoredModel,
  setStoredModel,
  FALLBACK_CHAIN
} from '../utils/geminiService';

interface ApiKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaved?: () => void;
}

export const ApiKeyModal: React.FC<ApiKeyModalProps> = ({ isOpen, onClose, onSaved }) => {
  const [apiKey, setApiKey] = useState('');
  const [selectedModel, setSelectedModel] = useState('gemini-3-flash-preview');
  const [showKey, setShowKey] = useState(false);
  const [testStatus, setTestStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    if (isOpen) {
      setApiKey(getStoredApiKey());
      setSelectedModel(getStoredModel());
      setTestStatus('idle');
      setErrorMessage('');
      setSuccessMessage('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSave = () => {
    if (!apiKey.trim()) {
      setErrorMessage('Vui lòng nhập API Key để tiếp tục!');
      return;
    }
    setStoredApiKey(apiKey.trim());
    setStoredModel(selectedModel);
    setSuccessMessage('Đã lưu cấu hình API Key & Mô hình thành công!');
    setTimeout(() => {
      if (onSaved) onSaved();
      onClose();
    }, 600);
  };

  const handleTestKey = async () => {
    if (!apiKey.trim()) {
      setErrorMessage('Vui lòng nhập API Key trước khi kiểm tra!');
      return;
    }
    setTestStatus('testing');
    setErrorMessage('');
    setSuccessMessage('');

    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${selectedModel}:generateContent?key=${apiKey.trim()}`;
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: 'Trả lời: OK' }] }],
        }),
      });

      if (!res.ok) {
        const errorText = await res.text();
        let msg = `Lỗi ${res.status}: ${res.statusText}`;
        try {
          const parsed = JSON.parse(errorText);
          if (parsed.error?.message) msg = parsed.error.message;
        } catch {}
        throw new Error(msg);
      }

      setTestStatus('success');
      setSuccessMessage('Khóa API hợp lệ! Đã kết nối thành công với Google Gemini.');
    } catch (err: unknown) {
      setTestStatus('error');
      setErrorMessage(err instanceof Error ? err.message : String(err));
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-neutral-900 border border-neutral-700/80 rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden flex flex-col text-neutral-100">
        {/* Modal Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-neutral-800 to-neutral-900 border-b border-neutral-700/60 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
              <Key size={22} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                Thiết Lập Model & API Key
              </h2>
              <p className="text-xs text-neutral-400">
                Cấu hình Google Gemini AI cho Bảng Tương Tác Toán Học
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          {/* Important Guidance Box */}
          <div className="p-3.5 rounded-xl bg-red-950/40 border border-red-500/40 flex items-start gap-3">
            <AlertCircle size={20} className="text-red-400 shrink-0 mt-0.5" />
            <div className="text-xs text-neutral-200 space-y-1">
              <p className="font-semibold text-red-300">
                Chưa có Google Gemini API Key?
              </p>
              <p className="text-neutral-300">
                Khóa API hoàn toàn miễn phí từ Google AI Studio. Vui lòng truy cập để tạo khóa mới:
              </p>
              <a
                href="https://aistudio.google.com/api-keys"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 text-sky-400 hover:text-sky-300 font-bold underline mt-1 text-xs"
              >
                <span>https://aistudio.google.com/api-keys</span>
                <ExternalLink size={13} />
              </a>
            </div>
          </div>

          {/* Model AI Selection Cards */}
          <div>
            <label className="block text-xs font-semibold text-neutral-300 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
              <Cpu size={14} className="text-amber-400" />
              Chọn Mô Hình AI Ưu Tiên (Cơ chế Tự động Fallback)
            </label>
            <div className="grid grid-cols-1 gap-2.5">
              {AVAILABLE_MODELS.map((model) => {
                const isSelected = selectedModel === model.id;
                return (
                  <div
                    key={model.id}
                    onClick={() => setSelectedModel(model.id)}
                    className={`cursor-pointer rounded-xl p-3 border transition-all ${
                      isSelected
                        ? 'bg-amber-500/10 border-amber-500/80 shadow-md ring-1 ring-amber-500/40'
                        : 'bg-neutral-800/60 border-neutral-700/60 hover:border-neutral-600 hover:bg-neutral-800'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <input
                          type="radio"
                          name="gemini_model"
                          checked={isSelected}
                          onChange={() => setSelectedModel(model.id)}
                          className="text-amber-500 focus:ring-amber-500 h-4 w-4 bg-neutral-900 border-neutral-600"
                        />
                        <span className="font-bold text-sm text-neutral-100">{model.name}</span>
                      </div>
                      <span
                        className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                          model.isDefault
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                            : 'bg-neutral-700 text-neutral-300'
                        }`}
                      >
                        {model.badge}
                      </span>
                    </div>
                    <p className="text-xs text-neutral-400 mt-1 pl-6">
                      {model.description}
                    </p>
                  </div>
                );
              })}
            </div>
            <p className="text-[11px] text-neutral-400 mt-2 italic flex items-center gap-1">
              <Sparkles size={12} className="text-amber-400" />
              Hệ thống sẽ tự động thử tiếp các model trong chuỗi: {FALLBACK_CHAIN.join(' ➔ ')} khi gặp lỗi quota hoặc quá tải (429 RESOURCE_EXHAUSTED).
            </p>
          </div>

          {/* API Key Input */}
          <div>
            <label className="block text-xs font-semibold text-neutral-300 uppercase tracking-wider mb-2 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Key size={14} className="text-amber-400" />
                Google Gemini API Key
              </span>
              <button
                type="button"
                onClick={() => setShowKey(!showKey)}
                className="text-[11px] text-neutral-400 hover:text-neutral-200 underline lowercase"
              >
                {showKey ? 'Ẩn' : 'Hiện'}
              </button>
            </label>
            <div className="relative">
              <input
                type={showKey ? 'text' : 'password'}
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="Dán mã API Key của bạn (AIzaSy...)"
                className="w-full bg-neutral-800 border border-neutral-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-amber-500 font-mono"
              />
            </div>
            <p className="text-[11px] text-neutral-400 mt-1.5 flex items-center gap-1">
              <ShieldCheck size={13} className="text-emerald-400" />
              Key được lưu cục bộ trên trình duyệt (localStorage), không gửi về máy chủ trung gian.
            </p>
          </div>

          {/* Feedback messages */}
          {errorMessage && (
            <div className="p-3 rounded-xl bg-red-950/60 border border-red-500/60 text-xs text-red-200 flex items-start gap-2 animate-in fade-in">
              <AlertCircle size={16} className="text-red-400 shrink-0 mt-0.5" />
              <div className="break-all font-mono">{errorMessage}</div>
            </div>
          )}

          {successMessage && (
            <div className="p-3 rounded-xl bg-emerald-950/60 border border-emerald-500/60 text-xs text-emerald-200 flex items-center gap-2 animate-in fade-in">
              <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
              <div>{successMessage}</div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 bg-neutral-900 border-t border-neutral-800 flex items-center justify-between">
          <button
            type="button"
            onClick={handleTestKey}
            disabled={testStatus === 'testing' || !apiKey.trim()}
            className="px-3.5 py-2 text-xs font-semibold rounded-xl border border-neutral-700 bg-neutral-800 text-neutral-200 hover:bg-neutral-700 hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5"
          >
            {testStatus === 'testing' ? (
              <>
                <div className="w-3 h-3 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
                <span>Đang kiểm tra...</span>
              </>
            ) : (
              <>
                <Sparkles size={14} className="text-amber-400" />
                <span>Kiểm tra kết nối</span>
              </>
            )}
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold rounded-xl text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
            >
              Hủy
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="px-5 py-2 text-xs font-bold rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-neutral-950 shadow-md transition-all flex items-center gap-1.5"
            >
              <CheckCircle2 size={15} />
              <span>Lưu Thiết Lập</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
