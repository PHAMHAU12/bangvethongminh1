<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://ai.google.dev/static/site-assets/images/share-ais-513315318.png" />
</div>

# MATHEMATICS INTERACTIVE BOARD _ PHẠM HẬU

Bảng tương tác chuyên dụng cho giáo viên toán:
- **Viết tay nét thanh đậm, bút tô màu**: Hỗ trợ bút máy (fountain), bút tiêu chuẩn, bút dạ quang (highlighter) với độ mờ tùy chỉnh.
- **Vẽ nét đứt đoạn (- - -)**: Hỗ trợ vẽ nét đứt cho cả bút viết tay và các hình học (đường khuất hình không gian, đường gióng) với phím tắt nhanh `D` hoặc nút bật/tắt trên thanh công cụ.
- **Dựng hình học**: Đoạn thẳng, véc-tơ, tia, tam giác (thường, vuông, cân, đều), hình chữ nhật, hình vuông, đường tròn, elip, hình bình hành, hình thang.
- **Vẽ và khảo sát đồ thị hàm số Toán 12**:
  - **Hàm số bậc 3**: $y = ax^3 + bx^2 + cx + d$ (hiển thị tâm đối xứng $I$, điểm uốn, 2 cực trị, gióng toạ độ).
  - **Hàm số nhất biến (bậc 1 / bậc 1)**: $y = \frac{ax + b}{cx + d}$ (đường tiệm cận đứng, tiệm cận ngang nét đứt, tâm đối xứng $I$, 2 nhánh hypebol).
  - **Hàm số bậc 2 trên bậc 1**: $y = \frac{ax^2 + bx + c}{dx + e}$ (tiệm cận đứng, tiệm cận xiên, tâm đối xứng $I$, điểm cực trị).
- **Trợ lý AI Sư Phạm Toán Học (Google Gemini Multi-step Pipeline)**:
  - **Giải toán 3 bước chuẩn mực**: Bước 1: Phân tích giả thiết & định hướng tư duy ➔ Bước 2: Lời giải chi tiết với KaTeX ➔ Bước 3: Kết luận & cảnh báo bẫy sai lầm thường gặp.
  - **Sinh 3 bài toán tương tự**: Tự động tạo 3 bài toán cùng dạng theo ma trận phân hóa (Nhận biết/Thông hiểu - Vận dụng - Vận dụng cao) kèm đáp án.
  - **Chèn nhanh vào bảng**: Một cú click để đưa toàn bộ lời giải hoặc đề bài lên bảng vẽ.
  - **Cơ chế Fallback & Retry tự động 3 Model**: `gemini-3-flash-preview` ➔ `gemini-3-pro-preview` ➔ `gemini-2.5-flash` khi gặp lỗi hạn ngạch (429 RESOURCE_EXHAUSTED).
- **Quản lý API Key người dùng**: Nút **Settings (API Key)** nổi bật với tag đỏ *"Lấy API key để sử dụng app"*, lưu trữ an toàn trong `localStorage`, hướng dẫn chi tiết từ [Google AI Studio](https://aistudio.google.com/api-keys).
- **Bộ tiện ích tương tác Gamification lớp học**:
  - **Vòng quay may mắn (Lucky Wheel)**: Gọi tên ngẫu nhiên học sinh hoặc chia nhóm với hiệu ứng âm thanh và đồ họa sống động.
  - **Đồng hồ đếm ngược (Countdown Timer)**: Bấm giờ làm bài tập nhóm 1-15 phút có chuông báo hết giờ.
- **Dán ảnh bài toán từ Clipboard (Ctrl + V)**: Cắt nhanh đề bài từ trình duyệt hoặc tài liệu và dán thẳng lên bảng vẽ.
- **Đánh máy công thức toán LaTeX (KaTeX)**: Nhúng công thức toán học sắc nét.
- **Thước kẻ cm & thước đo góc ảo 360° (Protractor)**.
- **Xuất bản đa định dạng**:
  - Xuất bản file in **PDF (A4, A5, 16:9, v.v.)**
  - Xuất slide trình chiếu **PowerPoint (.pptx / HTML Slide Deck)**
  - Xuất kế hoạch bài dạy **Word (.doc / .docx)**
  - Xuất ảnh chất lượng cao **PNG**
  - Lưu và mở dự án **.emath**

---

## Cài đặt và Chạy cục bộ

**Yêu cầu:** Node.js (>= 18) hoặc Bun

1. Cài đặt các gói phụ thuộc:
   ```bash
   npm install
   # hoặc
   bun install
   ```

2. Khởi chạy ứng dụng phát triển:
   ```bash
   npm run dev
   # hoặc
   bun dev
   ```

3. Mở trình duyệt tại: `http://localhost:3000`

---

## Triển khai lên Vercel

Dự án đã được cấu hình tối ưu sẵn sàng deploy từ GitHub lên Vercel:
- `vercel.json` đã thiết lập SPA rewrites và Cache-Control cho assets.
- Người dùng chỉ cần truy cập ứng dụng và bấm vào nút **Settings (API Key)** để nhập mã Google Gemini cá nhân (hoàn toàn miễn phí) để kích hoạt toàn bộ tính năng AI.
