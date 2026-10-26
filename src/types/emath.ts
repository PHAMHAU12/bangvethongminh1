/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type PenType = 'standard' | 'fountain' | 'highlighter';

export type ToolType = 
  | 'pen'           // Bút viết (chứa bút thường, bút máy, bút tô)
  | 'eraser'        // Tẩy (tẩy nét hoặc tẩy điểm)
  | 'shape'         // Dựng hình học
  | 'text'          // Đánh máy / Công thức
  | 'image'         // Chèn tài liệu, ảnh
  | 'select'        // Chọn và di chuyển đối tượng
  | 'laser'         // Bút laser trình chiếu
  | 'ruler';        // Thước đo thẳng / đo góc

export type EraserMode = 'stroke' | 'pixel';

export type ShapeType =
  | 'line'          // Đoạn thẳng
  | 'arrow'         // Véc-tơ / Mũi tên
  | 'ray'           // Tia
  | 'rect'          // Hình chữ nhật
  | 'square'        // Hình vuông
  | 'triangle'      // Tam giác thường
  | 'right_triangle'// Tam giác vuông
  | 'isosceles_triangle' // Tam giác cân
  | 'equilateral_triangle' // Tam giác đều
  | 'circle'        // Đường tròn (tâm & bán kính)
  | 'ellipse'       // Hình elip
  | 'coordinate_oxy'// Hệ trục toạ độ Oxy
  | 'parabola'      // Đồ thị Parabol y = x^2
  | 'cubic_function'// Đồ thị hàm bậc 3: y = ax^3 + bx^2 + cx + d
  | 'rational_function' // Đồ thị hàm nhất biến: y = (ax+b)/(cx+d)
  | 'quadratic_rational_function' // Đồ thị hàm bậc 2 trên bậc 1: y = (ax^2+bx+c)/(dx+e)
  | 'parallelogram' // Hình bình hành
  | 'trapezoid';    // Hình thang

export interface GraphFunctionParams {
  functionType?: 'cubic' | 'rational' | 'quadratic_rational';
  a?: number;
  b?: number;
  c?: number;
  d?: number;
  e?: number;
  showAxes?: boolean;
  showAsymptotes?: boolean;
  showPoints?: boolean;
  showFormula?: boolean;
  formulaTex?: string;
  asymptoteColor?: string;
  pointsColor?: string;
}

export type PaperSize = 
  | 'A4'            // 210 x 297 mm
  | 'A5'            // 148 x 210 mm
  | '16:9'          // Bảng ngang trình chiếu
  | '9:16'          // Bảng dọc điện thoại
  | '16:10'         // Tablet
  | '4:3'           // iPad
  | '3:2';          // Surface

export type BackgroundType =
  | 'oly'           // Nền ô ly học sinh
  | 'grid'          // Nền lưới vuông (toạ độ)
  | 'ruled'         // Nền trắng kẻ ngang
  | 'white'         // Nền trắng trơn
  | 'green'         // Bảng xanh trường học
  | 'green_oly'     // Bảng xanh ô ly
  | 'green_ruled'   // Bảng xanh kẻ ngang
  | 'black';        // Bảng đen

export type ViewMode = 'fit_page' | 'fit_width';

export interface Point {
  x: number;
  y: number;
  pressure?: number;
  time?: number;
}

export interface StrokeElement {
  id: string;
  type: 'stroke';
  penType: PenType;
  color: string;
  thickness: number;
  opacity: number;
  points: Point[];
  isDashed?: boolean;
}

export interface ShapeElement {
  id: string;
  type: 'shape';
  shapeType: ShapeType;
  color: string;
  fillColor?: string;
  strokeWidth: number;
  isDashed?: boolean;
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  graphParams?: GraphFunctionParams;
}

export interface TextElement {
  id: string;
  type: 'text';
  x: number;
  y: number;
  content: string;
  latex?: string;     // Mã LaTeX nếu là công thức toán
  fontSize: number;
  color: string;
  isFormula?: boolean;
}

export interface ImageElement {
  id: string;
  type: 'image';
  x: number;
  y: number;
  width: number;
  height: number;
  dataUrl: string;
  rotation?: number;
}

export type BoardElement = StrokeElement | ShapeElement | TextElement | ImageElement;

export interface Page {
  id: string;
  title: string;
  elements: BoardElement[];
}

export interface BoardConfig {
  paperSize: PaperSize;
  background: BackgroundType;
  viewMode: ViewMode;
  zoom: number;
  isZoomLocked: boolean;
  buttonSize: 'compact' | 'normal' | 'large';
  touchMode: 'all' | 'stylus_only'; // khử chạm lòng bàn tay
}

export interface ToolbarDock {
  position: 'top' | 'bottom' | 'left' | 'right' | 'float';
  x: number;
  y: number;
  isCollapsed: boolean;
}
