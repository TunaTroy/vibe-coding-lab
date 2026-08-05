# Kiến trúc hệ thống — Vibe Coding Lab / fullstack-todo-app-jwt-authentication

## Quyết định đã chốt (chung cho toàn dự án vibe-coding-lab)
- Công cụ AI chính: VS Code Agent (GitHub Copilot) — quy chuẩn tại
  .github/copilot-instructions.md
- Quy trình bắt buộc: PLAN → ACT → SELF-CHECK (coverage) → REVIEW độc lập → BÁO CÁO
- Testing: Jest, bắt buộc đạt 100% Branch coverage cho mỗi file business logic
- TUYỆT ĐỐI CẤM dùng cờ tắt coverage (--coverage=false) để né Self-Check

## Quyết định đã chốt (riêng cho Module 12 — fullstack-todo-app-jwt-authentication)
- Backend: Node.js + Express + TypeScript + Prisma + PostgreSQL
- Database: PostgreSQL v18.4 cài thật trên máy local, database tên "todo_app"
- Prisma schema: model User và Todo, quan hệ userId (Todo thuộc về 1 User)
- Auth: JWT lưu trong httpOnly cookie (KHÔNG dùng localStorage — tránh XSS),
  hash password bằng bcryptjs
- Cấu trúc thư mục Backend: controllers/ services/ repositories/ middleware/
  validators/ config/ (Clean Architecture nhiều lớp)
- Ownership check (chống IDOR): userId PHẢI được lọc ngay trong query Prisma
  (WHERE userId = ...), không được lấy hết dữ liệu rồi check ở tầng code sau
- Dự án nằm trong Git Worktree riêng: backend/vibe-coding-lab.worktrees/
  fullstack-todo-app-jwt-authentication/ — tách biệt khỏi repo gốc vibe-coding-lab
  (phát sinh tự nhiên từ Cloud Agent session, chưa học chính thức Module 10 nhưng
  đã áp dụng thực tế)

## Quyết định đã chốt (kế thừa từ Module 1-9, áp dụng cho validators/)
- Format trả về cho các hàm validator dạng "đánh giá" (không chỉ true/false):
  trả về object có {score/label/isStrong/checks/message} — tham khảo passwordValidator.js
- Password strength dùng thang 3 mức: weak / medium / strong

## Đã KHÔNG chọn (và lý do)
- Không dùng Claude Code làm công cụ chính (ban đầu định theo sách) vì chưa có Claude
  Pro — thay bằng VS Code Agent (Copilot)
- Không commit thư mục coverage/ vào Git — là báo cáo tự sinh, đã thêm vào .gitignore
- Không dùng MongoDB cho Todo App vì dữ liệu quan hệ (User - Todo) phù hợp SQL hơn
- Không dùng session-based auth cho Todo App vì JWT stateless dễ scale hơn
- Chưa thêm blacklist mật khẩu phổ biến cho passwordValidator — để lại việc sau
- Chưa học chính thức Module 10-11 (Git Worktree/tmux, Background Agents) — nhảy
  thẳng từ Module 9 sang Module 12 theo quyết định của người học, quay lại sau nếu cần

## Ghi chú kỹ thuật hoãn lại (áp dụng khi cần)
- Module 9.3 (Custom MCP Server): có thể tự viết MCP Server riêng bằng Node.js SDK
  (@modelcontextprotocol/sdk) nếu cần tích hợp hệ thống ngoài chưa có server sẵn
- Module 9.4 (Phân quyền MCP cho Postgres — ĐÃ CÓ DATABASE THẬT, CẦN LÀM SỚM):
  phải tạo user riêng cho MCP với quyền tối thiểu (chỉ SELECT), không dùng
  superuser "postgres" hiện đang cấu hình trong DATABASE_URL — tránh AI vô tình
  chạy lệnh DROP/DELETE nguy hiểm khi hiểu sai yêu cầu

## Sự cố đã xử lý (bài học thực tế)
- AI từng báo cáo "30/30 tests passed" nhưng thực chất chạy với --coverage=false,
  che giấu 1 test FAIL thật (env.test.ts) và coverage thực tế chỉ 61.57% — bài học:
  luôn tự chạy lại lệnh verify độc lập, không tin số liệu AI tự báo cáo trong text