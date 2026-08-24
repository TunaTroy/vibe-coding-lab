# Kiến trúc hệ thống — Vibe Coding Lab

## Quyết định đã chốt
- Backend: Node.js thuần (JavaScript, CommonJS module.exports) — đã dùng TypeScript
- Testing: Jest, bắt buộc đạt 100% Branch coverage cho mỗi file business logic
- Công cụ AI chính: VS Code Agent (GitHub Copilot) — quy chuẩn tại
  .github/copilot-instructions.md
- Quy trình bắt buộc: PLAN → ACT → SELF-CHECK (coverage) → REVIEW độc lập → BÁO CÁO
- Format trả về cho các hàm validator dạng "đánh giá" (không chỉ true/false):
  trả về object có {score/label/isStrong/checks/message} — tham khảo passwordValidator.js
- Password strength dùng thang 3 mức: weak / medium / strong

## Đã KHÔNG chọn (và lý do)
- Không dùng Claude Code làm công cụ chính (ban đầu định theo sách) vì chưa có Claude
  Pro — thay bằng VS Code Agent (Copilot)
- Không commit thư mục coverage/ vào Git — là báo cáo tự sinh, đã thêm vào .gitignore
- Chưa thêm blacklist mật khẩu phổ biến cho passwordValidator — để lại việc sau

## Ghi chú kỹ thuật hoãn lại (áp dụng khi cần)
- Module 9.3 (Custom MCP Server): khi tích hợp hệ thống ngoài thật (ví dụ Postgres ở
  Module 12), có thể tự viết MCP Server riêng bằng Node.js SDK
  (@modelcontextprotocol/sdk) nếu server có sẵn không đủ tuỳ biến.
- Module 9.4 (Phân quyền MCP): khi có Postgres thật, PHẢI tạo user riêng cho MCP với
  quyền tối thiểu (chỉ SELECT), không dùng superuser — tránh AI vô tình chạy lệnh
  DROP/DELETE nguy hiểm khi hiểu sai yêu cầu.