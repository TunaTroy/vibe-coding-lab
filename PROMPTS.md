## 1.1.1 Validate Email - 16:00(PM)_2026/07/30
## 1.1.2 Version_01
Tạo file validators/emailValidator.js.
Yêu cầu:
- Export hàm isValidEmail(email: string): boolean
- Dùng regex chuẩn RFC 5322 rút gọn
- Viết kèm 5 test case trong file validators/emailValidator.test.js dùng Jest
- Không sửa bất kỳ file nào khác ngoài 2 file trên

## 1.2.1 Validate Email - 17:00(PM)_2026/07/30
## 1.2.2 Version_02 
## VÍ DỤ THỰC TẾ — Email Validator Module (áp dụng Master Prompt)
** YÊU CẦU
Xây dựng module validators/emailValidator.js hoàn chỉnh gồm 3 hàm:
1. isValidEmail(email) — kiểm tra định dạng email hợp lệ theo chuẩn RFC 5322
2. isDisposableEmail(email) — kiểm tra email có thuộc domain email tạm thời không
   (tối thiểu chặn: mailinator.com, tempmail.com, 10minutemail.com, guerrillamail.com,
   yopmail.com), không phân biệt hoa/thường
3. normalizeEmail(email) — chuẩn hoá email bằng cách trim khoảng trắng và
   chuyển về chữ thường
Cả 3 hàm phải xử lý đúng khi input không phải kiểu string (trả về false/rỗng,
không được throw lỗi crash chương trình).
** CONTEXT
- Đọc và tuân thủ TUYỆT ĐỐI file .github/copilot-instructions.md trước khi code
- File liên quan: validators/emailValidator.js (nếu đã tồn tại, đọc code cũ trước
  khi thêm hàm mới, không ghi đè logic đang hoạt động đúng)
- Test tương ứng đặt tại: validators/emailValidator.test.js
- Không sửa bất kỳ file nào ngoài 2 file trên
** QUY TRÌNH BẮT BUỘC (không được bỏ qua bước nào)
*** Bước 1 — PLAN
Trước khi code, trình bày:
- Danh sách hàm sẽ tạo mới/sửa đổi trong emailValidator.js
- Logic xử lý từng bước cho mỗi hàm (regex dùng cho isValidEmail, cách so khớp
  domain cho isDisposableEmail, cách xử lý whitespace/case cho normalizeEmail)
- Các edge case dự kiến sẽ gặp (input rỗng, input không phải string, domain viết hoa,
  email không có ký tự @)
KHÔNG code cho đến khi tôi xác nhận "OK, thực thi".
*** Bước 2 — ACT
Thực thi đúng PLAN đã duyệt. Mỗi hàm phải kèm tối thiểu 3 test case
(happy path / edge case / error case) ngay trong cùng lượt code.
*** Bước 3 — SELF-CHECK (BẮT BUỘC, tự làm không cần tôi nhắc)
1. Tự chạy: npx jest --coverage
2. Kiểm tra % Branch của TOÀN BỘ file validators/emailValidator.js (bao gồm cả
   code CŨ đã tồn tại trước đó, không chỉ phần vừa viết)
3. Nếu % Branch < 100% hoặc có Uncovered Line #s:
   - Tự xác định dòng đó là nhánh logic gì (thuộc hàm nào, if/else nào)
   - Tự viết thêm test case để phủ đủ nhánh đó
   - Chạy lại npx jest --coverage đến khi đạt 100% Branch
4. Kiểm tra chéo với checklist "3 bệnh cố hữu":
   - Test có hardcode kết quả mà chưa verify công thức tính toán không?
   - Có hardcode secret/credentials không? (không áp dụng cho module này)
   - Có vòng lặp gọi API/DB nhiều lần (N+1) không? (không áp dụng cho module này)
*** Bước 4 — BÁO CÁO
Chỉ báo "Hoàn thành" sau khi đạt 100% Branch coverage cho toàn bộ file. Báo cáo
dưới dạng bảng:
| Tiêu chí | Đạt/Không | Ghi chú |
|---|---|---|
| Đủ tối thiểu 3 test case/hàm (happy/edge/error)? | | |
| % Branch coverage = 100% (toàn bộ file, kể cả code cũ)? | | |
| Xử lý đúng input không phải string, không crash? | | |
| Không hardcode kết quả test chưa verify công thức? | | |


