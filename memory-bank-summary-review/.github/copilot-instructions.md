## Memory Bank (ĐỌC TRƯỚC KHI LÀM BẤT KỲ VIỆC GÌ)
Trước khi thực hiện task, PHẢI đọc toàn bộ file trong thư mục memory-bank/
(architecture.md và progress.md) để nắm quyết định kiến trúc đã chốt và tiến độ
hiện tại. Tóm tắt ngắn gọn những gì vừa nạp được trước khi bắt đầu PLAN.

# Quy chuẩn kỹ thuật dự án — BẮT BUỘC TUÂN THỦ

## Ngôn ngữ & Framework
- Backend: Node.js + Express + TypeScript
- Testing: Jest
- Database: PostgreSQL, dùng Prisma ORM (KHÔNG viết raw SQL trừ khi bắt buộc)
- Frontend: React + TailwindCSS
## Quy tắc bảo mật (BẮT BUỘC)
- KHÔNG BAO GIỜ hardcode secret/credentials. Luôn dùng process.env.
- Mọi input từ user phải được validate bằng zod trước khi xử lý.
- Mọi query database phải dùng parameterized query hoặc ORM, cấm string concatenation.
## Quy tắc Testing (BẮT BUỘC)
- Mỗi hàm business logic mới phải có tối thiểu 3 test case:
 happy path, edge case, error case.
- KHÔNG được hardcode kết quả mong đợi nếu chưa verify công thức tính toán.
## Quy tắc hiệu năng
- Truy vấn liên quan (N+1) phải dùng eager loading/JOIN, không loop query.
## Self-Check bắt buộc (BẮT BUỘC LÀM SAU MỖI TASK VIẾT CODE MỚI)
Sau khi viết xong bất kỳ hàm/tính năng nào, PHẢI tự động thực hiện các bước sau
trước khi báo "Đã xong":

1. Tự chạy lệnh: `npx jest --coverage`
2. Đọc kết quả % Branch của file vừa sửa/tạo.
3. Nếu % Branch < 100 hoặc có "Uncovered Line #s":
   - Tự mở đúng những dòng đó, xác định đó là nhánh logic gì (if/else/error case nào).
   - Tự viết thêm test case còn thiếu để phủ đủ nhánh đó.
   - Chạy lại `npx jest --coverage` để xác nhận đã đạt 100% Branch.
4. CHỈ được báo cáo "Hoàn thành" sau khi % Branch = 100% cho TOÀN BỘ file bị ảnh hưởng
   (bao gồm cả các nhánh code cũ đã tồn tại trước đó, không chỉ code vừa viết mới).
5. Báo cáo kết quả cuối cùng dưới dạng bảng:

| Tiêu chí | Đạt/Không | Ghi chú |
|---|---|---|
| Đủ tối thiểu 3 test case (happy/edge/error)? | | |
| % Branch coverage của file = 100%? | | |
| Có hardcode secret/credentials không? | | |
| Có vòng lặp gọi API/DB nhiều lần (N+1) không? | | |


## Quy trình làm việc
- LUÔN trình bày PLAN trước khi sửa code, chờ tôi xác nhận rồi mới ACT.
- Không tự ý sửa file ngoài phạm vi được giao.