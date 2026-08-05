## Memory Bank (ĐỌC TRƯỚC KHI LÀM BẤT KỲ VIỆC GÌ)
Trước khi thực hiện task, PHẢI đọc toàn bộ file trong thư mục memory-bank/
(architecture.md và progress.md) để nắm quyết định kiến trúc đã chốt và tiến độ
hiện tại. Tóm tắt ngắn gọn những gì vừa nạp được trước khi bắt đầu PLAN.

---

# Quy chuẩn kỹ thuật dự án — BẮT BUỘC TUÂN THỦ
# Dự án: fullstack-todo-app-jwt-authentication (Module 12)

## Ngôn ngữ & Framework
- Backend: Node.js + Express + TypeScript
- Database: PostgreSQL (đã cài thật, database "todo_app"), dùng Prisma ORM
  (KHÔNG viết raw SQL trừ khi bắt buộc)
- Testing: Jest + Supertest cho integration test
- Frontend: React + TailwindCSS (chưa triển khai)
- Auth: JWT lưu trong httpOnly cookie, hash password bằng bcryptjs

## Quy tắc bảo mật (BẮT BUỘC)
- KHÔNG BAO GIỜ hardcode secret/credentials. Luôn dùng process.env (đã cấu hình
  DATABASE_URL, JWT_SECRET, PORT, NODE_ENV trong .env — file này bị .gitignore).
- Mọi input từ user phải được validate bằng zod trước khi xử lý.
- Mọi query database phải dùng parameterized query hoặc Prisma ORM, cấm string
  concatenation.
- BẮT BUỘC: mọi thao tác CRUD trên Todo phải lọc theo userId NGAY TRONG QUERY
  DATABASE (WHERE userId = ...), KHÔNG được chỉ lấy hết dữ liệu rồi check userId
  ở tầng code sau đó — đây là lỗi IDOR nghiêm trọng, tham khảo case study
  orderController trong tài liệu học Module 7.
- JWT_SECRET phải là chuỗi random đủ mạnh (dùng crypto.randomBytes), không dùng
  chuỗi dễ đoán kể cả ở môi trường dev.

## Quy tắc Testing (BẮT BUỘC)
- Mỗi hàm business logic mới phải có tối thiểu 3 test case:
  happy path, edge case, error case.
- KHÔNG được hardcode kết quả mong đợi nếu chưa verify công thức tính toán.
- Controller xử lý auth (authController) và ownership (todoController) là 2 file
  BẢO MẬT QUAN TRỌNG NHẤT — ưu tiên coverage 100% cho 2 file này trước các file khác.

## Quy tắc hiệu năng
- Truy vấn liên quan (N+1) phải dùng eager loading/JOIN (Prisma include), không
  loop query.

## Self-Check bắt buộc (BẮT BUỘC LÀM SAU MỖI TASK VIẾT CODE MỚI)
Sau khi viết xong bất kỳ hàm/tính năng nào, PHẢI tự động thực hiện các bước sau
trước khi báo "Đã xong":

1. Tự chạy lệnh: `npx jest --coverage`
   ⚠️ TUYỆT ĐỐI CẤM dùng cờ `--coverage=false` hoặc bất kỳ cách nào tắt coverage
   để né việc báo cáo số liệu thật — vi phạm nghiêm trọng quy chuẩn này.
2. Đọc kết quả % Branch của TOÀN BỘ file bị ảnh hưởng, không chỉ file vừa sửa.
3. Nếu % Branch < 100% hoặc có "Uncovered Line #s":
   - Tự mở đúng những dòng đó, xác định đó là nhánh logic gì (if/else/error case nào).
   - Tự viết thêm test case còn thiếu để phủ đủ nhánh đó.
   - Chạy lại `npx jest --coverage` để xác nhận đã đạt 100% Branch.
4. Kiểm tra KHÔNG có test suite nào bị FAIL (Test Suites: X failed phải bằng 0).
5. CHỈ được báo cáo "Hoàn thành" sau khi % Branch = 100% cho TOÀN BỘ file bị ảnh
   hưởng VÀ 0 test fail.
6. Báo cáo kết quả cuối cùng dưới dạng bảng:

| Tiêu chí | Đạt/Không | Ghi chú |
|---|---|---|
| Đủ tối thiểu 3 test case (happy/edge/error)? | | |
| % Branch coverage của file = 100%? | | |
| 0 test suite bị fail? | | |
| Có hardcode secret/credentials không? | | |
| Có vòng lặp gọi API/DB nhiều lần (N+1) không? | | |
| userId có lọc trong query DB (không chỉ check sau khi lấy dữ liệu)? | | |

## Quy trình làm việc
- LUÔN trình bày PLAN trước khi sửa code, chờ tôi xác nhận rồi mới ACT.
- Không tự ý sửa file ngoài phạm vi được giao.
- Nếu chạy dưới dạng Cloud Agent session (tạo isolated worktree/branch riêng), PHẢI
  báo rõ tên branch trong phần báo cáo để tôi biết cần merge thủ công.