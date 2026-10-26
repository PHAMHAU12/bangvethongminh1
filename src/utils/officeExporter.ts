/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Page, PaperSize, BackgroundType } from '../types/emath';
import { CANVAS_DIMENSIONS, renderCanvasPage } from './canvasRenderer';

/**
 * Capture a page canvas to a high-resolution PNG data URL
 */
function capturePageDataUrl(page: Page, paperSize: PaperSize, background: BackgroundType): string {
  const dim = CANVAS_DIMENSIONS[paperSize];
  const offscreen = document.createElement('canvas');
  offscreen.width = dim.width;
  offscreen.height = dim.height;
  const ctx = offscreen.getContext('2d');
  if (ctx) {
    renderCanvasPage(ctx, dim.width, dim.height, page.elements, background, false);
  }
  return offscreen.toDataURL('image/png');
}

/**
 * Export lesson pages to a Word (.doc / .docx compatible) document
 * Embedded with high-resolution page captures, lesson notes, and formatted sections.
 */
export function exportToWordDocument(
  pages: Page[],
  paperSize: PaperSize,
  background: BackgroundType,
  filename = 'BaiGiang_ToanHoc.doc'
): void {
  const images = pages.map((p) => ({
    title: p.title || 'Trang Bài Giảng',
    dataUrl: capturePageDataUrl(p, paperSize, background),
    elementsCount: p.elements.length,
  }));

  const htmlContent = `
    <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
    <head>
      <meta charset='utf-8'>
      <title>Bài Giảng Toán Học - Mathematics Interactive Board</title>
      <!--[if gte mso 9]>
      <xml>
        <w:WordDocument>
          <w:View>Print</w:View>
          <w:Zoom>100</w:Zoom>
          <w:DoNotOptimizeForBrowser/>
        </w:WordDocument>
      </xml>
      <![endif]-->
      <style>
        body { font-family: 'Times New Roman', serif; font-size: 14pt; margin: 20mm; color: #111; }
        h1 { text-align: center; color: #1e3a8a; font-size: 20pt; margin-bottom: 5px; }
        .subtitle { text-align: center; font-style: italic; color: #64748b; font-size: 11pt; margin-bottom: 25px; }
        .page-box { margin-bottom: 30px; page-break-after: always; }
        .page-title { font-size: 16pt; font-weight: bold; color: #0f172a; border-bottom: 2px solid #3b82f6; padding-bottom: 4px; margin-top: 15px; }
        .canvas-img { width: 100%; max-width: 700px; height: auto; border: 1px solid #cbd5e1; border-radius: 4px; margin: 12px 0; }
        .meta { font-size: 10pt; color: #64748b; margin-top: 4px; }
      </style>
    </head>
    <body>
      <h1>KẾ HOẠCH BÀI DẠY TOÁN HỌC</h1>
      <div class="subtitle">Xuất từ Bảng Tương Tác Toán Học _ Phạm Hậu | Ngày xuất: ${new Date().toLocaleDateString('vi-VN')}</div>
      ${images
        .map(
          (img, idx) => `
        <div class="page-box">
          <div class="page-title">Trang ${idx + 1}: ${img.title}</div>
          <p class="meta">Tổng số đối tượng đồ thị & ghi chú: ${img.elementsCount}</p>
          <img class="canvas-img" src="${img.dataUrl}" alt="Nội dung trang ${idx + 1}" />
        </div>
      `
        )
        .join('')}
    </body>
    </html>
  `;

  const blob = new Blob(['\ufeff', htmlContent], {
    type: 'application/msword;charset=utf-8',
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Export lesson pages to a presentation slide deck (PowerPoint / Presentation HTML)
 * Teachers can open directly or import into Microsoft PowerPoint / Google Slides with 16:9 full HD layout.
 */
export function exportToPowerPointSlideDeck(
  pages: Page[],
  paperSize: PaperSize,
  background: BackgroundType,
  filename = 'BaiGiang_Slides.html'
): void {
  const images = pages.map((p) => ({
    title: p.title || 'Trang Bài Giảng',
    dataUrl: capturePageDataUrl(p, paperSize, background),
  }));

  const presentationHtml = `<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8">
  <title>Bài Giảng Toán Học - Slide Trình Chiếu</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { background: #0f172a; font-family: 'Plus Jakarta Sans', sans-serif; overflow: hidden; display: flex; flex-direction: column; height: 100vh; }
    .slide-viewer { flex: 1; display: flex; align-items: center; justify-content: center; padding: 15px; position: relative; }
    .slide-img { max-width: 95vw; max-height: 85vh; border-radius: 8px; box-shadow: 0 20px 40px rgba(0,0,0,0.6); border: 1px solid #334155; }
    .controls { height: 60px; background: #1e293b; display: flex; align-items: center; justify-content: space-between; padding: 0 30px; color: #f8fafc; border-top: 1px solid #334155; }
    button { background: #3b82f6; color: white; border: none; padding: 8px 18px; border-radius: 6px; font-weight: bold; cursor: pointer; }
    button:hover { background: #2563eb; }
    button:disabled { opacity: 0.4; cursor: not-allowed; }
    .title { font-size: 15px; font-weight: 600; color: #94a3b8; }
    .counter { font-family: monospace; font-size: 16px; font-weight: bold; color: #f59e0b; }
  </style>
</head>
<body>
  <div class="slide-viewer">
    <img id="currentSlide" class="slide-img" src="${images[0]?.dataUrl || ''}" alt="Slide">
  </div>
  <div class="controls">
    <div class="title" id="slideTitle">Trang 1: ${images[0]?.title || ''}</div>
    <div class="counter" id="slideCounter">1 / ${images.length}</div>
    <div style="display: flex; gap: 10px;">
      <button id="prevBtn" onclick="prevSlide()">❮ Slide Trước</button>
      <button id="nextBtn" onclick="nextSlide()">Slide Tiếp ❯</button>
    </div>
  </div>
  <script>
    const slides = ${JSON.stringify(images)};
    let currentIndex = 0;
    const imgEl = document.getElementById('currentSlide');
    const titleEl = document.getElementById('slideTitle');
    const counterEl = document.getElementById('slideCounter');
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');

    function updateView() {
      imgEl.src = slides[currentIndex].dataUrl;
      titleEl.innerText = 'Trang ' + (currentIndex + 1) + ': ' + slides[currentIndex].title;
      counterEl.innerText = (currentIndex + 1) + ' / ' + slides.length;
      prevBtn.disabled = currentIndex === 0;
      nextBtn.disabled = currentIndex === slides.length - 1;
    }

    function prevSlide() {
      if (currentIndex > 0) { currentIndex--; updateView(); }
    }
    function nextSlide() {
      if (currentIndex < slides.length - 1) { currentIndex++; updateView(); }
    }

    window.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowLeft' || e.key === 'PageUp') prevSlide();
      if (e.key === 'ArrowRight' || e.key === 'PageDown' || e.key === ' ') nextSlide();
    });
    updateView();
  </script>
</body>
</html>`;

  const blob = new Blob([presentationHtml], { type: 'text/html;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
