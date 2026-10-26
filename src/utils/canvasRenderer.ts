/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BackgroundType, BoardElement, PaperSize, ShapeElement, StrokeElement, TextElement, ImageElement } from '../types/emath';
import katex from 'katex';

// Resolution dimensions for standard paper and screen aspect ratios
export const CANVAS_DIMENSIONS: Record<PaperSize, { width: number; height: number; name: string }> = {
  'A4': { width: 1240, height: 1754, name: 'Khổ A4 (210 × 297 mm)' },
  'A5': { width: 874, height: 1240, name: 'Khổ A5 (148 × 210 mm)' },
  '16:9': { width: 1920, height: 1080, name: 'Bảng ngang 16:9' },
  '9:16': { width: 1080, height: 1920, name: 'Bảng dọc 9:16' },
  '16:10': { width: 1920, height: 1200, name: 'Tablet 16:10' },
  '4:3': { width: 1600, height: 1200, name: 'iPad 4:3' },
  '3:2': { width: 1800, height: 1200, name: 'Surface 3:2' },
};

// 7 Preset Stroke Thicknesses (px)
export const STROKE_THICKNESSES = [1.5, 2.5, 4, 6, 8.5, 12, 18];

// Quick color presets
export const LIGHT_THEME_COLORS = [
  '#0f172a', // Đen / Than
  '#1d4ed8', // Xanh dương
  '#dc2626', // Đỏ
  '#059669', // Xanh lá
  '#7c3aed', // Tím
  '#d97706', // Cam
  '#0891b2', // Xanh lơ
  '#ec4899', // Hồng
];

export const DARK_THEME_COLORS = [
  '#ffffff', // Phấn trắng
  '#fef08a', // Phấn vàng nhạt
  '#67e8f9', // Phấn xanh lơ
  '#fca5a5', // Phấn đỏ hồng
  '#86efac', // Phấn xanh lá non
  '#fdba74', // Phấn cam
  '#d8b4fe', // Phấn tím
  '#f43f5e', // Hồng thắm
];

export function isDarkBackground(bg: BackgroundType): boolean {
  return bg === 'green' || bg === 'green_oly' || bg === 'green_ruled' || bg === 'black';
}

/**
 * Draws the selected background pattern onto the target 2D context
 */
export function drawBackground(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  background: BackgroundType
) {
  ctx.save();

  switch (background) {
    case 'white':
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, width, height);
      break;

    case 'ruled': {
      // Nền trắng kẻ ngang
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, width, height);
      
      const lineSpacing = 36;
      ctx.strokeStyle = '#e2e8f0';
      ctx.lineWidth = 1;
      
      // Draw horizontal lines
      ctx.beginPath();
      for (let y = lineSpacing; y < height; y += lineSpacing) {
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
      }
      ctx.stroke();

      // Left margin red line (lề vở)
      ctx.strokeStyle = '#fca5a5';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(80, 0);
      ctx.lineTo(80, height);
      ctx.stroke();
      break;
    }

    case 'grid': {
      // Nền lưới vuông toạ độ
      ctx.fillStyle = '#f8fafc';
      ctx.fillRect(0, 0, width, height);

      const gridSize = 40;
      // Minor grid
      ctx.strokeStyle = '#e2e8f0';
      ctx.lineWidth = 0.8;
      ctx.beginPath();
      for (let x = 0; x < width; x += gridSize) {
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
      }
      for (let y = 0; y < height; y += gridSize) {
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
      }
      ctx.stroke();

      // Major grid (mỗi 5 ô)
      ctx.strokeStyle = '#cbd5e1';
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      for (let x = 0; x < width; x += gridSize * 5) {
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
      }
      for (let y = 0; y < height; y += gridSize * 5) {
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
      }
      ctx.stroke();
      break;
    }

    case 'oly': {
      // Nền ô ly học sinh Việt Nam (mỗi ô to có 5x5 ô nhỏ)
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, width, height);

      const majorCell = 50; // Ô lớn 50px
      const minorCell = 10; // Ô nhỏ 10px

      // Lưới phụ nhạt
      ctx.strokeStyle = '#e0f2fe';
      ctx.lineWidth = 0.6;
      ctx.beginPath();
      for (let x = 0; x < width; x += minorCell) {
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
      }
      for (let y = 0; y < height; y += minorCell) {
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
      }
      ctx.stroke();

      // Lưới chính đậm
      ctx.strokeStyle = '#bae6fd';
      ctx.lineWidth = 1.1;
      ctx.beginPath();
      for (let x = 0; x < width; x += majorCell) {
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
      }
      for (let y = 0; y < height; y += majorCell) {
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
      }
      ctx.stroke();

      // Lề kẻ đỏ vở học sinh
      ctx.strokeStyle = '#f87171';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(majorCell * 2, 0);
      ctx.lineTo(majorCell * 2, height);
      ctx.stroke();
      break;
    }

    case 'green':
      // Bảng xanh trường học
      ctx.fillStyle = '#1b4332';
      ctx.fillRect(0, 0, width, height);
      // Subtle chalk border / vignette
      ctx.strokeStyle = '#2d6a4f';
      ctx.lineWidth = 10;
      ctx.strokeRect(5, 5, width - 10, height - 10);
      break;

    case 'green_oly': {
      // Bảng xanh ô ly
      ctx.fillStyle = '#1e3f20';
      ctx.fillRect(0, 0, width, height);

      const majorCell = 60;
      const minorCell = 12;

      ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
      ctx.lineWidth = 0.6;
      ctx.beginPath();
      for (let x = 0; x < width; x += minorCell) {
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
      }
      for (let y = 0; y < height; y += minorCell) {
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
      }
      ctx.stroke();

      ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      for (let x = 0; x < width; x += majorCell) {
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
      }
      for (let y = 0; y < height; y += majorCell) {
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
      }
      ctx.stroke();
      break;
    }

    case 'green_ruled': {
      // Bảng xanh kẻ ngang
      ctx.fillStyle = '#1b4332';
      ctx.fillRect(0, 0, width, height);

      const lineSpacing = 45;
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      for (let y = lineSpacing; y < height; y += lineSpacing) {
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
      }
      ctx.stroke();
      break;
    }

    case 'black':
      // Bảng đen cổ điển
      ctx.fillStyle = '#18181b';
      ctx.fillRect(0, 0, width, height);
      // Subtle chalk frame
      ctx.strokeStyle = '#27272a';
      ctx.lineWidth = 10;
      ctx.strokeRect(5, 5, width - 10, height - 10);
      break;
  }

  ctx.restore();
}

/**
 * Draws a stroke element onto the canvas with realistic pen dynamics
 */
export function drawStroke(ctx: CanvasRenderingContext2D, stroke: StrokeElement) {
  if (!stroke.points || stroke.points.length === 0) return;

  ctx.save();
  ctx.strokeStyle = stroke.color;
  ctx.fillStyle = stroke.color;
  ctx.lineCap = stroke.penType === 'highlighter' ? 'square' : 'round';
  ctx.lineJoin = stroke.penType === 'highlighter' ? 'bevel' : 'round';

  // Nét đứt đoạn cho bút viết / vẽ tay
  if (stroke.isDashed) {
    const dashLen = Math.max(8, stroke.thickness * 2.5);
    const gapLen = Math.max(6, stroke.thickness * 1.8);
    ctx.setLineDash([dashLen, gapLen]);
    ctx.globalAlpha = stroke.opacity || (stroke.penType === 'highlighter' ? 0.4 : 1.0);
    ctx.lineWidth = stroke.penType === 'highlighter' ? stroke.thickness * 2.2 : stroke.thickness;

    const pts = stroke.points;
    if (pts.length === 1) {
      ctx.beginPath();
      ctx.arc(pts[0].x, pts[0].y, stroke.thickness / 2, 0, Math.PI * 2);
      ctx.fill();
    } else if (pts.length === 2) {
      ctx.beginPath();
      ctx.moveTo(pts[0].x, pts[0].y);
      ctx.lineTo(pts[1].x, pts[1].y);
      ctx.stroke();
    } else {
      ctx.beginPath();
      ctx.moveTo(pts[0].x, pts[0].y);
      for (let i = 1; i < pts.length - 1; i++) {
        const xc = (pts[i].x + pts[i + 1].x) / 2;
        const yc = (pts[i].y + pts[i + 1].y) / 2;
        ctx.quadraticCurveTo(pts[i].x, pts[i].y, xc, yc);
      }
      ctx.lineTo(pts[pts.length - 1].x, pts[pts.length - 1].y);
      ctx.stroke();
    }
    ctx.restore();
    return;
  }

  ctx.setLineDash([]);

  if (stroke.penType === 'highlighter') {
    ctx.globalAlpha = stroke.opacity || 0.4;
    ctx.lineWidth = stroke.thickness * 2.2;
    // Normal smooth path for highlighter
    const pts = stroke.points;
    if (pts.length === 1) {
      ctx.fillRect(pts[0].x - stroke.thickness, pts[0].y - stroke.thickness, stroke.thickness * 2, stroke.thickness * 2);
    } else {
      ctx.beginPath();
      ctx.moveTo(pts[0].x, pts[0].y);
      for (let i = 1; i < pts.length; i++) {
        ctx.lineTo(pts[i].x, pts[i].y);
      }
      ctx.stroke();
    }
    ctx.restore();
    return;
  }

  ctx.globalAlpha = stroke.opacity || 1.0;

  if (stroke.penType === 'standard') {
    // Smooth bezier interpolation
    const pts = stroke.points;
    ctx.lineWidth = stroke.thickness;

    if (pts.length === 1) {
      ctx.beginPath();
      ctx.arc(pts[0].x, pts[0].y, stroke.thickness / 2, 0, Math.PI * 2);
      ctx.fill();
    } else if (pts.length === 2) {
      ctx.beginPath();
      ctx.moveTo(pts[0].x, pts[0].y);
      ctx.lineTo(pts[1].x, pts[1].y);
      ctx.stroke();
    } else {
      ctx.beginPath();
      ctx.moveTo(pts[0].x, pts[0].y);
      for (let i = 1; i < pts.length - 1; i++) {
        const xc = (pts[i].x + pts[i + 1].x) / 2;
        const yc = (pts[i].y + pts[i + 1].y) / 2;
        ctx.quadraticCurveTo(pts[i].x, pts[i].y, xc, yc);
      }
      ctx.lineTo(pts[pts.length - 1].x, pts[pts.length - 1].y);
      ctx.stroke();
    }
  } else if (stroke.penType === 'fountain') {
    // Bút máy nét thanh nét đậm:
    // Uses velocity, direction angle (calligraphy nib at 45 deg), and pressure
    const pts = stroke.points;
    if (pts.length === 1) {
      ctx.beginPath();
      ctx.arc(pts[0].x, pts[0].y, stroke.thickness / 2, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
      return;
    }

    for (let i = 1; i < pts.length; i++) {
      const p1 = pts[i - 1];
      const p2 = pts[i];
      const dx = p2.x - p1.x;
      const dy = p2.y - p1.y;
      const dist = Math.hypot(dx, dy);
      const angle = Math.atan2(dy, dx);

      // Calligraphy angle modulation: strokes perpendicular to 45 deg are thicker
      const angleMod = Math.abs(Math.sin(angle - Math.PI / 4));
      const velocity = Math.min(dist / 4, 3); // Faster = slightly thinner
      const pressure = p2.pressure !== undefined && p2.pressure > 0 ? p2.pressure : 0.5;

      const dynamicWidth = Math.max(
        stroke.thickness * 0.35,
        stroke.thickness * (0.4 + 0.6 * pressure + 0.5 * angleMod - 0.2 * (velocity / 3))
      );

      ctx.lineWidth = dynamicWidth;
      ctx.beginPath();
      ctx.moveTo(p1.x, p1.y);
      ctx.lineTo(p2.x, p2.y);
      ctx.stroke();
    }
  }

  ctx.restore();
}

/**
 * Helper: draw function coordinate axes & tick marks
 */
function drawFunctionOxyGrid(
  ctx: CanvasRenderingContext2D,
  ox: number,
  oy: number,
  minX: number,
  maxX: number,
  minY: number,
  maxY: number,
  unit: number,
  _baseColor: string
) {
  ctx.save();
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.45)';
  ctx.fillStyle = 'rgba(255, 255, 255, 0.75)';
  ctx.lineWidth = 1.2;

  // Trục Ox
  ctx.beginPath();
  ctx.moveTo(minX, oy);
  ctx.lineTo(maxX, oy);
  ctx.stroke();

  // Mũi tên Ox
  ctx.beginPath();
  ctx.moveTo(maxX, oy);
  ctx.lineTo(maxX - 8, oy - 4);
  ctx.lineTo(maxX - 8, oy + 4);
  ctx.closePath();
  ctx.fill();

  // Trục Oy
  ctx.beginPath();
  ctx.moveTo(ox, maxY);
  ctx.lineTo(ox, minY);
  ctx.stroke();

  // Mũi tên Oy
  ctx.beginPath();
  ctx.moveTo(ox, minY);
  ctx.lineTo(ox - 4, minY + 8);
  ctx.lineTo(ox + 4, minY + 8);
  ctx.closePath();
  ctx.fill();

  // Vạch chia đơn vị (Ticks)
  const tickSize = 3;
  ctx.font = '10px STIX Two Text, serif';
  const maxUnitsX = Math.floor((maxX - ox) / unit);
  const minUnitsX = Math.ceil((minX - ox) / unit);

  for (let u = minUnitsX; u <= maxUnitsX; u++) {
    if (u === 0) continue;
    const tx = ox + u * unit;
    if (tx >= minX + 5 && tx <= maxX - 12) {
      ctx.beginPath();
      ctx.moveTo(tx, oy - tickSize);
      ctx.lineTo(tx, oy + tickSize);
      ctx.stroke();
      ctx.fillText(`${u}`, tx - 3, oy + 12);
    }
  }

  const maxUnitsY = Math.floor((oy - minY) / unit);
  const minUnitsY = Math.ceil((oy - maxY) / unit);
  for (let u = minUnitsY; u <= maxUnitsY; u++) {
    if (u === 0) continue;
    const ty = oy - u * unit;
    if (ty >= minY + 12 && ty <= maxY - 5) {
      ctx.beginPath();
      ctx.moveTo(ox - tickSize, ty);
      ctx.lineTo(ox + tickSize, ty);
      ctx.stroke();
      ctx.fillText(`${u}`, ox + 5, ty + 3);
    }
  }

  ctx.font = 'italic bold 12px STIX Two Text, serif';
  ctx.fillText('O', ox - 12, oy + 13);
  ctx.fillText('x', maxX - 6, oy + 14);
  ctx.fillText('y', ox + 6, minY + 12);

  ctx.restore();
}

function drawGraphFormulaBadge(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  color: string
) {
  ctx.save();
  ctx.font = 'bold 13px STIX Two Text, serif';
  const textW = ctx.measureText(text).width;
  ctx.fillStyle = 'rgba(15, 23, 42, 0.8)';
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.roundRect(x - 6, y - 14, textW + 14, 22, 6);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = color || '#38bdf8';
  ctx.fillText(text, x, y + 2);
  ctx.restore();
}

function formatCubicEquation(a: number, b: number, c: number, d: number): string {
  let s = 'y = ';
  let first = true;
  if (a !== 0) {
    if (a === 1) s += 'x³';
    else if (a === -1) s += '-x³';
    else s += `${a}x³`;
    first = false;
  }
  if (b !== 0) {
    const sign = b > 0 ? (first ? '' : ' + ') : ' - ';
    const absB = Math.abs(b);
    s += sign + (absB === 1 ? 'x²' : `${absB}x²`);
    first = false;
  }
  if (c !== 0) {
    const sign = c > 0 ? (first ? '' : ' + ') : ' - ';
    const absC = Math.abs(c);
    s += sign + (absC === 1 ? 'x' : `${absC}x`);
    first = false;
  }
  if (d !== 0 || first) {
    const sign = d > 0 ? (first ? '' : ' + ') : ' - ';
    s += first ? `${d}` : sign + `${Math.abs(d)}`;
  }
  return s;
}

function formatRationalEquation(a: number, b: number, c: number, d: number): string {
  const num = `${a === 1 ? 'x' : a === -1 ? '-x' : `${a}x`} ${b >= 0 ? `+ ${b}` : `- ${Math.abs(b)}`}`;
  const den = `${c === 1 ? 'x' : c === -1 ? '-x' : `${c}x`} ${d >= 0 ? `+ ${d}` : `- ${Math.abs(d)}`}`;
  return `y = (${num}) / (${den})`;
}

function formatQuadraticRationalEquation(a: number, b: number, c: number, d: number, e: number): string {
  const termA = a === 1 ? 'x²' : a === -1 ? '-x²' : `${a}x²`;
  const termB = b !== 0 ? (b > 0 ? ` + ${b === 1 ? 'x' : `${b}x`}` : ` - ${Math.abs(b) === 1 ? 'x' : `${Math.abs(b)}x`}`) : '';
  const termC = c !== 0 ? (c > 0 ? ` + ${c}` : ` - ${Math.abs(c)}`) : '';
  const den = `${d === 1 ? 'x' : d === -1 ? '-x' : `${d}x`} ${e >= 0 ? `+ ${e}` : `- ${Math.abs(e)}`}`;
  return `y = (${termA}${termB}${termC}) / (${den})`;
}

function drawCubicGraph(
  ctx: CanvasRenderingContext2D,
  shape: ShapeElement,
  minX: number,
  maxX: number,
  minY: number,
  maxY: number,
  w: number,
  h: number
) {
  const p = shape.graphParams || {};
  const a = p.a ?? 1;
  const b = p.b ?? 0;
  const c = p.c ?? -3;
  const d = p.d ?? 0;
  const showAxes = p.showAxes ?? true;
  const showPoints = p.showPoints ?? true;
  const showFormula = p.showFormula ?? true;

  const ox = (minX + maxX) / 2;
  const oy = (minY + maxY) / 2;
  const unit = Math.max(16, Math.min(w / 7.5, h / 7.5));

  if (showAxes) {
    drawFunctionOxyGrid(ctx, ox, oy, minX, maxX, minY, maxY, unit, shape.color);
  }

  // Draw the curve with clipping
  ctx.save();
  ctx.beginPath();
  ctx.rect(minX, minY, w, h);
  ctx.clip();

  ctx.strokeStyle = shape.color;
  ctx.lineWidth = shape.strokeWidth;
  ctx.setLineDash([]);
  ctx.beginPath();

  let drawing = false;
  for (let px = minX; px <= maxX; px += 1.5) {
    const x = (px - ox) / unit;
    const y = a * x * x * x + b * x * x + c * x + d;
    const py = oy - y * unit;

    if (py >= minY - 20 && py <= maxY + 20) {
      if (!drawing) {
        ctx.moveTo(px, py);
        drawing = true;
      } else {
        ctx.lineTo(px, py);
      }
    } else {
      drawing = false;
    }
  }
  ctx.stroke();

  // Draw Inflection point & Extrema
  if (showPoints && a !== 0) {
    const ptColor = p.pointsColor || '#f43f5e';
    // Inflection point: x = -b / (3a)
    const xI = -b / (3 * a);
    const yI = a * xI * xI * xI + b * xI * xI + c * xI + d;
    const pxI = ox + xI * unit;
    const pyI = oy - yI * unit;

    if (pxI >= minX && pxI <= maxX && pyI >= minY && pyI <= maxY) {
      ctx.fillStyle = ptColor;
      ctx.beginPath();
      ctx.arc(pxI, pyI, 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.font = 'bold 11px STIX Two Text, serif';
      ctx.fillText('I', pxI + 6, pyI - 6);
    }

    // Extrema: delta' = b^2 - 3ac
    const deltaPrime = b * b - 3 * a * c;
    if (deltaPrime > 0) {
      const x1 = (-b - Math.sqrt(deltaPrime)) / (3 * a);
      const x2 = (-b + Math.sqrt(deltaPrime)) / (3 * a);
      const pts = [
        { x: x1, y: a * x1 * x1 * x1 + b * x1 * x1 + c * x1 + d, label: a > 0 ? 'CĐ' : 'CT' },
        { x: x2, y: a * x2 * x2 * x2 + b * x2 * x2 + c * x2 + d, label: a > 0 ? 'CT' : 'CĐ' },
      ];

      pts.forEach((pt) => {
        const sx = ox + pt.x * unit;
        const sy = oy - pt.y * unit;
        if (sx >= minX && sx <= maxX && sy >= minY && sy <= maxY) {
          ctx.save();
          ctx.setLineDash([2, 3]);
          ctx.strokeStyle = 'rgba(255, 255, 255, 0.45)';
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(sx, oy);
          ctx.lineTo(sx, sy);
          ctx.lineTo(ox, sy);
          ctx.stroke();
          ctx.restore();

          ctx.fillStyle = ptColor;
          ctx.beginPath();
          ctx.arc(sx, sy, 4, 0, Math.PI * 2);
          ctx.fill();

          ctx.font = '10px STIX Two Text, serif';
          ctx.fillText(pt.label, sx + 6, sy - 6);
        }
      });
    }
  }

  ctx.restore();

  // Formula label
  if (showFormula) {
    const eq = p.formulaTex || formatCubicEquation(a, b, c, d);
    drawGraphFormulaBadge(ctx, eq, minX + 10, minY + 18, shape.color);
  }
}

function drawRationalGraph(
  ctx: CanvasRenderingContext2D,
  shape: ShapeElement,
  minX: number,
  maxX: number,
  minY: number,
  maxY: number,
  w: number,
  h: number
) {
  const p = shape.graphParams || {};
  const a = p.a ?? 2;
  const b = p.b ?? -1;
  const c = p.c ?? 1;
  const d = p.d ?? 1;
  const showAxes = p.showAxes ?? true;
  const showAsymptotes = p.showAsymptotes ?? true;
  const showPoints = p.showPoints ?? true;
  const showFormula = p.showFormula ?? true;

  const ox = (minX + maxX) / 2;
  const oy = (minY + maxY) / 2;
  const unit = Math.max(16, Math.min(w / 7.5, h / 7.5));

  if (showAxes) {
    drawFunctionOxyGrid(ctx, ox, oy, minX, maxX, minY, maxY, unit, shape.color);
  }

  // Tiệm cận đứng TCĐ: x = -d / c
  const xTcd = c !== 0 ? -d / c : 0;
  const pxTcd = ox + xTcd * unit;

  // Tiệm cận ngang TCN: y = a / c
  const yTcn = c !== 0 ? a / c : 0;
  const pyTcn = oy - yTcn * unit;

  // Draw Asymptotes
  if (showAsymptotes && c !== 0) {
    ctx.save();
    ctx.setLineDash([4, 4]);
    ctx.strokeStyle = p.asymptoteColor || '#facc15';
    ctx.lineWidth = Math.max(1.2, shape.strokeWidth * 0.7);

    // TCĐ
    if (pxTcd >= minX && pxTcd <= maxX) {
      ctx.beginPath();
      ctx.moveTo(pxTcd, minY);
      ctx.lineTo(pxTcd, maxY);
      ctx.stroke();

      ctx.fillStyle = p.asymptoteColor || '#facc15';
      ctx.font = '10px STIX Two Text, serif';
      ctx.fillText(`TCĐ x=${Number(xTcd.toFixed(2))}`, pxTcd + 4, maxY - 8);
    }

    // TCN
    if (pyTcn >= minY && pyTcn <= maxY) {
      ctx.beginPath();
      ctx.moveTo(minX, pyTcn);
      ctx.lineTo(maxX, pyTcn);
      ctx.stroke();

      ctx.fillStyle = p.asymptoteColor || '#facc15';
      ctx.font = '10px STIX Two Text, serif';
      ctx.fillText(`TCN y=${Number(yTcn.toFixed(2))}`, maxX - 65, pyTcn - 4);
    }

    ctx.restore();
  }

  // Draw Hyperbola branches with clipping
  ctx.save();
  ctx.beginPath();
  ctx.rect(minX, minY, w, h);
  ctx.clip();

  ctx.strokeStyle = shape.color;
  ctx.lineWidth = shape.strokeWidth;
  ctx.setLineDash([]);

  // Branch 1: x < xTcd
  ctx.beginPath();
  let draw1 = false;
  for (let px = minX; px <= pxTcd - 2; px += 1.5) {
    const x = (px - ox) / unit;
    const denom = c * x + d;
    if (Math.abs(denom) < 0.001) { draw1 = false; continue; }
    const y = (a * x + b) / denom;
    const py = oy - y * unit;

    if (py >= minY - 30 && py <= maxY + 30) {
      if (!draw1) { ctx.moveTo(px, py); draw1 = true; }
      else { ctx.lineTo(px, py); }
    } else {
      draw1 = false;
    }
  }
  ctx.stroke();

  // Branch 2: x > xTcd
  ctx.beginPath();
  let draw2 = false;
  for (let px = pxTcd + 2; px <= maxX; px += 1.5) {
    const x = (px - ox) / unit;
    const denom = c * x + d;
    if (Math.abs(denom) < 0.001) { draw2 = false; continue; }
    const y = (a * x + b) / denom;
    const py = oy - y * unit;

    if (py >= minY - 30 && py <= maxY + 30) {
      if (!draw2) { ctx.moveTo(px, py); draw2 = true; }
      else { ctx.lineTo(px, py); }
    } else {
      draw2 = false;
    }
  }
  ctx.stroke();

  // Center of Symmetry I(xTcd, yTcn)
  if (showPoints && c !== 0) {
    const ptColor = p.pointsColor || '#f43f5e';
    if (pxTcd >= minX && pxTcd <= maxX && pyTcn >= minY && pyTcn <= maxY) {
      ctx.fillStyle = ptColor;
      ctx.beginPath();
      ctx.arc(pxTcd, pyTcn, 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.font = 'bold 11px STIX Two Text, serif';
      ctx.fillText('I', pxTcd + 6, pyTcn - 6);
    }
  }

  ctx.restore();

  // Formula label
  if (showFormula) {
    const eq = p.formulaTex || formatRationalEquation(a, b, c, d);
    drawGraphFormulaBadge(ctx, eq, minX + 10, minY + 18, shape.color);
  }
}

function drawQuadraticRationalGraph(
  ctx: CanvasRenderingContext2D,
  shape: ShapeElement,
  minX: number,
  maxX: number,
  minY: number,
  maxY: number,
  w: number,
  h: number
) {
  const p = shape.graphParams || {};
  const a = p.a ?? 1;
  const b = p.b ?? -1;
  const c = p.c ?? 1;
  const d = p.d ?? 1;
  const e = p.e ?? -1;
  const showAxes = p.showAxes ?? true;
  const showAsymptotes = p.showAsymptotes ?? true;
  const showPoints = p.showPoints ?? true;
  const showFormula = p.showFormula ?? true;

  const ox = (minX + maxX) / 2;
  const oy = (minY + maxY) / 2;
  const unit = Math.max(16, Math.min(w / 7.5, h / 7.5));

  if (showAxes) {
    drawFunctionOxyGrid(ctx, ox, oy, minX, maxX, minY, maxY, unit, shape.color);
  }

  // Tiệm cận đứng: x = -e / d
  const xTcd = d !== 0 ? -e / d : 0;
  const pxTcd = ox + xTcd * unit;

  // Tiệm cận xiên TCX: y = m*x + n
  // m = a / d, n = (b*d - a*e) / (d*d)
  const m = d !== 0 ? a / d : 1;
  const n = d !== 0 ? (b * d - a * e) / (d * d) : 0;

  // Draw Asymptotes
  if (showAsymptotes && d !== 0) {
    ctx.save();
    ctx.setLineDash([4, 4]);
    ctx.strokeStyle = p.asymptoteColor || '#facc15';
    ctx.lineWidth = Math.max(1.2, shape.strokeWidth * 0.7);

    // TCĐ
    if (pxTcd >= minX && pxTcd <= maxX) {
      ctx.beginPath();
      ctx.moveTo(pxTcd, minY);
      ctx.lineTo(pxTcd, maxY);
      ctx.stroke();

      ctx.fillStyle = p.asymptoteColor || '#facc15';
      ctx.font = '10px STIX Two Text, serif';
      ctx.fillText(`TCĐ x=${Number(xTcd.toFixed(2))}`, pxTcd + 4, maxY - 8);
    }

    // TCX
    const xStart = (minX - ox) / unit;
    const yStart = m * xStart + n;
    const pyStart = oy - yStart * unit;

    const xEnd = (maxX - ox) / unit;
    const yEnd = m * xEnd + n;
    const pyEnd = oy - yEnd * unit;

    ctx.save();
    ctx.beginPath();
    ctx.rect(minX, minY, w, h);
    ctx.clip();
    ctx.beginPath();
    ctx.moveTo(minX, pyStart);
    ctx.lineTo(maxX, pyEnd);
    ctx.stroke();
    ctx.restore();

    ctx.fillStyle = p.asymptoteColor || '#facc15';
    ctx.font = '10px STIX Two Text, serif';
    const mStr = m === 1 ? 'x' : m === -1 ? '-x' : `${Number(m.toFixed(2))}x`;
    const nStr = n >= 0 ? `+${Number(n.toFixed(2))}` : `${Number(n.toFixed(2))}`;
    ctx.fillText(`TCX y=${mStr}${n === 0 ? '' : nStr}`, maxX - 85, Math.max(minY + 25, Math.min(maxY - 15, pyEnd - 6)));

    ctx.restore();
  }

  // Draw the two branches with clipping
  ctx.save();
  ctx.beginPath();
  ctx.rect(minX, minY, w, h);
  ctx.clip();

  ctx.strokeStyle = shape.color;
  ctx.lineWidth = shape.strokeWidth;
  ctx.setLineDash([]);

  const evalY = (xVal: number) => {
    const denom = d * xVal + e;
    if (Math.abs(denom) < 0.0001) return null;
    return (a * xVal * xVal + b * xVal + c) / denom;
  };

  // Branch 1: left of TCĐ
  ctx.beginPath();
  let draw1 = false;
  for (let px = minX; px <= pxTcd - 2; px += 1.5) {
    const x = (px - ox) / unit;
    const y = evalY(x);
    if (y === null) { draw1 = false; continue; }
    const py = oy - y * unit;

    if (py >= minY - 40 && py <= maxY + 40) {
      if (!draw1) { ctx.moveTo(px, py); draw1 = true; }
      else { ctx.lineTo(px, py); }
    } else {
      draw1 = false;
    }
  }
  ctx.stroke();

  // Branch 2: right of TCĐ
  ctx.beginPath();
  let draw2 = false;
  for (let px = pxTcd + 2; px <= maxX; px += 1.5) {
    const x = (px - ox) / unit;
    const y = evalY(x);
    if (y === null) { draw2 = false; continue; }
    const py = oy - y * unit;

    if (py >= minY - 40 && py <= maxY + 40) {
      if (!draw2) { ctx.moveTo(px, py); draw2 = true; }
      else { ctx.lineTo(px, py); }
    } else {
      draw2 = false;
    }
  }
  ctx.stroke();

  // Tâm đối xứng I & Cực trị
  if (showPoints && d !== 0) {
    const ptColor = p.pointsColor || '#f43f5e';
    const yI = m * xTcd + n;
    const pyI = oy - yI * unit;
    if (pxTcd >= minX && pxTcd <= maxX && pyI >= minY && pyI <= maxY) {
      ctx.fillStyle = ptColor;
      ctx.beginPath();
      ctx.arc(pxTcd, pyI, 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.font = 'bold 11px STIX Two Text, serif';
      ctx.fillText('I', pxTcd + 6, pyI - 6);
    }

    const capA = a * d;
    const capB = 2 * a * e;
    const capC = b * e - c * d;
    const delta = capB * capB - 4 * capA * capC;

    if (delta > 0 && capA !== 0) {
      const x1 = (-capB - Math.sqrt(delta)) / (2 * capA);
      const x2 = (-capB + Math.sqrt(delta)) / (2 * capA);
      const pts = [
        { x: x1, y: evalY(x1) },
        { x: x2, y: evalY(x2) },
      ];

      pts.forEach((pt) => {
        if (pt.y === null) return;
        const sx = ox + pt.x * unit;
        const sy = oy - pt.y * unit;
        if (sx >= minX && sx <= maxX && sy >= minY && sy <= maxY) {
          ctx.save();
          ctx.setLineDash([2, 3]);
          ctx.strokeStyle = 'rgba(255, 255, 255, 0.45)';
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(sx, oy);
          ctx.lineTo(sx, sy);
          ctx.lineTo(ox, sy);
          ctx.stroke();
          ctx.restore();

          ctx.fillStyle = ptColor;
          ctx.beginPath();
          ctx.arc(sx, sy, 4, 0, Math.PI * 2);
          ctx.fill();
        }
      });
    }
  }

  ctx.restore();

  // Formula label
  if (showFormula) {
    const eq = p.formulaTex || formatQuadraticRationalEquation(a, b, c, d, e);
    drawGraphFormulaBadge(ctx, eq, minX + 10, minY + 18, shape.color);
  }
}

/**
 * Draws a geometric shape with math symbols
 */
export function drawShape(ctx: CanvasRenderingContext2D, shape: ShapeElement) {
  const { shapeType, color, strokeWidth, startX, startY, endX, endY, isDashed } = shape;
  ctx.save();
  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  ctx.lineWidth = strokeWidth;

  if (isDashed) {
    ctx.setLineDash([8, 6]);
  } else {
    ctx.setLineDash([]);
  }

  const dx = endX - startX;
  const dy = endY - startY;

  switch (shapeType) {
    case 'line':
      ctx.beginPath();
      ctx.moveTo(startX, startY);
      ctx.lineTo(endX, endY);
      ctx.stroke();
      break;

    case 'arrow': {
      // Vector arrow
      ctx.beginPath();
      ctx.moveTo(startX, startY);
      ctx.lineTo(endX, endY);
      ctx.stroke();

      const angle = Math.atan2(dy, dx);
      const headLength = Math.max(14, strokeWidth * 3.5);
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.moveTo(endX, endY);
      ctx.lineTo(endX - headLength * Math.cos(angle - Math.PI / 6), endY - headLength * Math.sin(angle - Math.PI / 6));
      ctx.lineTo(endX - headLength * Math.cos(angle + Math.PI / 6), endY - headLength * Math.sin(angle + Math.PI / 6));
      ctx.closePath();
      ctx.fill();
      break;
    }

    case 'ray': {
      // Tia: has origin dot at start and extends with arrow
      ctx.beginPath();
      ctx.arc(startX, startY, strokeWidth * 1.5, 0, Math.PI * 2);
      ctx.fill();

      ctx.beginPath();
      ctx.moveTo(startX, startY);
      ctx.lineTo(endX, endY);
      ctx.stroke();

      const angle = Math.atan2(dy, dx);
      const headLength = Math.max(12, strokeWidth * 3);
      ctx.beginPath();
      ctx.moveTo(endX, endY);
      ctx.lineTo(endX - headLength * Math.cos(angle - Math.PI / 6), endY - headLength * Math.sin(angle - Math.PI / 6));
      ctx.lineTo(endX - headLength * Math.cos(angle + Math.PI / 6), endY - headLength * Math.sin(angle + Math.PI / 6));
      ctx.closePath();
      ctx.fill();
      break;
    }

    case 'rect': {
      const minX = Math.min(startX, endX);
      const minY = Math.min(startY, endY);
      const w = Math.abs(dx);
      const h = Math.abs(dy);
      ctx.strokeRect(minX, minY, w, h);
      break;
    }

    case 'square': {
      const minX = Math.min(startX, endX);
      const minY = Math.min(startY, endY);
      const size = Math.max(Math.abs(dx), Math.abs(dy));
      ctx.strokeRect(minX, minY, size, size);
      break;
    }

    case 'circle': {
      // Circle drawn with radius from center (startX, startY)
      const radius = Math.hypot(dx, dy);
      ctx.beginPath();
      ctx.arc(startX, startY, radius, 0, Math.PI * 2);
      ctx.stroke();

      // Draw Center point O and label
      ctx.beginPath();
      ctx.arc(startX, startY, strokeWidth + 1, 0, Math.PI * 2);
      ctx.fill();

      ctx.font = 'bold 15px Plus Jakarta Sans, sans-serif';
      ctx.fillText('O', startX - 18, startY - 8);
      break;
    }

    case 'ellipse': {
      const centerX = (startX + endX) / 2;
      const centerY = (startY + endY) / 2;
      const radiusX = Math.abs(dx) / 2;
      const radiusY = Math.abs(dy) / 2;
      ctx.beginPath();
      ctx.ellipse(centerX, centerY, Math.max(1, radiusX), Math.max(1, radiusY), 0, 0, Math.PI * 2);
      ctx.stroke();
      break;
    }

    case 'triangle': {
      // Tam giác thường (đỉnh đỉnh: start, đáy: endX, endY)
      const p1 = { x: (startX + endX) / 2, y: startY };
      const p2 = { x: startX, y: endY };
      const p3 = { x: endX, y: endY };
      ctx.beginPath();
      ctx.moveTo(p1.x, p1.y);
      ctx.lineTo(p2.x, p2.y);
      ctx.lineTo(p3.x, p3.y);
      ctx.closePath();
      ctx.stroke();
      break;
    }

    case 'right_triangle': {
      // Tam giác vuông tại (startX, endY)
      const pA = { x: startX, y: startY };
      const pB = { x: startX, y: endY }; // Góc vuông
      const pC = { x: endX, y: endY };

      ctx.beginPath();
      ctx.moveTo(pA.x, pA.y);
      ctx.lineTo(pB.x, pB.y);
      ctx.lineTo(pC.x, pC.y);
      ctx.closePath();
      ctx.stroke();

      // Right angle indicator ∟
      const sq = 16;
      const signX = endX >= startX ? 1 : -1;
      const signY = startY >= endY ? 1 : -1;
      ctx.beginPath();
      ctx.moveTo(pB.x + signX * sq, pB.y);
      ctx.lineTo(pB.x + signX * sq, pB.y + signY * sq);
      ctx.lineTo(pB.x, pB.y + signY * sq);
      ctx.stroke();
      break;
    }

    case 'isosceles_triangle': {
      // Tam giác cân
      const top = { x: (startX + endX) / 2, y: startY };
      const left = { x: startX, y: endY };
      const right = { x: endX, y: endY };
      ctx.beginPath();
      ctx.moveTo(top.x, top.y);
      ctx.lineTo(left.x, left.y);
      ctx.lineTo(right.x, right.y);
      ctx.closePath();
      ctx.stroke();
      break;
    }

    case 'equilateral_triangle': {
      // Tam giác đều
      const side = Math.hypot(dx, dy);
      const height = (Math.sqrt(3) / 2) * side;
      const top = { x: startX + dx / 2, y: startY - height };
      ctx.beginPath();
      ctx.moveTo(startX, startY);
      ctx.lineTo(endX, startY);
      ctx.lineTo(top.x, top.y);
      ctx.closePath();
      ctx.stroke();
      break;
    }

    case 'coordinate_oxy': {
      // Hệ trục toạ độ Oxy tiêu chuẩn toán học Việt Nam
      const originX = startX;
      const originY = startY;
      const axisLen = Math.max(160, Math.hypot(dx, dy));
      const step = 40;

      // Trục hoành Ox
      ctx.beginPath();
      ctx.moveTo(originX - axisLen * 0.8, originY);
      ctx.lineTo(originX + axisLen, originY);
      ctx.stroke();

      // Mũi tên Ox
      ctx.beginPath();
      ctx.moveTo(originX + axisLen, originY);
      ctx.lineTo(originX + axisLen - 12, originY - 6);
      ctx.lineTo(originX + axisLen - 12, originY + 6);
      ctx.closePath();
      ctx.fill();

      // Trục tung Oy
      ctx.beginPath();
      ctx.moveTo(originX, originY + axisLen * 0.8);
      ctx.lineTo(originX, originY - axisLen);
      ctx.stroke();

      // Mũi tên Oy
      ctx.beginPath();
      ctx.moveTo(originX, originY - axisLen);
      ctx.lineTo(originX - 6, originY - axisLen + 12);
      ctx.lineTo(originX + 6, originY - axisLen + 12);
      ctx.closePath();
      ctx.fill();

      // Vạch chia đơn vị (Ticks)
      const tickH = 4;
      ctx.font = '12px STIX Two Text, serif';
      for (let x = originX + step; x < originX + axisLen - 15; x += step) {
        ctx.beginPath();
        ctx.moveTo(x, originY - tickH);
        ctx.lineTo(x, originY + tickH);
        ctx.stroke();
      }
      for (let x = originX - step; x > originX - axisLen * 0.8; x -= step) {
        ctx.beginPath();
        ctx.moveTo(x, originY - tickH);
        ctx.lineTo(x, originY + tickH);
        ctx.stroke();
      }
      for (let y = originY - step; y > originY - axisLen + 15; y -= step) {
        ctx.beginPath();
        ctx.moveTo(originX - tickH, y);
        ctx.lineTo(originX + tickH, y);
        ctx.stroke();
      }
      for (let y = originY + step; y < originY + axisLen * 0.8; y += step) {
        ctx.beginPath();
        ctx.moveTo(originX - tickH, y);
        ctx.lineTo(originX + tickH, y);
        ctx.stroke();
      }

      // Labels O, x, y
      ctx.font = 'italic bold 16px STIX Two Text, serif';
      ctx.fillText('O', originX - 16, originY + 18);
      ctx.fillText('x', originX + axisLen - 6, originY + 20);
      ctx.fillText('y', originX + 12, originY - axisLen + 14);
      break;
    }

    case 'parabola': {
      // Đồ thị parabol đối xứng y = a*x^2
      const apexX = (startX + endX) / 2;
      const apexY = endY;
      const w = Math.abs(dx) / 2;
      const h = Math.abs(dy);
      const a = h / (w * w || 1);

      ctx.beginPath();
      let first = true;
      for (let px = -w; px <= w; px += 2) {
        const py = -a * px * px;
        const screenX = apexX + px;
        const screenY = apexY + py;
        if (first) {
          ctx.moveTo(screenX, screenY);
          first = false;
        } else {
          ctx.lineTo(screenX, screenY);
        }
      }
      ctx.stroke();
      break;
    }

    case 'cubic_function': {
      const minX = Math.min(startX, endX);
      const maxX = Math.max(startX, endX);
      const minY = Math.min(startY, endY);
      const maxY = Math.max(startY, endY);
      const w = Math.max(50, maxX - minX);
      const h = Math.max(50, maxY - minY);
      drawCubicGraph(ctx, shape, minX, maxX, minY, maxY, w, h);
      break;
    }

    case 'rational_function': {
      const minX = Math.min(startX, endX);
      const maxX = Math.max(startX, endX);
      const minY = Math.min(startY, endY);
      const maxY = Math.max(startY, endY);
      const w = Math.max(50, maxX - minX);
      const h = Math.max(50, maxY - minY);
      drawRationalGraph(ctx, shape, minX, maxX, minY, maxY, w, h);
      break;
    }

    case 'quadratic_rational_function': {
      const minX = Math.min(startX, endX);
      const maxX = Math.max(startX, endX);
      const minY = Math.min(startY, endY);
      const maxY = Math.max(startY, endY);
      const w = Math.max(50, maxX - minX);
      const h = Math.max(50, maxY - minY);
      drawQuadraticRationalGraph(ctx, shape, minX, maxX, minY, maxY, w, h);
      break;
    }

    case 'parallelogram': {
      const offset = dx * 0.3;
      ctx.beginPath();
      ctx.moveTo(startX + offset, startY);
      ctx.lineTo(endX, startY);
      ctx.lineTo(endX - offset, endY);
      ctx.lineTo(startX, endY);
      ctx.closePath();
      ctx.stroke();
      break;
    }

    case 'trapezoid': {
      const topOffset = Math.abs(dx) * 0.25;
      ctx.beginPath();
      ctx.moveTo(startX + topOffset, startY);
      ctx.lineTo(endX - topOffset, startY);
      ctx.lineTo(endX, endY);
      ctx.lineTo(startX, endY);
      ctx.closePath();
      ctx.stroke();
      break;
    }
  }

  ctx.restore();
}

/**
 * Pre-cached KaTeX SVG images for canvas rendering
 */
const formulaImageCache = new Map<string, HTMLImageElement>();

export function getCachedFormulaImage(latex: string, color: string, fontSize: number): HTMLImageElement | null {
  const cacheKey = `${latex}_${color}_${fontSize}`;
  if (formulaImageCache.has(cacheKey)) {
    return formulaImageCache.get(cacheKey)!;
  }

  try {
    const htmlString = katex.renderToString(latex, {
      displayMode: true,
      throwOnError: false,
    });

    const svgWrapper = `
      <svg xmlns="http://www.w3.org/2000/svg" width="600" height="200">
        <foreignObject width="100%" height="100%">
          <div xmlns="http://www.w3.org/1999/xhtml" style="color: ${color}; font-size: ${fontSize}px; padding: 10px;">
            ${htmlString}
          </div>
        </foreignObject>
      </svg>
    `;

    const img = new Image();
    img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svgWrapper);
    formulaImageCache.set(cacheKey, img);
    return img;
  } catch (err) {
    console.error('KaTeX rendering error:', err);
    return null;
  }
}

/**
 * Draws text and math elements
 */
export function drawText(ctx: CanvasRenderingContext2D, text: TextElement) {
  ctx.save();
  ctx.fillStyle = text.color;

  if (text.isFormula && text.latex) {
    const cachedImg = getCachedFormulaImage(text.latex, text.color, text.fontSize);
    if (cachedImg && cachedImg.complete && cachedImg.naturalWidth > 0) {
      ctx.drawImage(cachedImg, text.x, text.y);
    } else {
      // Fallback text
      ctx.font = `${text.fontSize}px STIX Two Text, serif`;
      ctx.fillText(text.content || text.latex, text.x, text.y + text.fontSize);
    }
  } else {
    ctx.font = `${text.fontSize}px Plus Jakarta Sans, sans-serif`;
    const lines = text.content.split('\n');
    lines.forEach((line, idx) => {
      ctx.fillText(line, text.x, text.y + (idx + 1) * (text.fontSize * 1.3));
    });
  }

  ctx.restore();
}

/**
 * Pre-cached Image elements
 */
const imageCache = new Map<string, HTMLImageElement>();

export function drawImageElement(ctx: CanvasRenderingContext2D, imgElem: ImageElement) {
  let img = imageCache.get(imgElem.dataUrl);
  if (!img) {
    img = new Image();
    img.src = imgElem.dataUrl;
    imageCache.set(imgElem.dataUrl, img);
  }

  if (img.complete && img.naturalWidth > 0) {
    ctx.save();
    if (imgElem.rotation) {
      ctx.translate(imgElem.x + imgElem.width / 2, imgElem.y + imgElem.height / 2);
      ctx.rotate((imgElem.rotation * Math.PI) / 180);
      ctx.drawImage(img, -imgElem.width / 2, -imgElem.height / 2, imgElem.width, imgElem.height);
    } else {
      ctx.drawImage(img, imgElem.x, imgElem.y, imgElem.width, imgElem.height);
    }
    ctx.restore();
  }
}

/**
 * Render all elements of a page
 */
export function renderCanvasPage(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  background: BackgroundType,
  elements: BoardElement[],
  laserPoints?: { x: number; y: number; time: number }[]
) {
  // Clear and paint background
  ctx.clearRect(0, 0, width, height);
  drawBackground(ctx, width, height, background);

  // Render elements in order
  for (const el of elements) {
    if (el.type === 'stroke') {
      drawStroke(ctx, el);
    } else if (el.type === 'shape') {
      drawShape(ctx, el);
    } else if (el.type === 'text') {
      drawText(ctx, el);
    } else if (el.type === 'image') {
      drawImageElement(ctx, el);
    }
  }

  // Render laser pointer trail if active
  if (laserPoints && laserPoints.length > 0) {
    const now = performance.now();
    ctx.save();
    for (let i = 0; i < laserPoints.length; i++) {
      const pt = laserPoints[i];
      const age = now - pt.time;
      if (age < 1200) {
        const alpha = Math.max(0, 1 - age / 1200);
        ctx.fillStyle = `rgba(239, 68, 68, ${alpha})`;
        ctx.shadowColor = '#ef4444';
        ctx.shadowBlur = 10;
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, 7 * alpha, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    ctx.restore();
  }
}
