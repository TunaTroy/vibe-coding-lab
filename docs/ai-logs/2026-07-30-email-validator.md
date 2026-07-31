## Version_01
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
- [x] Tạo 1 file PROMTS.md ở cấp độ dự án với mục đích lưu trữ các Promt hữu ích, có giá trị sử dụng mang tính lặp đi lặp lại tại dự án.


## Version_02
## AI Session Log
- **Ngày**: 2026-07-30
- **Người thực hiện**: Troy
- **Công cụ**: VS Code Agent (GitHub Copilot)
- **Module/File**: validators/emailValidator.js, .github/copilot-instructions.md

### Prompt gốc
1. "Trong file validators/emailValidator.js, thêm hàm mới isDisposableEmail(email)
   kiểm tra domain email tạm thời (mailinator.com, tempmail.com, 10minutemail.com)."
2. "Bổ sung test case cho domain viết hoa, và input không phải string."
3. "Thêm hàm normalizeEmail(email) chuẩn hoá email (trim, lowercase)."
4. "File emailValidator.js thiếu coverage ở dòng 5, 25 (lỗ hổng cũ). Viết thêm test
   để đạt 100% Branch coverage cho toàn bộ file."

### Output tóm tắt
- Thêm hàm isDisposableEmail() kiểm tra domain email tạm thời.
- Thêm hàm normalizeEmail() chuẩn hoá email.
- Bổ sung copilot-instructions.md với mục "Self-Check bắt buộc" (yêu cầu AI tự chạy
  npx jest --coverage và đạt 100% Branch trước khi báo hoàn thành).
- Tổng số test tăng từ 5 → 13 test case.

### Review của người thực hiện
- [x] Đã chạy npx jest --coverage — đạt 100% Stmts/Branch/Funcs/Lines
- [x] Phát hiện AI ban đầu chỉ tự-check code MỚI viết, bỏ sót lỗ hổng coverage cũ
      → đã nhắc lại rõ ràng để AI quét toàn bộ file, không chỉ phần mới
- [x] Xác nhận: file quy chuẩn (.md) đặt baseline, nhưng prompt cụ thể mới là yếu tố
      quyết định AI thực sự sửa đúng — bài học rút ra ở Module 5
- [ ] Chưa áp dụng disposable email check vào flow đăng ký thực tế (sẽ làm ở module sau)