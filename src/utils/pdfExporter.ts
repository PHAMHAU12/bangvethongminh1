/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import jsPDF from 'jspdf';
import { BackgroundType, Page, PaperSize } from '../types/emath';
import { CANVAS_DIMENSIONS, renderCanvasPage } from './canvasRenderer';

/**
 * Exports pages to a PDF document matching the exact paper size (A4 / A5 or custom)
 */
export async function exportToPdf(
  pages: Page[],
  paperSize: PaperSize,
  background: BackgroundType,
  fileName: string = 'BaiGiang_EMATH.pdf'
) {
  const dim = CANVAS_DIMENSIONS[paperSize];
  const isA4 = paperSize === 'A4';
  const isA5 = paperSize === 'A5';

  let format: string | [number, number] = 'a4';
  let orientation: 'p' | 'l' = 'p';

  if (isA4) {
    format = 'a4';
    orientation = 'p';
  } else if (isA5) {
    format = 'a5';
    orientation = 'p';
  } else {
    // Custom dimensions in mm
    const wMm = (dim.width * 25.4) / 96;
    const hMm = (dim.height * 25.4) / 96;
    format = [wMm, hMm];
    orientation = dim.width > dim.height ? 'l' : 'p';
  }

  const pdf = new jsPDF({
    orientation,
    unit: 'mm',
    format,
  });

  const pdfWidth = pdf.internal.pageSize.getWidth();
  const pdfHeight = pdf.internal.pageSize.getHeight();

  // Create an offscreen canvas for rendering high-res pages
  const offscreen = document.createElement('canvas');
  offscreen.width = dim.width;
  offscreen.height = dim.height;
  const offCtx = offscreen.getContext('2d');

  if (!offCtx) return;

  for (let i = 0; i < pages.length; i++) {
    if (i > 0) {
      pdf.addPage(format, orientation);
    }

    const page = pages[i];
    renderCanvasPage(offCtx, dim.width, dim.height, background, page.elements);

    const imgData = offscreen.toDataURL('image/jpeg', 0.95);
    pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight);
  }

  pdf.save(fileName);
}

/**
 * Exports the current page canvas to a high-resolution PNG
 */
export function exportToImage(
  page: Page,
  paperSize: PaperSize,
  background: BackgroundType,
  fileName: string = 'Trang_EMATH.png'
) {
  const dim = CANVAS_DIMENSIONS[paperSize];
  const offscreen = document.createElement('canvas');
  offscreen.width = dim.width;
  offscreen.height = dim.height;
  const offCtx = offscreen.getContext('2d');

  if (!offCtx) return;

  renderCanvasPage(offCtx, dim.width, dim.height, background, page.elements);

  const link = document.createElement('a');
  link.download = fileName;
  link.href = offscreen.toDataURL('image/png');
  link.click();
}
