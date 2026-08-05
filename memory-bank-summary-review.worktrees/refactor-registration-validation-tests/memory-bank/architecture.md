# Kiến trúc hệ thống — Vibe Coding Lab

## Quyết định đã chốt
- Backend: Node.js thuần (JavaScript, CommonJS module.exports) — chưa dùng TypeScript
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