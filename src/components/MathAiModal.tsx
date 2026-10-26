/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Sparkles,
  BookOpen,
  FileQuestion,
  Send,
  X,
  AlertCircle,
  CheckCircle,
  Copy,
  PlusCircle,
  RefreshCw,
  Cpu
} from 'lucide-react';
import {
  solveMathProblemPedagogy,
  generateSimilarProblems,
  getStoredApiKey,
  MathProblemSolution,
  StepExecutionResult
} from '../utils/geminiService';

interface MathAiModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRequireApiKey: () => void;
  onInsertToBoard: (text: string, isFormula?: boolean, latex?: string) => void;
}

export const MathAiModal: React.FC<MathAiModalProps> = ({
  isOpen,
  onClose,
  onRequireApiKey,
  onInsertToBoard,
}) => {
  const [activeTab, setActiveTab] = useState<'solver' | 'similar'>('solver');
  const [problemInput, setProblemInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // 3-Step State Tracking
  const [step1State, setStep1State] = useState<{ status: 'idle' | 'loading' | 'success' | 'error' | 'stopped'; data?: StepExecutionResult }>({ status: 'idle' });
  const [step2State, setStep2State] = useState<{ status: 'idle' | 'loading' | 'success' | 'error' | 'stopped'; data?: StepExecutionResult }>({ status: 'idle' });
  const [step3State, setStep3State] = useState<{ status: 'idle' | 'loading' | 'success' | 'error' | 'stopped'; data?: StepExecutionResult }>({ status: 'idle' });

  // Similar problems state
  const [similarProblemsState, setSimilarProblemsState] = useState<{ status: 'idle' | 'loading' | 'success' | 'error'; data?: StepExecutionResult }>({ status: 'idle' });

  const [copiedStep, setCopiedStep] = useState<number | null>(null);

  if (!isOpen) return null;

  const handleStartSolve = async () => {
    const key = getStoredApiKey();
    if (!key) {
      onRequireApiKey();
      return;
    }

    if (!problemInput.trim()) return;

    setIsLoading(true);
    setStep1State({ status: 'loading' });
    setStep2State({ status: 'idle' });
    setStep3State({ status: 'idle' });

    try {
      await solveMathProblemPedagogy(
        problemInput.trim(),
        (stepNumber, status, data) => {
          if (stepNumber === 1) {
            setStep1State({ status, data });
            if (status === 'error') {
              setStep2State({ status: 'stopped' });
              setStep3State({ status: 'stopped' });
            }
          } else if (stepNumber === 2) {
            setStep2State({ status, data });
            if (status === 'error') {
              setStep3State({ status: 'stopped' });
            }
          } else if (stepNumber === 3) {
            setStep3State({ status, data });
          }
        }
      );
    } catch (err: unknown) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateSimilar = async () => {
    const key = getStoredApiKey();
    if (!key) {
      onRequireApiKey();
      return;
    }

    if (!problemInput.trim()) return;

    setSimilarProblemsState({ status: 'loading' });
    const res = await generateSimilarProblems(problemInput.trim());
    if (res.success) {
      setSimilarProblemsState({ status: 'success', data: res });
    } else {
      setSimilarProblemsState({ status: 'error', data: res });
    }
  };

  const copyToClipboard = (text: string, stepId: number) => {
    navigator.clipboard.writeText(text);
    setCopiedStep(stepId);
    setTimeout(() => setCopiedStep(null), 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-neutral-900 border border-neutral-700 rounded-2xl w-full max-w-4xl shadow-2xl flex flex-col max-h-[90vh] text-neutral-100 overflow-hidden">
        {/* Header */}
        <div className="px-6 py-3.5 bg-neutral-850 border-b border-neutral-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
              <Sparkles size={20} />
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                Trợ Lý Sư Phạm Toán Học AI
                <span className="text-[10px] bg-indigo-900/60 text-indigo-300 border border-indigo-700/60 px-2 py-0.5 rounded-full font-mono">
                  Multi-step Gemini
                </span>
              </h2>
              <p className="text-xs text-neutral-400">
                Phân tích đề bài, giải toán 3 bước chuẩn mực & sinh đề kiểm tra tương tự
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

        {/* Tab Selection */}
        <div className="flex border-b border-neutral-800 px-6 bg-neutral-900/50">
          <button
            onClick={() => setActiveTab('solver')}
            className={`py-3 px-4 text-xs font-bold flex items-center gap-2 border-b-2 transition-all ${
              activeTab === 'solver'
                ? 'border-indigo-500 text-indigo-300'
                : 'border-transparent text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <BookOpen size={15} />
            <span>Giải Toán 3 Bước Sư Phạm</span>
          </button>
          <button
            onClick={() => setActiveTab('similar')}
            className={`py-3 px-4 text-xs font-bold flex items-center gap-2 border-b-2 transition-all ${
              activeTab === 'similar'
                ? 'border-amber-500 text-amber-300'
                : 'border-transparent text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <FileQuestion size={15} />
            <span>Sinh 3 Đề Bài Tương Tự Phân Hóa</span>
          </button>
        </div>

        {/* Body Content */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1">
          {/* Problem Input Box */}
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-neutral-300 uppercase tracking-wider flex items-center justify-between">
              <span>Nội dung đề bài hoặc câu hỏi toán học:</span>
              <span className="text-[11px] text-neutral-400 font-normal">Hỗ trợ LaTeX ($...$)</span>
            </label>
            <div className="relative">
              <textarea
                value={problemInput}
                onChange={(e) => setProblemInput(e.target.value)}
                placeholder="Ví dụ: Khảo sát sự biến thiên và vẽ đồ thị hàm số y = x^3 - 3x^2 + 2, hoặc: Cho hình chóp S.ABCD có đáy là hình vuông cạnh a..."
                rows={3}
                className="w-full bg-neutral-800/80 border border-neutral-700 rounded-xl px-4 py-2.5 text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-indigo-500 font-sans resize-none"
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setProblemInput('Tìm giá trị lớn nhất và nhỏ nhất của hàm số y = x^3 - 3x + 2 trên đoạn [0; 2]')}
                  className="text-[11px] bg-neutral-800 hover:bg-neutral-700 text-neutral-300 px-2 py-1 rounded border border-neutral-700"
                >
                  VD 1: Max/Min GTLN-GTNN
                </button>
                <button
                  type="button"
                  onClick={() => setProblemInput('Khảo sát và vẽ đồ thị hàm số nhất biến y = (2x + 1)/(x - 1)')}
                  className="text-[11px] bg-neutral-800 hover:bg-neutral-700 text-neutral-300 px-2 py-1 rounded border border-neutral-700"
                >
                  VD 2: Đồ thị hàm nhất biến
                </button>
              </div>

              {activeTab === 'solver' ? (
                <button
                  onClick={handleStartSolve}
                  disabled={isLoading || !problemInput.trim()}
                  className="px-5 py-2 text-xs font-bold rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white shadow-md disabled:opacity-50 transition-all flex items-center gap-2"
                >
                  {isLoading ? (
                    <>
                      <RefreshCw size={14} className="animate-spin" />
                      <span>Đang giải toán...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles size={14} />
                      <span>Bắt Đầu Giải 3 Bước</span>
                    </>
                  )}
                </button>
              ) : (
                <button
                  onClick={handleGenerateSimilar}
                  disabled={similarProblemsState.status === 'loading' || !problemInput.trim()}
                  className="px-5 py-2 text-xs font-bold rounded-xl bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-neutral-950 shadow-md disabled:opacity-50 transition-all flex items-center gap-2"
                >
                  {similarProblemsState.status === 'loading' ? (
                    <>
                      <RefreshCw size={14} className="animate-spin text-neutral-950" />
                      <span>Đang sinh đề...</span>
                    </>
                  ) : (
                    <>
                      <FileQuestion size={14} />
                      <span>Tạo 3 Bài Tương Tự</span>
                    </>
                  )}
                </button>
              )}
            </div>
          </div>

          {/* TAB 1: 3-STEP SOLVER VIEW */}
          {activeTab === 'solver' && (
            <div className="space-y-4">
              {/* Progress Bar & Status Pipeline per AI_INSTRUCTIONS.md */}
              <div className="bg-neutral-850 p-3.5 rounded-xl border border-neutral-800 space-y-2">
                <div className="flex items-center justify-between text-xs font-semibold">
                  <span className="text-neutral-300 flex items-center gap-1.5">
                    <Sparkles size={13} className="text-amber-400" />
                    Tiến trình thực hiện (Pipeline 3 Bước Sư Phạm):
                  </span>
                  <span
                    className={`text-[11px] font-mono font-bold ${
                      step1State.status === 'error' ||
                      step2State.status === 'error' ||
                      step3State.status === 'error'
                        ? 'text-red-400'
                        : step3State.status === 'success'
                        ? 'text-emerald-400'
                        : 'text-amber-400'
                    }`}
                  >
                    {step3State.status === 'success'
                      ? '100% Hoàn tất cả 3 bước'
                      : step2State.status === 'success'
                      ? '66% Đã xong Bước 2'
                      : step1State.status === 'success'
                      ? '33% Đã xong Bước 1'
                      : step1State.status === 'loading'
                      ? 'Đang xử lý Bước 1...'
                      : step1State.status === 'error' ||
                        step2State.status === 'error' ||
                        step3State.status === 'error'
                      ? 'Đã dừng do lỗi'
                      : 'Sẵn sàng'}
                  </span>
                </div>

                {/* Progress track */}
                <div className="w-full h-2.5 bg-neutral-800 rounded-full overflow-hidden flex p-0.5 gap-1 border border-neutral-700/80">
                  <div
                    className={`h-full rounded-full transition-all duration-500 flex-1 ${
                      step1State.status === 'success'
                        ? 'bg-emerald-500'
                        : step1State.status === 'loading'
                        ? 'bg-amber-500 animate-pulse'
                        : step1State.status === 'error'
                        ? 'bg-red-500'
                        : 'bg-neutral-700/50'
                    }`}
                  />
                  <div
                    className={`h-full rounded-full transition-all duration-500 flex-1 ${
                      step2State.status === 'success'
                        ? 'bg-emerald-500'
                        : step2State.status === 'loading'
                        ? 'bg-amber-500 animate-pulse'
                        : step2State.status === 'error' || step2State.status === 'stopped'
                        ? 'bg-red-500/80'
                        : 'bg-neutral-700/50'
                    }`}
                  />
                  <div
                    className={`h-full rounded-full transition-all duration-500 flex-1 ${
                      step3State.status === 'success'
                        ? 'bg-emerald-500'
                        : step3State.status === 'loading'
                        ? 'bg-amber-500 animate-pulse'
                        : step3State.status === 'error' || step3State.status === 'stopped'
                        ? 'bg-red-500/80'
                        : 'bg-neutral-700/50'
                    }`}
                  />
                </div>
              </div>

              {/* Prominent Red Alert if API error occurs */}
              {(step1State.status === 'error' ||
                step2State.status === 'error' ||
                step3State.status === 'error') && (
                <div className="p-3.5 rounded-xl bg-red-950/80 border border-red-500/80 text-xs text-red-200 flex items-start gap-3 shadow-lg animate-in fade-in">
                  <AlertCircle size={18} className="text-red-400 shrink-0 mt-0.5" />
                  <div className="space-y-1 w-full">
                    <p className="font-bold text-red-300">
                      QUY TRÌNH ĐÃ DỪNG DO LỖI API (ĐÃ TỰ ĐỘNG THỬ QUA CÁC MODEL DỰ PHÒNG):
                    </p>
                    <p className="font-mono text-[11px] bg-red-900/60 p-2 rounded border border-red-500/50 select-text break-all">
                      {step1State.data?.error || step2State.data?.error || step3State.data?.error}
                    </p>
                    <p className="text-[11px] text-neutral-300">
                      * Nếu gặp mã lỗi <strong>429 RESOURCE_EXHAUSTED</strong> (hết quota), hãy bấm nút <strong>Settings (API Key)</strong> màu đỏ trên thanh Header để đổi khóa mới hoặc chọn mô hình khác.
                    </p>
                  </div>
                </div>
              )}

              {/* Step 1 Card: Phân tích đề bài */}
              <div className="rounded-xl border border-neutral-800 bg-neutral-850 overflow-hidden">
                <div className="px-4 py-2.5 bg-neutral-800/80 border-b border-neutral-750 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-blue-500/20 text-blue-400 text-xs font-bold flex items-center justify-center border border-blue-500/40">
                      1
                    </span>
                    <span className="text-xs font-bold text-neutral-200">
                      Bước 1: Phân Tích Giả Thiết & Định Hướng
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    {step1State.status === 'loading' && (
                      <span className="text-[11px] text-amber-400 flex items-center gap-1 font-medium">
                        <RefreshCw size={11} className="animate-spin" /> Đang phân tích...
                      </span>
                    )}
                    {step1State.status === 'success' && (
                      <span className="text-[11px] text-emerald-400 flex items-center gap-1 font-semibold">
                        <CheckCircle size={12} /> Hoàn tất ({step1State.data?.modelUsed})
                      </span>
                    )}
                    {step1State.status === 'error' && (
                      <span className="text-[11px] text-red-400 flex items-center gap-1 font-semibold">
                        <AlertCircle size={12} /> Đã dừng do lỗi
                      </span>
                    )}
                    {step1State.status === 'stopped' && (
                      <span className="text-[11px] text-neutral-400 font-medium">
                        Đã dừng do lỗi
                      </span>
                    )}
                    {step1State.status === 'success' && step1State.data?.content && (
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => copyToClipboard(step1State.data!.content, 1)}
                          className="p-1 text-neutral-400 hover:text-white rounded"
                          title="Sao chép nội dung"
                        >
                          <Copy size={13} />
                        </button>
                        <button
                          onClick={() => onInsertToBoard(step1State.data!.content)}
                          className="px-2 py-0.5 text-[11px] bg-blue-600/30 text-blue-300 border border-blue-500/40 rounded hover:bg-blue-600/50 flex items-center gap-1"
                          title="Chèn lên bảng"
                        >
                          <PlusCircle size={11} /> Chèn vào bảng
                        </button>
                      </div>
                    )}
                  </div>
                </div>
                {step1State.status === 'error' && (
                  <div className="p-3 bg-red-950/40 border-b border-red-500/40 text-xs text-red-300 font-mono">
                    {step1State.data?.error}
                  </div>
                )}
                {step1State.data?.content && (
                  <div className="p-4 text-xs text-neutral-200 whitespace-pre-wrap leading-relaxed font-sans select-text max-h-60 overflow-y-auto">
                    {step1State.data.content}
                  </div>
                )}
              </div>

              {/* Step 2 Card: Lời giải chi tiết KaTeX */}
              <div className="rounded-xl border border-neutral-800 bg-neutral-850 overflow-hidden">
                <div className="px-4 py-2.5 bg-neutral-800/80 border-b border-neutral-750 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-purple-500/20 text-purple-400 text-xs font-bold flex items-center justify-center border border-purple-500/40">
                      2
                    </span>
                    <span className="text-xs font-bold text-neutral-200">
                      Bước 2: Lời Giải Chi Tiết (KaTeX)
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    {step2State.status === 'loading' && (
                      <span className="text-[11px] text-amber-400 flex items-center gap-1 font-medium">
                        <RefreshCw size={11} className="animate-spin" /> Đang giải chi tiết...
                      </span>
                    )}
                    {step2State.status === 'success' && (
                      <span className="text-[11px] text-emerald-400 flex items-center gap-1 font-semibold">
                        <CheckCircle size={12} /> Hoàn tất ({step2State.data?.modelUsed})
                      </span>
                    )}
                    {step2State.status === 'error' && (
                      <span className="text-[11px] text-red-400 flex items-center gap-1 font-semibold">
                        <AlertCircle size={12} /> Đã dừng do lỗi
                      </span>
                    )}
                    {step2State.status === 'stopped' && (
                      <span className="text-[11px] text-neutral-400 font-medium">
                        Đã dừng do lỗi
                      </span>
                    )}
                    {step2State.status === 'success' && step2State.data?.content && (
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => copyToClipboard(step2State.data!.content, 2)}
                          className="p-1 text-neutral-400 hover:text-white rounded"
                          title="Sao chép lời giải"
                        >
                          <Copy size={13} />
                        </button>
                        <button
                          onClick={() => onInsertToBoard(step2State.data!.content, true, step2State.data!.content)}
                          className="px-2 py-0.5 text-[11px] bg-purple-600/30 text-purple-300 border border-purple-500/40 rounded hover:bg-purple-600/50 flex items-center gap-1"
                          title="Chèn lên bảng"
                        >
                          <PlusCircle size={11} /> Chèn vào bảng
                        </button>
                      </div>
                    )}
                  </div>
                </div>
                {step2State.status === 'error' && (
                  <div className="p-3 bg-red-950/40 border-b border-red-500/40 text-xs text-red-300 font-mono">
                    {step2State.data?.error}
                  </div>
                )}
                {step2State.data?.content && (
                  <div className="p-4 text-xs text-neutral-200 whitespace-pre-wrap leading-relaxed font-sans select-text max-h-80 overflow-y-auto">
                    {step2State.data.content}
                  </div>
                )}
              </div>

              {/* Step 3 Card: Kết luận & Bẫy sai lầm */}
              <div className="rounded-xl border border-neutral-800 bg-neutral-850 overflow-hidden">
                <div className="px-4 py-2.5 bg-neutral-800/80 border-b border-neutral-750 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-bold flex items-center justify-center border border-emerald-500/40">
                      3
                    </span>
                    <span className="text-xs font-bold text-neutral-200">
                      Bước 3: Kết Luận & Cảnh Báo "Bẫy" Sai Lầm
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    {step3State.status === 'loading' && (
                      <span className="text-[11px] text-amber-400 flex items-center gap-1 font-medium">
                        <RefreshCw size={11} className="animate-spin" /> Đang tổng kết...
                      </span>
                    )}
                    {step3State.status === 'success' && (
                      <span className="text-[11px] text-emerald-400 flex items-center gap-1 font-semibold">
                        <CheckCircle size={12} /> Hoàn tất ({step3State.data?.modelUsed})
                      </span>
                    )}
                    {step3State.status === 'error' && (
                      <span className="text-[11px] text-red-400 flex items-center gap-1 font-semibold">
                        <AlertCircle size={12} /> Đã dừng do lỗi
                      </span>
                    )}
                    {step3State.status === 'stopped' && (
                      <span className="text-[11px] text-neutral-400 font-medium">
                        Đã dừng do lỗi
                      </span>
                    )}
                    {step3State.status === 'success' && step3State.data?.content && (
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => copyToClipboard(step3State.data!.content, 3)}
                          className="p-1 text-neutral-400 hover:text-white rounded"
                          title="Sao chép nội dung"
                        >
                          <Copy size={13} />
                        </button>
                        <button
                          onClick={() => onInsertToBoard(step3State.data!.content)}
                          className="px-2 py-0.5 text-[11px] bg-emerald-600/30 text-emerald-300 border border-emerald-500/40 rounded hover:bg-emerald-600/50 flex items-center gap-1"
                          title="Chèn lên bảng"
                        >
                          <PlusCircle size={11} /> Chèn vào bảng
                        </button>
                      </div>
                    )}
                  </div>
                </div>
                {step3State.status === 'error' && (
                  <div className="p-3 bg-red-950/40 border-b border-red-500/40 text-xs text-red-300 font-mono">
                    {step3State.data?.error}
                  </div>
                )}
                {step3State.data?.content && (
                  <div className="p-4 text-xs text-neutral-200 whitespace-pre-wrap leading-relaxed font-sans select-text max-h-60 overflow-y-auto">
                    {step3State.data.content}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: SIMILAR PROBLEMS VIEW */}
          {activeTab === 'similar' && (
            <div className="space-y-4">
              {similarProblemsState.status === 'error' && (
                <div className="p-3 bg-red-950/50 border border-red-500/60 rounded-xl text-xs text-red-200 font-mono">
                  {similarProblemsState.data?.error}
                </div>
              )}
              {similarProblemsState.data?.content && (
                <div className="rounded-xl border border-neutral-700 bg-neutral-800/80 p-5 space-y-4">
                  <div className="flex items-center justify-between border-b border-neutral-700 pb-2">
                    <span className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                      <FileQuestion size={14} /> 3 Bài Toán Tương Tự Chuẩn Phân Hóa (Nhận biết - Vận dụng - VDC)
                    </span>
                    <button
                      onClick={() => onInsertToBoard(similarProblemsState.data!.content)}
                      className="px-3 py-1 text-xs bg-amber-500 text-neutral-950 font-bold rounded-lg hover:bg-amber-400 transition-colors flex items-center gap-1"
                    >
                      <PlusCircle size={12} /> Chèn đề bài lên bảng
                    </button>
                  </div>
                  <div className="text-xs text-neutral-200 whitespace-pre-wrap leading-relaxed font-sans select-text max-h-96 overflow-y-auto">
                    {similarProblemsState.data.content}
                  </div>
                </div>
              )}
              {similarProblemsState.status === 'idle' && (
                <div className="p-8 text-center text-neutral-500 text-xs border border-dashed border-neutral-800 rounded-xl">
                  Nhập đề bài toán mẫu ở trên và bấm "Tạo 3 Bài Tương Tự" để AI sinh đề phân hóa cho học sinh.
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
