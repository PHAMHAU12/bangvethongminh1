/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import {
  Gamepad2,
  Clock,
  Play,
  Pause,
  RotateCcw,
  Sparkles,
  Trophy,
  X,
  Volume2,
  VolumeX,
  Users
} from 'lucide-react';

interface ClassroomToolsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ClassroomToolsModal: React.FC<ClassroomToolsModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'wheel' | 'timer'>('wheel');

  // --- LUCKY WHEEL STATE ---
  const [studentsInput, setStudentsInput] = useState(
    'Học sinh 1\nHọc sinh 2\nHọc sinh 3\nHọc sinh 4\nHọc sinh 5\nHọc sinh 6\nHọc sinh 7\nHọc sinh 8'
  );
  const [isSpinning, setIsSpinning] = useState(false);
  const [winner, setWinner] = useState<string | null>(null);
  const wheelCanvasRef = useRef<HTMLCanvasElement>(null);
  const currentAngleRef = useRef(0);

  // --- TIMER STATE ---
  const [timerSeconds, setTimerSeconds] = useState(180); // 3 mins default
  const [initialSeconds, setInitialSeconds] = useState(180);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const timerIntervalRef = useRef<number | null>(null);

  // Sound generator via Web Audio API (no external audio files required!)
  const playBeep = (freq = 600, duration = 0.15) => {
    try {
      const audioCtx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0.2, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + duration);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + duration);
    } catch {}
  };

  const playVictoryFanfare = () => {
    playBeep(523.25, 0.15); // C5
    setTimeout(() => playBeep(659.25, 0.15), 150); // E5
    setTimeout(() => playBeep(783.99, 0.25), 300); // G5
    setTimeout(() => playBeep(1046.5, 0.4), 450); // C6
  };

  // Parse student names
  const students = studentsInput
    .split('\n')
    .map((s) => s.trim())
    .filter((s) => s.length > 0);

  // Draw Lucky Wheel
  useEffect(() => {
    if (!isOpen || activeTab !== 'wheel') return;
    const canvas = wheelCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const size = canvas.width;
    const center = size / 2;
    const radius = center - 12;
    const count = Math.max(1, students.length);
    const sliceAngle = (2 * Math.PI) / count;

    ctx.clearRect(0, 0, size, size);

    // Color palette for slices
    const colors = [
      '#ef4444', '#f97316', '#f59e0b', '#10b981',
      '#06b6d4', '#3b82f6', '#6366f1', '#8b5cf6',
      '#ec4899', '#14b8a6', '#84cc16'
    ];

    // Draw slices
    ctx.save();
    ctx.translate(center, center);
    ctx.rotate(currentAngleRef.current);

    for (let i = 0; i < count; i++) {
      const angle = i * sliceAngle;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.arc(0, 0, radius, angle, angle + sliceAngle);
      ctx.closePath();
      ctx.fillStyle = colors[i % colors.length];
      ctx.fill();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Text label
      ctx.save();
      ctx.rotate(angle + sliceAngle / 2);
      ctx.textAlign = 'right';
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 12px Plus Jakarta Sans, sans-serif';
      ctx.shadowColor = 'rgba(0,0,0,0.5)';
      ctx.shadowBlur = 3;
      const label = students[i] || `Mục ${i + 1}`;
      ctx.fillText(label.slice(0, 14), radius - 15, 4);
      ctx.restore();
    }
    ctx.restore();

    // Center pin circle
    ctx.beginPath();
    ctx.arc(center, center, 18, 0, 2 * Math.PI);
    ctx.fillStyle = '#1e293b';
    ctx.fill();
    ctx.strokeStyle = '#f59e0b';
    ctx.lineWidth = 3;
    ctx.stroke();

    // Fixed Pointer Needle at Right (angle 0)
    ctx.beginPath();
    ctx.moveTo(size - 4, center);
    ctx.lineTo(size - 22, center - 10);
    ctx.lineTo(size - 22, center + 10);
    ctx.closePath();
    ctx.fillStyle = '#fef08a';
    ctx.fill();
    ctx.strokeStyle = '#b45309';
    ctx.lineWidth = 2;
    ctx.stroke();
  }, [isOpen, activeTab, students]);

  // Spin Lucky Wheel animation
  const spinWheel = () => {
    if (isSpinning || students.length === 0) return;
    setIsSpinning(true);
    setWinner(null);

    const fullRotations = 5 + Math.floor(Math.random() * 5); // 5 to 10 full turns
    const randomStopAngle = Math.random() * 2 * Math.PI;
    const targetAngle = currentAngleRef.current + fullRotations * 2 * Math.PI + randomStopAngle;

    const startTime = performance.now();
    const duration = 4000; // 4 seconds

    const animate = (time: number) => {
      const elapsed = time - startTime;
      const progress = Math.min(1, elapsed / duration);
      // Cubic ease-out deceleration
      const easeOut = 1 - Math.pow(1 - progress, 3);
      currentAngleRef.current = currentAngleRef.current + (targetAngle - currentAngleRef.current) * easeOut * 0.12;

      // Redraw wheel
      const canvas = wheelCanvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext('2d');
        if (ctx) {
          const size = canvas.width;
          const center = size / 2;
          const radius = center - 12;
          const count = students.length;
          const sliceAngle = (2 * Math.PI) / count;
          const colors = [
            '#ef4444', '#f97316', '#f59e0b', '#10b981',
            '#06b6d4', '#3b82f6', '#6366f1', '#8b5cf6',
            '#ec4899', '#14b8a6', '#84cc16'
          ];
          ctx.clearRect(0, 0, size, size);
          ctx.save();
          ctx.translate(center, center);
          ctx.rotate(currentAngleRef.current);
          for (let i = 0; i < count; i++) {
            const angle = i * sliceAngle;
            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.arc(0, 0, radius, angle, angle + sliceAngle);
            ctx.closePath();
            ctx.fillStyle = colors[i % colors.length];
            ctx.fill();
            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = 2;
            ctx.stroke();
            ctx.save();
            ctx.rotate(angle + sliceAngle / 2);
            ctx.textAlign = 'right';
            ctx.fillStyle = '#ffffff';
            ctx.font = 'bold 12px Plus Jakarta Sans, sans-serif';
            ctx.fillText(students[i].slice(0, 14), radius - 15, 4);
            ctx.restore();
          }
          ctx.restore();

          // Center circle
          ctx.beginPath();
          ctx.arc(center, center, 18, 0, 2 * Math.PI);
          ctx.fillStyle = '#1e293b';
          ctx.fill();
          ctx.strokeStyle = '#f59e0b';
          ctx.lineWidth = 3;
          ctx.stroke();

          // Pointer
          ctx.beginPath();
          ctx.moveTo(size - 4, center);
          ctx.lineTo(size - 22, center - 10);
          ctx.lineTo(size - 22, center + 10);
          ctx.closePath();
          ctx.fillStyle = '#fef08a';
          ctx.fill();
          ctx.strokeStyle = '#b45309';
          ctx.lineWidth = 2;
          ctx.stroke();
        }
      }

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        setIsSpinning(false);
        // Calculate which slice is pointing at the needle (angle 0 on right)
        const count = students.length;
        const sliceAngle = (2 * Math.PI) / count;
        // Normalize angle
        const normalizedAngle = (2 * Math.PI - (currentAngleRef.current % (2 * Math.PI))) % (2 * Math.PI);
        const winningIndex = Math.floor(normalizedAngle / sliceAngle) % count;
        const luckyStudent = students[winningIndex] || students[0];
        setWinner(luckyStudent);
        playVictoryFanfare();
      }
    };

    requestAnimationFrame(animate);
  };

  // --- TIMER LOGIC ---
  useEffect(() => {
    if (isTimerRunning) {
      timerIntervalRef.current = window.setInterval(() => {
        setTimerSeconds((prev) => {
          if (prev <= 1) {
            setIsTimerRunning(false);
            if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
            playVictoryFanfare();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
    }
    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    };
  }, [isTimerRunning]);

  const setTimerPreset = (mins: number) => {
    setIsTimerRunning(false);
    const secs = mins * 60;
    setTimerSeconds(secs);
    setInitialSeconds(secs);
  };

  const formatTimer = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-neutral-900 border border-neutral-700 rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col text-neutral-100">
        {/* Header */}
        <div className="px-6 py-3.5 bg-neutral-850 border-b border-neutral-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              <Gamepad2 size={20} />
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                Bộ Tiện Ích Tương Tác Lớp Học
              </h2>
              <p className="text-xs text-neutral-400">
                Vòng quay may mắn gọi tên & Đồng hồ đếm ngược thi đua
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
            onClick={() => setActiveTab('wheel')}
            className={`py-3 px-4 text-xs font-bold flex items-center gap-2 border-b-2 transition-all ${
              activeTab === 'wheel'
                ? 'border-emerald-500 text-emerald-300'
                : 'border-transparent text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <Users size={15} />
            <span>Vòng Quay May Mắn (Gọi Tên)</span>
          </button>
          <button
            onClick={() => setActiveTab('timer')}
            className={`py-3 px-4 text-xs font-bold flex items-center gap-2 border-b-2 transition-all ${
              activeTab === 'timer'
                ? 'border-amber-500 text-amber-300'
                : 'border-transparent text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <Clock size={15} />
            <span>Đồng Hồ Đếm Ngược Thi Đua</span>
          </button>
        </div>

        {/* Body Content */}
        <div className="p-6">
          {/* TAB 1: LUCKY WHEEL */}
          {activeTab === 'wheel' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
              {/* Wheel Canvas & Spin Action */}
              <div className="flex flex-col items-center justify-center">
                <div className="relative p-2 rounded-full bg-neutral-800 shadow-xl border border-neutral-700">
                  <canvas
                    ref={wheelCanvasRef}
                    width={280}
                    height={280}
                    className="rounded-full shadow-inner"
                  />
                </div>

                <button
                  onClick={spinWheel}
                  disabled={isSpinning || students.length === 0}
                  className="mt-4 px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-neutral-950 font-black text-sm shadow-lg disabled:opacity-50 transition-all flex items-center gap-2"
                >
                  <Sparkles size={16} />
                  <span>{isSpinning ? 'ĐANG QUAY...' : 'QUAY NGAY!'}</span>
                </button>

                {/* Winner announcement */}
                {winner && (
                  <div className="mt-3 p-3 rounded-xl bg-amber-500/20 border border-amber-500/50 text-amber-300 flex items-center gap-2 animate-bounce">
                    <Trophy size={18} className="text-amber-400" />
                    <span className="font-extrabold text-sm">{winner}</span>
                  </div>
                )}
              </div>

              {/* Students List Input */}
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-neutral-300 uppercase tracking-wider flex items-center justify-between">
                  <span>Danh sách học sinh (Mỗi dòng 1 tên):</span>
                  <span className="text-emerald-400 font-mono text-[11px]">
                    {students.length} học sinh
                  </span>
                </label>
                <textarea
                  value={studentsInput}
                  onChange={(e) => setStudentsInput(e.target.value)}
                  rows={8}
                  placeholder="Nhập tên học sinh..."
                  className="w-full bg-neutral-800 border border-neutral-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500 font-sans resize-none"
                />
                <div className="flex gap-2">
                  <button
                    onClick={() =>
                      setStudentsInput(
                        Array.from({ length: 40 }, (_, i) => `Số ${i + 1}`).join('\n')
                      )
                    }
                    className="text-[11px] bg-neutral-800 hover:bg-neutral-700 text-neutral-300 px-2 py-1 rounded border border-neutral-700"
                  >
                    Mẫu Số 1-40
                  </button>
                  <button
                    onClick={() =>
                      setStudentsInput('Tổ 1\nTổ 2\nTổ 3\nTổ 4')
                    }
                    className="text-[11px] bg-neutral-800 hover:bg-neutral-700 text-neutral-300 px-2 py-1 rounded border border-neutral-700"
                  >
                    Theo 4 Tổ
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: TIMER */}
          {activeTab === 'timer' && (
            <div className="flex flex-col items-center justify-center py-4 space-y-6">
              {/* Presets */}
              <div className="flex flex-wrap gap-2 justify-center">
                {[1, 2, 3, 5, 10, 15].map((mins) => (
                  <button
                    key={mins}
                    onClick={() => setTimerPreset(mins)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      initialSeconds === mins * 60
                        ? 'bg-amber-500 text-neutral-950 shadow-md'
                        : 'bg-neutral-800 text-neutral-300 hover:bg-neutral-700 border border-neutral-700'
                    }`}
                  >
                    {mins} phút
                  </button>
                ))}
              </div>

              {/* Big Digital Clock */}
              <div className="relative flex items-center justify-center w-64 h-64 rounded-full bg-neutral-850 border-4 border-amber-500/40 shadow-2xl">
                <div className="text-center">
                  <div
                    className={`font-mono font-black text-5xl tracking-wider transition-colors ${
                      timerSeconds <= 10 && timerSeconds > 0
                        ? 'text-red-400 animate-pulse'
                        : timerSeconds === 0
                        ? 'text-red-500'
                        : 'text-amber-400'
                    }`}
                  >
                    {formatTimer(timerSeconds)}
                  </div>
                  <div className="text-xs text-neutral-400 mt-1 uppercase font-semibold">
                    {timerSeconds === 0 ? 'HẾT GIỜ LÀM BÀI!' : 'Thời Gian Làm Bài'}
                  </div>
                </div>
              </div>

              {/* Controls */}
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setIsTimerRunning(!isTimerRunning)}
                  className={`px-6 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 shadow-lg transition-all ${
                    isTimerRunning
                      ? 'bg-amber-600 hover:bg-amber-500 text-white'
                      : 'bg-emerald-600 hover:bg-emerald-500 text-white'
                  }`}
                >
                  {isTimerRunning ? (
                    <>
                      <Pause size={16} />
                      <span>Tạm Dừng</span>
                    </>
                  ) : (
                    <>
                      <Play size={16} />
                      <span>Bắt Đầu</span>
                    </>
                  )}
                </button>
                <button
                  onClick={() => {
                    setIsTimerRunning(false);
                    setTimerSeconds(initialSeconds);
                  }}
                  className="px-4 py-2.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs font-bold border border-neutral-700 transition-colors flex items-center gap-1.5"
                >
                  <RotateCcw size={14} />
                  <span>Đặt Lại</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
