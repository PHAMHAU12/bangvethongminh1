/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import katex from 'katex';
import {
  X,
  TrendingUp,
  Check,
  RotateCcw,
  Sparkles,
  GitCommit,
  Spline,
  Eye,
  Sliders
} from 'lucide-react';
import { ShapeElement, ShapeType } from '../types/emath';
import { drawShape } from '../utils/canvasRenderer';

interface GraphModalProps {
  isOpen: boolean;
  onClose: () => void;
  onInsertGraph: (element: ShapeElement) => void;
  defaultColor?: string;
  canvasWidth: number;
  canvasHeight: number;
}

type FunctionCategory = 'cubic' | 'rational' | 'quadratic_rational';

export const GraphModal: React.FC<GraphModalProps> = ({
  isOpen,
  onClose,
  onInsertGraph,
  defaultColor = '#38bdf8',
  canvasWidth,
  canvasHeight,
}) => {
  const [category, setCategory] = useState<FunctionCategory>('cubic');

  // Coefficients
  // Bậc 3: y = ax^3 + bx^2 + cx + d
  const [aCubic, setACubic] = useState<number>(1);
  const [bCubic, setBCubic] = useState<number>(0);
  const [cCubic, setCCubic] = useState<number>(-3);
  const [dCubic, setDCubic] = useState<number>(0);

  // Nhất biến: y = (ax + b) / (cx + d)
  const [aRat, setARat] = useState<number>(2);
  const [bRat, setBRat] = useState<number>(-1);
  const [cRat, setCRat] = useState<number>(1);
  const [dRat, setDRat] = useState<number>(1);

  // Bậc 2 / 1: y = (ax^2 + bx + c) / (dx + e)
  const [aQuad, setAQuad] = useState<number>(1);
  const [bQuad, setBQuad] = useState<number>(-1);
  const [cQuad, setCQuad] = useState<number>(1);
  const [dQuad, setDQuad] = useState<number>(1);
  const [eQuad, setEQuad] = useState<number>(-1);

  // Options
  const [color, setColor] = useState<string>(defaultColor);
  const [strokeWidth, setStrokeWidth] = useState<number>(2.5);
  const [showAxes, setShowAxes] = useState<boolean>(true);
  const [showAsymptotes, setShowAsymptotes] = useState<boolean>(true);
  const [showPoints, setShowPoints] = useState<boolean>(true);
  const [showFormula, setShowFormula] = useState<boolean>(true);

  const previewCanvasRef = useRef<HTMLCanvasElement>(null);

  // LaTeX preview generator
  const getLatexString = (): string => {
    if (category === 'cubic') {
      let terms: string[] = [];
      if (aCubic !== 0) {
        if (aCubic === 1) terms.push('x^3');
        else if (aCubic === -1) terms.push('-x^3');
        else terms.push(`${aCubic}x^3`);
      }
      if (bCubic !== 0) {
        const sign = bCubic > 0 ? (terms.length > 0 ? '+' : '') : '-';
        const absVal = Math.abs(bCubic);
        terms.push(`${sign} ${absVal === 1 ? 'x^2' : `${absVal}x^2`}`);
      }
      if (cCubic !== 0) {
        const sign = cCubic > 0 ? (terms.length > 0 ? '+' : '') : '-';
        const absVal = Math.abs(cCubic);
        terms.push(`${sign} ${absVal === 1 ? 'x' : `${absVal}x`}`);
      }
      if (dCubic !== 0 || terms.length === 0) {
        const sign = dCubic > 0 ? (terms.length > 0 ? '+' : '') : '-';
        terms.push(terms.length > 0 ? `${sign} ${Math.abs(dCubic)}` : `${dCubic}`);
      }
      return `y = ${terms.join(' ')}`;
    }

    if (category === 'rational') {
      const numA = aRat === 1 ? 'x' : aRat === -1 ? '-x' : `${aRat}x`;
      const numB = bRat >= 0 ? `+ ${bRat}` : `- ${Math.abs(bRat)}`;
      const denC = cRat === 1 ? 'x' : cRat === -1 ? '-x' : `${cRat}x`;
      const denD = dRat >= 0 ? `+ ${dRat}` : `- ${Math.abs(dRat)}`;
      return `y = \\frac{${numA} ${numB}}{${denC} ${denD}}`;
    }

    if (category === 'quadratic_rational') {
      const termA = aQuad === 1 ? 'x^2' : aQuad === -1 ? '-x^2' : `${aQuad}x^2`;
      const termB = bQuad !== 0 ? (bQuad > 0 ? `+ ${bQuad === 1 ? 'x' : `${bQuad}x`}` : `- ${Math.abs(bQuad) === 1 ? 'x' : `${Math.abs(bQuad)}x`}`) : '';
      const termC = cQuad !== 0 ? (cQuad > 0 ? `+ ${cQuad}` : `- ${Math.abs(cQuad)}`) : '';
      const denD = dQuad === 1 ? 'x' : dQuad === -1 ? '-x' : `${dQuad}x`;
      const denE = eQuad >= 0 ? `+ ${eQuad}` : `- ${Math.abs(eQuad)}`;
      return `y = \\frac{${termA} ${termB} ${termC}}{${denD} ${denE}}`;
    }

    return 'y = f(x)';
  };

  const [formulaHtml, setFormulaHtml] = useState<string>('');

  useEffect(() => {
    try {
      const rendered = katex.renderToString(getLatexString(), {
        displayMode: true,
        throwOnError: false,
      });
      setFormulaHtml(rendered);
    } catch {
      setFormulaHtml('<span>y = f(x)</span>');
    }
  }, [category, aCubic, bCubic, cCubic, dCubic, aRat, bRat, cRat, dRat, aQuad, bQuad, cQuad, dQuad, eQuad]);

  // Redraw preview canvas
  useEffect(() => {
    if (!isOpen) return;
    const canvas = previewCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const pw = canvas.width;
    const ph = canvas.height;

    // Clear background
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(0, 0, pw, ph);

    // Subtle background grid
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
    ctx.lineWidth = 1;
    for (let x = 0; x < pw; x += 25) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, ph);
      ctx.stroke();
    }
    for (let y = 0; y < ph; y += 25) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(pw, y);
      ctx.stroke();
    }

    const margin = 20;
    let shapeType: ShapeType = 'cubic_function';
    let graphParams = {};

    if (category === 'cubic') {
      shapeType = 'cubic_function';
      graphParams = {
        functionType: 'cubic',
        a: aCubic,
        b: bCubic,
        c: cCubic,
        d: dCubic,
        showAxes,
        showPoints,
        showFormula,
        asymptoteColor: '#facc15',
        pointsColor: '#f43f5e',
      };
    } else if (category === 'rational') {
      shapeType = 'rational_function';
      graphParams = {
        functionType: 'rational',
        a: aRat,
        b: bRat,
        c: cRat,
        d: dRat,
        showAxes,
        showAsymptotes,
        showPoints,
        showFormula,
        asymptoteColor: '#facc15',
        pointsColor: '#f43f5e',
      };
    } else if (category === 'quadratic_rational') {
      shapeType = 'quadratic_rational_function';
      graphParams = {
        functionType: 'quadratic_rational',
        a: aQuad,
        b: bQuad,
        c: cQuad,
        d: dQuad,
        e: eQuad,
        showAxes,
        showAsymptotes,
        showPoints,
        showFormula,
        asymptoteColor: '#facc15',
        pointsColor: '#f43f5e',
      };
    }

    const dummyShape: ShapeElement = {
      id: 'preview_graph',
      type: 'shape',
      shapeType,
      color,
      strokeWidth,
      startX: margin,
      startY: margin,
      endX: pw - margin,
      endY: ph - margin,
      graphParams,
    };

    drawShape(ctx, dummyShape);
  }, [
    isOpen,
    category,
    aCubic,
    bCubic,
    cCubic,
    dCubic,
    aRat,
    bRat,
    cRat,
    dRat,
    aQuad,
    bQuad,
    cQuad,
    dQuad,
    eQuad,
    color,
    strokeWidth,
    showAxes,
    showAsymptotes,
    showPoints,
    showFormula,
  ]);

  if (!isOpen) return null;

  // Analysis summary for pedagogical insights
  const renderMathAnalysis = () => {
    if (category === 'cubic') {
      const deltaPrime = bCubic * bCubic - 3 * aCubic * cCubic;
      const xI = aCubic !== 0 ? (-bCubic / (3 * aCubic)).toFixed(2) : '0';
      const yI = aCubic !== 0 ? (aCubic * Math.pow(-bCubic / (3 * aCubic), 3) + bCubic * Math.pow(-bCubic / (3 * aCubic), 2) + cCubic * (-bCubic / (3 * aCubic)) + dCubic).toFixed(2) : '0';

      return (
        <div className="space-y-1 text-xs text-neutral-300 bg-neutral-800/80 p-3 rounded-xl border border-neutral-700/60">
          <div className="font-semibold text-neutral-200 text-sm mb-1 text-emerald-400">
            Khảo sát tính chất hàm bậc 3:
          </div>
          <div>• Tập xác định: <span className="font-mono text-white">D = ℝ</span></div>
          <div>• Đạo hàm: <span className="font-mono text-amber-300">y' = {3 * aCubic}x² {bCubic !== 0 ? `${2 * bCubic >= 0 ? '+' : ''}${2 * bCubic}x` : ''} {cCubic !== 0 ? `${cCubic >= 0 ? '+' : ''}${cCubic}` : ''}</span></div>
          <div>• Tâm đối xứng (Điểm uốn): <span className="font-mono text-cyan-300">I({xI}; {yI})</span></div>
          <div>
            • Cực trị: {deltaPrime > 0 ? (
              <span className="text-emerald-400 font-medium">Có 2 điểm cực trị (Δ' &gt; 0)</span>
            ) : deltaPrime === 0 ? (
              <span className="text-amber-400 font-medium">Hàm số đơn điệu, có điểm uốn dừng (Δ' = 0)</span>
            ) : (
              <span className="text-neutral-400 font-medium">Không có cực trị, luôn đơn điệu trên ℝ (Δ' &lt; 0)</span>
            )}
          </div>
          <div>• Giao trục tung: <span className="font-mono text-cyan-300">(0; {dCubic})</span></div>
        </div>
      );
    }

    if (category === 'rational') {
      const xTcd = cRat !== 0 ? (-dRat / cRat).toFixed(2) : 'Không xác định';
      const yTcn = cRat !== 0 ? (aRat / cRat).toFixed(2) : 'Không xác định';
      const ad_bc = aRat * dRat - bRat * cRat;

      return (
        <div className="space-y-1 text-xs text-neutral-300 bg-neutral-800/80 p-3 rounded-xl border border-neutral-700/60">
          <div className="font-semibold text-neutral-200 text-sm mb-1 text-emerald-400">
            Khảo sát tính chất hàm nhất biến:
          </div>
          <div>• Tập xác định: <span className="font-mono text-white">D = ℝ \ &#123;{xTcd}&#125;</span></div>
          <div>• Tiệm cận đứng (TCĐ): <span className="font-mono text-amber-300">x = {xTcd}</span></div>
          <div>• Tiệm cận ngang (TCN): <span className="font-mono text-amber-300">y = {yTcn}</span></div>
          <div>• Tâm đối xứng: <span className="font-mono text-cyan-300">I({xTcd}; {yTcn})</span></div>
          <div>
            • Đạo hàm: <span className="font-mono text-rose-300">y' = {ad_bc} / ({cRat}x + {dRat})²</span> &rarr;{' '}
            {ad_bc > 0 ? (
              <span className="text-emerald-400 font-medium">Đồng biến trên từng khoảng xác định</span>
            ) : ad_bc < 0 ? (
              <span className="text-rose-400 font-medium">Nghịch biến trên từng khoảng xác định</span>
            ) : (
              <span className="text-neutral-400 font-medium">Hàm hằng (suy biến)</span>
            )}
          </div>
        </div>
      );
    }

    if (category === 'quadratic_rational') {
      const xTcd = dQuad !== 0 ? (-eQuad / dQuad).toFixed(2) : '0';
      const m = dQuad !== 0 ? (aQuad / dQuad).toFixed(2) : '1';
      const n = dQuad !== 0 ? ((bQuad * dQuad - aQuad * eQuad) / (dQuad * dQuad)).toFixed(2) : '0';

      return (
        <div className="space-y-1 text-xs text-neutral-300 bg-neutral-800/80 p-3 rounded-xl border border-neutral-700/60">
          <div className="font-semibold text-neutral-200 text-sm mb-1 text-emerald-400">
            Khảo sát tính chất hàm bậc 2 / bậc 1:
          </div>
          <div>• Tập xác định: <span className="font-mono text-white">D = ℝ \ &#123;{xTcd}&#125;</span></div>
          <div>• Tiệm cận đứng (TCĐ): <span className="font-mono text-amber-300">x = {xTcd}</span></div>
          <div>• Tiệm cận xiên (TCX): <span className="font-mono text-amber-300">y = {m}x {Number(n) >= 0 ? `+ ${n}` : `- ${Math.abs(Number(n))}`}</span></div>
          <div>• Tâm đối xứng (giao 2 tiệm cận): <span className="font-mono text-cyan-300">I</span></div>
          <div>• Dáng điệu: 2 nhánh hypebol xiên đối xứng qua I</div>
        </div>
      );
    }

    return null;
  };

  // Presets
  const cubicPresets = [
    { label: 'y = x³ - 3x (Chuẩn)', a: 1, b: 0, c: -3, d: 0 },
    { label: 'y = -x³ + 3x² - 4', a: -1, b: 3, c: 0, d: -4 },
    { label: 'y = x³ - 3x² + 2', a: 1, b: -3, c: 0, d: 2 },
    { label: 'y = x³ + 3x (Đồng biến)', a: 1, b: 0, c: 3, d: 0 },
  ];

  const rationalPresets = [
    { label: 'y = (2x - 1)/(x + 1)', a: 2, b: -1, c: 1, d: 1 },
    { label: 'y = (x + 2)/(x - 1)', a: 1, b: 2, c: 1, d: -1 },
    { label: 'y = (2x + 1)/(1 - x)', a: 2, b: 1, c: -1, d: 1 },
    { label: 'y = (-x + 2)/(2x + 1)', a: -1, b: 2, c: 2, d: 1 },
  ];

  const quadRationalPresets = [
    { label: 'y = (x² - x + 1)/(x - 1)', a: 1, b: -1, c: 1, d: 1, e: -1 },
    { label: 'y = (x² + 2x - 2)/(x - 1)', a: 1, b: 2, c: -2, d: 1, e: -1 },
    { label: 'y = (-x² + 2x + 1)/(x - 1)', a: -1, b: 2, c: 1, d: 1, e: -1 },
    { label: 'y = (2x² + x + 1)/(x + 1)', a: 2, b: 1, c: 1, d: 1, e: 1 },
  ];

  // Insert handler
  const handleInsert = () => {
    const boxW = Math.min(500, canvasWidth * 0.4);
    const boxH = Math.min(420, canvasHeight * 0.45);
    const startX = (canvasWidth - boxW) / 2;
    const startY = (canvasHeight - boxH) / 2;

    let shapeType: ShapeType = 'cubic_function';
    let graphParams = {};

    if (category === 'cubic') {
      shapeType = 'cubic_function';
      graphParams = {
        functionType: 'cubic',
        a: aCubic,
        b: bCubic,
        c: cCubic,
        d: dCubic,
        showAxes,
        showPoints,
        showFormula,
        asymptoteColor: '#facc15',
        pointsColor: '#f43f5e',
      };
    } else if (category === 'rational') {
      shapeType = 'rational_function';
      graphParams = {
        functionType: 'rational',
        a: aRat,
        b: bRat,
        c: cRat,
        d: dRat,
        showAxes,
        showAsymptotes,
        showPoints,
        showFormula,
        asymptoteColor: '#facc15',
        pointsColor: '#f43f5e',
      };
    } else if (category === 'quadratic_rational') {
      shapeType = 'quadratic_rational_function';
      graphParams = {
        functionType: 'quadratic_rational',
        a: aQuad,
        b: bQuad,
        c: cQuad,
        d: dQuad,
        e: eQuad,
        showAxes,
        showAsymptotes,
        showPoints,
        showFormula,
        asymptoteColor: '#facc15',
        pointsColor: '#f43f5e',
      };
    }

    const newElement: ShapeElement = {
      id: 'graph_' + Date.now(),
      type: 'shape',
      shapeType,
      color,
      strokeWidth,
      startX,
      startY,
      endX: startX + boxW,
      endY: startY + boxH,
      graphParams,
    };

    onInsertGraph(newElement);
    onClose();
  };

  const colors = [
    '#38bdf8', // Cyan
    '#10b981', // Emerald
    '#a855f7', // Purple
    '#facc15', // Yellow
    '#f43f5e', // Rose
    '#ffffff', // White
    '#fb923c', // Orange
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-neutral-900 border border-neutral-700 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[92vh] flex flex-col text-neutral-100 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-800 bg-neutral-900/90">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-400">
              <TrendingUp size={22} />
            </div>
            <div>
              <h2 className="text-lg font-bold tracking-wide flex items-center gap-2">
                VẼ ĐỒ THỊ HÀM SỐ
                <span className="text-[11px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-semibold uppercase tracking-wider">
                  Toán 12
                </span>
              </h2>
              <p className="text-xs text-neutral-400">
                Khảo sát &amp; Vẽ đồ thị hàm bậc 3, hàm nhất biến, hàm bậc 2 trên bậc 1
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-neutral-400 hover:text-white rounded-lg hover:bg-neutral-800 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Function Type Tabs */}
        <div className="flex border-b border-neutral-800 bg-neutral-950/60 px-6 pt-3 gap-2">
          <button
            onClick={() => setCategory('cubic')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-t-xl text-xs font-semibold transition-all border-b-2 ${
              category === 'cubic'
                ? 'bg-neutral-900 border-emerald-500 text-emerald-400'
                : 'border-transparent text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <TrendingUp size={15} />
            Hàm Bậc 3 (y = ax³ + bx² + cx + d)
          </button>

          <button
            onClick={() => setCategory('rational')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-t-xl text-xs font-semibold transition-all border-b-2 ${
              category === 'rational'
                ? 'bg-neutral-900 border-emerald-500 text-emerald-400'
                : 'border-transparent text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <GitCommit size={15} />
            Hàm Nhất Biến (y = (ax+b)/(cx+d))
          </button>

          <button
            onClick={() => setCategory('quadratic_rational')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-t-xl text-xs font-semibold transition-all border-b-2 ${
              category === 'quadratic_rational'
                ? 'bg-neutral-900 border-emerald-500 text-emerald-400'
                : 'border-transparent text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <Spline size={15} />
            Hàm Bậc 2 / Bậc 1 (y = (ax²+bx+c)/(dx+e))
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* Left Column: Coefficients & Options (7 cols) */}
          <div className="md:col-span-7 space-y-4">
            {/* KaTeX Live Equation Box */}
            <div className="bg-neutral-950 p-4 rounded-2xl border border-neutral-800 flex flex-col items-center justify-center min-h-[75px] shadow-inner">
              <div
                className="text-lg text-emerald-300 font-serif"
                dangerouslySetInnerHTML={{ __html: formulaHtml }}
              />
            </div>

            {/* Quick Presets */}
            <div>
              <div className="text-xs font-semibold text-neutral-400 mb-2 flex items-center gap-1.5">
                <Sparkles size={14} className="text-amber-400" />
                Ví dụ mẫu sách giáo khoa phổ biến:
              </div>
              <div className="grid grid-cols-2 gap-2">
                {category === 'cubic' &&
                  cubicPresets.map((pr, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        setACubic(pr.a);
                        setBCubic(pr.b);
                        setCCubic(pr.c);
                        setDCubic(pr.d);
                      }}
                      className="px-3 py-2 bg-neutral-800/70 hover:bg-neutral-800 rounded-xl text-xs text-neutral-300 hover:text-white border border-neutral-700/60 text-left transition-colors"
                    >
                      {pr.label}
                    </button>
                  ))}

                {category === 'rational' &&
                  rationalPresets.map((pr, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        setARat(pr.a);
                        setBRat(pr.b);
                        setCRat(pr.c);
                        setDRat(pr.d);
                      }}
                      className="px-3 py-2 bg-neutral-800/70 hover:bg-neutral-800 rounded-xl text-xs text-neutral-300 hover:text-white border border-neutral-700/60 text-left transition-colors"
                    >
                      {pr.label}
                    </button>
                  ))}

                {category === 'quadratic_rational' &&
                  quadRationalPresets.map((pr, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        setAQuad(pr.a);
                        setBQuad(pr.b);
                        setCQuad(pr.c);
                        setDQuad(pr.d);
                        setEQuad(pr.e);
                      }}
                      className="px-3 py-2 bg-neutral-800/70 hover:bg-neutral-800 rounded-xl text-xs text-neutral-300 hover:text-white border border-neutral-700/60 text-left transition-colors"
                    >
                      {pr.label}
                    </button>
                  ))}
              </div>
            </div>

            {/* Input Controls */}
            <div className="bg-neutral-800/40 border border-neutral-700/60 rounded-2xl p-4 space-y-3">
              <div className="text-xs font-semibold text-neutral-300 flex items-center gap-1.5">
                <Sliders size={14} className="text-cyan-400" />
                Thiết lập hệ số:
              </div>

              {category === 'cubic' && (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-neutral-400 block mb-1">Hệ số a (≠ 0):</label>
                    <input
                      type="number"
                      step="0.5"
                      value={aCubic}
                      onChange={(e) => setACubic(Number(e.target.value) || 1)}
                      className="w-full bg-neutral-900 border border-neutral-700 rounded-xl px-3 py-1.5 text-sm font-mono text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-neutral-400 block mb-1">Hệ số b:</label>
                    <input
                      type="number"
                      step="0.5"
                      value={bCubic}
                      onChange={(e) => setBCubic(Number(e.target.value))}
                      className="w-full bg-neutral-900 border border-neutral-700 rounded-xl px-3 py-1.5 text-sm font-mono text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-neutral-400 block mb-1">Hệ số c:</label>
                    <input
                      type="number"
                      step="0.5"
                      value={cCubic}
                      onChange={(e) => setCCubic(Number(e.target.value))}
                      className="w-full bg-neutral-900 border border-neutral-700 rounded-xl px-3 py-1.5 text-sm font-mono text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-neutral-400 block mb-1">Hệ số d:</label>
                    <input
                      type="number"
                      step="0.5"
                      value={dCubic}
                      onChange={(e) => setDCubic(Number(e.target.value))}
                      className="w-full bg-neutral-900 border border-neutral-700 rounded-xl px-3 py-1.5 text-sm font-mono text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>
              )}

              {category === 'rational' && (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-neutral-400 block mb-1">Tử số: a:</label>
                    <input
                      type="number"
                      step="0.5"
                      value={aRat}
                      onChange={(e) => setARat(Number(e.target.value))}
                      className="w-full bg-neutral-900 border border-neutral-700 rounded-xl px-3 py-1.5 text-sm font-mono text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-neutral-400 block mb-1">Tử số: b:</label>
                    <input
                      type="number"
                      step="0.5"
                      value={bRat}
                      onChange={(e) => setBRat(Number(e.target.value))}
                      className="w-full bg-neutral-900 border border-neutral-700 rounded-xl px-3 py-1.5 text-sm font-mono text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-neutral-400 block mb-1">Mẫu số: c (≠ 0):</label>
                    <input
                      type="number"
                      step="0.5"
                      value={cRat}
                      onChange={(e) => setCRat(Number(e.target.value) || 1)}
                      className="w-full bg-neutral-900 border border-neutral-700 rounded-xl px-3 py-1.5 text-sm font-mono text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-neutral-400 block mb-1">Mẫu số: d:</label>
                    <input
                      type="number"
                      step="0.5"
                      value={dRat}
                      onChange={(e) => setDRat(Number(e.target.value))}
                      className="w-full bg-neutral-900 border border-neutral-700 rounded-xl px-3 py-1.5 text-sm font-mono text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>
              )}

              {category === 'quadratic_rational' && (
                <div className="grid grid-cols-3 gap-2.5">
                  <div>
                    <label className="text-xs text-neutral-400 block mb-1">Tử a (≠ 0):</label>
                    <input
                      type="number"
                      step="0.5"
                      value={aQuad}
                      onChange={(e) => setAQuad(Number(e.target.value) || 1)}
                      className="w-full bg-neutral-900 border border-neutral-700 rounded-xl px-2.5 py-1.5 text-sm font-mono text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-neutral-400 block mb-1">Tử b:</label>
                    <input
                      type="number"
                      step="0.5"
                      value={bQuad}
                      onChange={(e) => setBQuad(Number(e.target.value))}
                      className="w-full bg-neutral-900 border border-neutral-700 rounded-xl px-2.5 py-1.5 text-sm font-mono text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-neutral-400 block mb-1">Tử c:</label>
                    <input
                      type="number"
                      step="0.5"
                      value={cQuad}
                      onChange={(e) => setCQuad(Number(e.target.value))}
                      className="w-full bg-neutral-900 border border-neutral-700 rounded-xl px-2.5 py-1.5 text-sm font-mono text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-neutral-400 block mb-1">Mẫu d (≠ 0):</label>
                    <input
                      type="number"
                      step="0.5"
                      value={dQuad}
                      onChange={(e) => setDQuad(Number(e.target.value) || 1)}
                      className="w-full bg-neutral-900 border border-neutral-700 rounded-xl px-2.5 py-1.5 text-sm font-mono text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="text-xs text-neutral-400 block mb-1">Mẫu e:</label>
                    <input
                      type="number"
                      step="0.5"
                      value={eQuad}
                      onChange={(e) => setEQuad(Number(e.target.value))}
                      className="w-full bg-neutral-900 border border-neutral-700 rounded-xl px-2.5 py-1.5 text-sm font-mono text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Display Options & Styles */}
            <div className="grid grid-cols-2 gap-4 bg-neutral-800/40 border border-neutral-700/60 rounded-2xl p-3 text-xs">
              <div className="space-y-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={showAxes}
                    onChange={(e) => setShowAxes(e.target.checked)}
                    className="rounded accent-emerald-500 w-4 h-4 cursor-pointer"
                  />
                  <span>Hệ toạ độ Oxy &amp; Vạch số</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={showAsymptotes}
                    onChange={(e) => setShowAsymptotes(e.target.checked)}
                    className="rounded accent-amber-500 w-4 h-4 cursor-pointer"
                  />
                  <span>Đường tiệm cận (Nét đứt)</span>
                </label>
              </div>

              <div className="space-y-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={showPoints}
                    onChange={(e) => setShowPoints(e.target.checked)}
                    className="rounded accent-rose-500 w-4 h-4 cursor-pointer"
                  />
                  <span>Cực trị &amp; Tâm đối xứng I</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={showFormula}
                    onChange={(e) => setShowFormula(e.target.checked)}
                    className="rounded accent-cyan-500 w-4 h-4 cursor-pointer"
                  />
                  <span>Nhãn công thức trên hình</span>
                </label>
              </div>
            </div>

            {/* Color & Stroke Width */}
            <div className="flex items-center justify-between p-3 bg-neutral-800/40 border border-neutral-700/60 rounded-2xl">
              <div className="flex items-center gap-2">
                <span className="text-xs text-neutral-400">Màu đồ thị:</span>
                <div className="flex items-center gap-1.5">
                  {colors.map((c) => (
                    <button
                      key={c}
                      onClick={() => setColor(c)}
                      style={{ backgroundColor: c }}
                      className={`w-5 h-5 rounded-full border transition-transform ${
                        color === c ? 'scale-125 border-white ring-2 ring-emerald-400' : 'border-black/40 hover:scale-110'
                      }`}
                    />
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-2 text-xs">
                <span className="text-neutral-400">Nét vẽ:</span>
                <select
                  value={strokeWidth}
                  onChange={(e) => setStrokeWidth(Number(e.target.value))}
                  className="bg-neutral-800 text-white border border-neutral-700 rounded-lg px-2 py-1 text-xs"
                >
                  <option value={1.5}>1.5px (Mảnh)</option>
                  <option value={2.5}>2.5px (Chuẩn)</option>
                  <option value={3.5}>3.5px (Đậm)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Right Column: Live Preview & Math Analysis (5 cols) */}
          <div className="md:col-span-5 flex flex-col space-y-4">
            <div className="text-xs font-semibold text-neutral-400 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Eye size={14} className="text-emerald-400" />
                Xem trước đồ thị trực tiếp:
              </span>
              <span className="text-[11px] text-neutral-500">Chuẩn toạ độ Oxy</span>
            </div>

            {/* Canvas Preview Container */}
            <div className="relative w-full aspect-square bg-slate-900 border border-neutral-700 rounded-2xl overflow-hidden shadow-inner flex items-center justify-center">
              <canvas
                ref={previewCanvasRef}
                width={360}
                height={360}
                className="w-full h-full object-contain"
              />
            </div>

            {/* Math Analysis Box */}
            {renderMathAnalysis()}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-neutral-800 bg-neutral-900/90">
          <button
            onClick={() => {
              if (category === 'cubic') {
                setACubic(1); setBCubic(0); setCCubic(-3); setDCubic(0);
              } else if (category === 'rational') {
                setARat(2); setBRat(-1); setCRat(1); setDRat(1);
              } else {
                setAQuad(1); setBQuad(-1); setCQuad(1); setDQuad(1); setEQuad(-1);
              }
            }}
            className="flex items-center gap-1.5 px-3 py-2 text-xs text-neutral-400 hover:text-white rounded-xl hover:bg-neutral-800 transition-colors"
          >
            <RotateCcw size={14} />
            Khôi phục mặc định
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-neutral-300 hover:text-white rounded-xl hover:bg-neutral-800 transition-colors"
            >
              Hủy
            </button>
            <button
              onClick={handleInsert}
              className="flex items-center gap-2 px-5 py-2.5 text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl shadow-lg shadow-emerald-500/20 transition-all hover:scale-105 active:scale-95"
            >
              <Check size={16} />
              Chèn đồ thị vào bảng
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
