# Tiến độ dự án

## Đã hoàn thành
- [x] Setup môi trường: VS Code, Node.js, Git
- [x] validators/emailValidator.js, passwordValidator.js — 100% Branch coverage
- [x] Quy chuẩn kỹ thuật: .github/copilot-instructions.md (có Self-Check bắt buộc)
- [x] Ghi log AI đầy đủ tại docs/ai-logs/
- [x] Master Prompt + Refactor Prompt tái sử dụng tại PROMPTS.md
- [x] Module 6.2: Memory Bank — verify thành công qua New Chat và qua máy PC mới
- [x] Module 7: AI Code Review trên passwordValidator.js
- [x] Module 8: validators/registrationValidator.js — refactor từ spaghetti code,
      dùng lại emailValidator/passwordValidator — 100% Branch coverage
- [x] Module 9: MCP Filesystem Server cấu hình qua .vscode/mcp.json — verify thành
      công (14 tools, Running)
- [x] Module 10-11 (Git Worktree/tmux, Background Agents): TẠM BỎ QUA lý thuyết,
      nhảy thẳng sang Module 12 — nhưng đã VÔ TÌNH áp dụng thực tế Git Worktree khi
      Cloud Agent tự tạo thư mục vibe-coding-lab.worktrees/ cho dự án con
      fullstack-todo-app-jwt-authentication
- [x] Module 12 — Backend scaffold: Express + TypeScript + Prisma
- [x] Module 12 — PostgreSQL cài đặt thật, database todo_app tạo thành công,
      migration 20260805000000_init đã áp dụng, Prisma Client generated
- [x] Module 12 — Prisma schema (User, Todo với quan hệ userId)
- [x] Module 12 — authController: register/login dùng bcrypt + JWT (cookie httpOnly)
- [x] Module 12 — middleware requireAuth: đọc JWT từ cookie, verify, gắn req.user
- [x] Module 12 — todoController: CRUD có kiểm tra userId (cần verify lại độ chắc
      chắn của IDOR check — xem mục "Đang làm")

## Đang làm
- [ ] SỰ CỐ PHÁT HIỆN: lần đầu AI báo "7 test suites passed, 30/30 tests passed" khi
      chạy `npx jest --coverage=false` — SAI QUY TRÌNH (tắt coverage, vi phạm
      Self-Check bắt buộc). Chạy lại đúng `npx jest --coverage` phát hiện:
      1. Test THẤT BẠI thật: src/tests/env.test.ts — env.ts không throw lỗi
         "DATABASE_URL is required" khi thiếu biến môi trường như mong đợi
      2. Coverage chỉ đạt 61.57% toàn project (yêu cầu 100%), đặc biệt thấp ở
         2 file bảo mật quan trọng nhất: todoController.ts (60% Branch),
         authController.ts (50% Branch) — CẦN ưu tiên vá trước khi tin tưởng
         logic ownership/IDOR đã đúng
- [ ] Đang sửa src/config/env.ts theo đúng PLAN/ACT/REVIEW, sau đó vá coverage cho
      todoController.ts và authController.ts

## Việc tiếp theo
- [ ] Sau khi backend đạt 100% Branch coverage + 0 test fail: Code Review bảo mật
      riêng cho todoController/authController (kiểm tra IDOR — userId có lọc thật
      trong query DB, không chỉ check ở tầng code sau khi lấy hết dữ liệu)
- [ ] Đổi JWT_SECRET từ "hai-chuyen-tau-dem" sang chuỗi random thật (dùng
      crypto.randomBytes) — hiện tại chỉ tạm chấp nhận vì đang ở môi trường dev/local
- [ ] Thêm postgres MCP server vào .vscode/mcp.json (đã có DB thật, đúng lúc áp dụng
      Module 9.3/9.4 đã hoãn) — dùng user quyền hạn chế (Least Privilege), không
      dùng superuser postgres
- [ ] Frontend: React + TailwindCSS (chưa bắt đầu)
- [ ] Bảng tiêu chí tự đánh giá cuối Module 12

## Ghi chú kỹ thuật quan trọng (rút ra trong quá trình làm)
- Cloud Agent session của Copilot có thể tạo code trên branch/worktree Git riêng —
  cần kiểm tra git branch -a nếu không thấy file mới sau khi AI báo "hoàn thành"
- File quy chuẩn (.md) chỉ đặt baseline, KHÔNG đảm bảo AI tự tuân thủ 100% — điển
  hình: AI tự ý thêm cờ --coverage=false để né yêu cầu Self-Check, phải tự phát hiện
  và yêu cầu chạy lại đúng cách
- Luôn tự chạy lại lệnh verify (npx jest --coverage) độc lập, không tin số liệu AI
  tự báo cáo trong text
- MCP server chỉ nên cấu hình khi thực sự có hệ thống/dữ liệu thật để kết nối
- Dự án fullstack-todo-app-jwt-authentication nằm trong Git Worktree riêng
  (backend/vibe-coding-lab.worktrees/) — tách biệt với repo gốc vibe-coding-lab