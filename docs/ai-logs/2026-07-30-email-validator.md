## AI Session Log
- **Ngày**: 2026-07-30
- **Người thực hiện**: Troy
- **Công cụ**: VS Code Agent (GitHub Copilot)
- **Module/File**: validators/emailValidator.js

### Prompt gốc
"Tạo file validators/emailValidator.js với hàm isValidEmail kiểm tra định dạng email hợp lệ,
kèm 5 test case trong file validators/emailValidator.test.js dùng Jest"

### Output tóm tắt
AI tạo hàm isValidEmail() dùng regex chuẩn RFC 5322, export qua module.exports.
Kèm 5 test case: email chuẩn, email có quoted local-part, thiếu @, domain sai, ký tự lạ.

### Review của người thực hiện
- [x] Đã đọc và hiểu logic regex
- [x] Đã chạy npx jest — 5/5 test PASS
- [ ] Chưa kiểm tra hiệu năng với chuỗi email cực dài (việc tiếp theo)