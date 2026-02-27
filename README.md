# HistoryLens

Web app mobile first giúp chụp ảnh bài học Lịch sử, OCR bằng Tesseract.js và gửi văn bản tới LLM (OpenAI hoặc Gemini) để tạo khung kiến thức, mindmap, câu hỏi vì sao và mini test.

## Yêu cầu

- Node.js 18+
- Các khóa ENV:
  - `AUTH_USERNAME`, `AUTH_PASSWORD`
  - `JWT_SECRET`
  - `LLM_PROVIDER` (openai|gemini)
  - `OPENAI_API_KEY`, `OPENAI_MODEL` (ví dụ gpt-4o-mini)
  - `GEMINI_API_KEY`, `GEMINI_MODEL`
  - tùy chọn `TESSDATA_PREFIX` nếu muốn chỉ định thư mục dữ liệu ngôn ngữ cho Tesseract

## Cài đặt

```bash
npm install
cp .env.example .env.local
# chỉnh sửa giá trị ENV phù hợp
npm run dev
```

Ứng dụng chạy tại http://localhost:3000.

## Kiến trúc nhanh

- Next.js 14 App Router, TypeScript, TailwindCSS, shadcn/ui.
- Auth: một tài khoản duy nhất, JWT lưu httpOnly cookie. Routes `/api/analyze` và `/api/grade` được middleware bảo vệ.
- OCR: Tesseract.js chạy server side.
- LLM: chọn OpenAI hoặc Gemini qua ENV, đáp ứng JSON đúng schema và validate bằng zod.
- Frontend: hai trang
  - `/` Landing với CTA
  - `/app` gồm login, camera/upload, preview, phân tích và hiển thị kết quả (khung kiến thức, mindmap React Flow, câu hỏi vì sao với chấm nhanh, mini test với chấm trắc nghiệm client và chấm tự luận server).

## Lệnh hữu ích

- `npm run dev` chạy dev server
- `npm run build` build production
- `npm run start` chạy build
- `npm run lint` kiểm tra lint

## Lưu ý triển khai

- Giới hạn upload 6MB, chỉ nhận JPEG/PNG.
- Nếu LLM trả sai schema, backend trả lỗi rõ ràng.
- Nút “Tải ảnh khác” để reset phiên làm việc.
