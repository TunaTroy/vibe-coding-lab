## Version_01
## AI Session Log
- **Ngày**: 2026-07-31
- **Người thực hiện**: Troy
- **Công cụ**: VS Code Agent (GitHub Copilot)
- **Module/File**: validators/passwordValidator.js

### Prompt gốc
"Tôi muốn thêm tính năng kiểm tra độ mạnh mật khẩu vào dự án, tạo hàm
checkPasswordStrength(password) trong file validators/passwordValidator.js.

TRƯỚC KHI CODE: hãy trình bày PLAN gồm:

Danh sách file sẽ tạo mới / sửa đổi
Logic xử lý từng bước
Format giá trị trả về
Các edge case cần lưu ý
Không code gì cho đến khi tôi xác nhận "OK, thực thi"."

### Output Plan
Dưới đây là kế hoạch trước khi thực thi, không có code nào được viết.

Danh sách file sẽ tạo mới / sửa đổi
Tạo mới: validators/passwordValidator.js
Chứa hàm checkPasswordStrength(password)
Tạo mới: validators/passwordValidator.test.js
Kiểm tra các trường hợp mạnh yếu, rỗng, không phải chuỗi, ký tự đặc biệt, độ dài tối thiểu, v.v.
Không sửa file hiện có nếu không cần thiết
Dự án hiện tại chỉ có validator riêng theo mô-đun, nên ưu tiên giữ cấu trúc hiện tại và không chạm vào các file khác trừ khi cần export bổ sung trong tương lai.
Logic xử lý từng bước
Bước 1: Validate đầu vào
Nếu password không phải kiểu string, trả về trạng thái “không hợp lệ” thay vì ném lỗi.
Nếu password rỗng hoặc chỉ có khoảng trắng, coi là invalid/weak.
Bước 2: Đánh giá độ dài
Đếm số ký tự của mật khẩu.
Gán điểm cộng cho các ngưỡng như: rất ngắn, ngắn, trung bình, dài, rất dài.
Bước 3: Kiểm tra các nhóm ký tự
Có chữ thường
Có chữ hoa
Có số
Có ký tự đặc biệt
Có thể áp thêm tiêu chí “không lặp quá nhiều” hoặc “không chứa khoảng trắng” nếu muốn chặt chẽ hơn.
Bước 4: Tính điểm tổng
Mỗi tiêu chí đạt được cộng điểm.
Mật khẩu mạnh khi đạt ngưỡng điểm và đáp ứng tối thiểu số nhóm ký tự.
Bước 5: Gán nhãn mức độ
weak / fair / good / strong / very strong
Hoặc nếu ưu tiên đơn giản hơn: weak / medium / strong
Bước 6: Trả về kết quả rõ ràng
Cung cấp cả điểm số và mô tả ngắn để UI có thể hiển thị, không chỉ true/false.
Bước 7: Test theo bộ case chuẩn
Mật khẩu yếu: “123456”, “abc”, “password”
Mật khẩu trung bình: “Abc123”
Mật khẩu mạnh: “Abc123!@#”
Mật khẩu rỗng / null / undefined / số / object
Format giá trị trả về
Đề xuất trả về object, ví dụ dạng:
score: 0-4 hoặc 0-100
label: "weak" | "medium" | "strong"
isStrong: true | false
checks:
length: true/false
uppercase: true/false
lowercase: true/false
number: true/false
symbol: true/false
message: "Mật khẩu yếu, nên thêm chữ hoa và ký tự đặc biệt"
Gợi ý format phù hợp với dự án hiện tại:
{
score: 3,
label: "strong",
isStrong: true,
checks: {
length: true,
uppercase: true,
lowercase: true,
number: true,
symbol: true
},
message: "Mật khẩu mạnh"
}
Tại sao dùng object:
Hữu ích cho UI/UX và test
Dễ hiển thị nhãn + điểm + thông điệp
Khác với boolean chỉ cho biết “đúng/sai” mà không mô tả vì sao
Các edge case cần lưu ý
password là null, undefined, number, boolean, array, object
chuỗi rỗng hoặc chỉ chứa khoảng trắng
mật khẩu quá ngắn hoặc quá dài
chỉ có chữ thường
chỉ có chữ hoa
chỉ có số
chỉ có ký tự đặc biệt
có khoảng trắng ở đầu/cuối
không có ký tự đặc biệt nhưng dài
trường hợp độ dài đủ nhưng thiếu nhiều nhóm ký tự
trường hợp mặc định nếu input không hợp lệ nên trả về object “invalid” thay vì crash
cần tránh regex quá chặt làm reject các mật khẩu hợp lệ thực tế
nếu sau này có yêu cầu “không cho phép mật khẩu phổ biến”, cần thêm blacklist ngoài logic hiện tại
Nếu bạn đồng ý, hãy gửi: OK, thực thi để mình bắt đầu triển khai.

### Review của người thực hiện
- [x] Đã đọc
- [x] Đã OK, thực thi

### Output Tóm tắt
Đã tạo 2 file:
- validators/passwordValidator.js — hàm checkPasswordStrength(password)
- validators/passwordValidator.test.js — 8 test case (2 file, 18 test tổng cộng
  tính cả emailValidator.js)

Format trả về (đã chốt theo yêu cầu, dùng 3 mức thay vì 5 mức):
{
  score: number,
  label: 'weak' | 'medium' | 'strong',
  isStrong: boolean,
  checks: {
    length: boolean,
    hasLowercase: boolean,
    hasUppercase: boolean,
    hasNumber: boolean,
    hasSymbol: boolean
  },
  message: string
}

Logic đánh nhãn:
- weak: thiếu độ dài hoặc chỉ đạt ít nhóm ký tự
- medium: đủ độ dài (>= 8) và đạt ít nhất 2 nhóm ký tự
- strong: đủ độ dài và đạt ít nhất 4 nhóm ký tự

Trong quá trình ACT, AI tự phát hiện lỗi: nhánh "strong" ban đầu chưa được kích hoạt
đúng logic khi chạy Self-Check coverage lần đầu. AI tự điều chỉnh lại ngưỡng phân loại
weak/medium/strong, chạy lại coverage cho đến khi đạt 100%, không cần tôi nhắc lại
(khác với lần làm emailValidator.js ở Module 5, lúc đó phải tôi tự phát hiện và
nhắc AI vá lỗ hổng coverage).

### Self-Check / Coverage
- Lệnh chạy: npx jest --coverage --runInBand
- Kết quả: 2 test suites passed, 18 tests passed
- Branch coverage: 100% cho toàn bộ project (emailValidator.js + passwordValidator.js)

### Review của người thực hiện
- [x] Đã đọc kỹ PLAN trước khi duyệt, yêu cầu chốt lại 2 điểm mơ hồ trước khi ACT:
      (1) chọn thang nhãn 3 mức thay vì 5 mức, (2) nhắc rõ yêu cầu Self-Check 100% Branch
- [x] Đã theo dõi AI tự sửa lỗi giữa chừng (nhánh "strong" chưa kích hoạt đúng),
      không phải chờ tôi phát hiện như lần trước
- [x] Đã tự chạy lại npx jest --coverage để verify độc lập, không chỉ tin báo cáo AI đưa
- [x] Đã đọc lướt code passwordValidator.js, xác nhận đúng logic (buildInvalidPasswordResult,
      trim(), check length === 0) khớp với báo cáo AI đưa ra
- [ ] Chưa áp dụng blacklist mật khẩu phổ biến (AI đã tự ghi chú là việc tiếp theo trong PLAN)
