# Tiến độ dự án

## Đã hoàn thành
- [x] Setup môi trường: VS Code, Node.js, Git
- [x] validators/emailValidator.js, passwordValidator.js, registrationValidator.js
      — 100% Branch coverage (dự án gốc vibe-coding-lab)
- [x] Module 6.2: Memory Bank, Module 7: Code Review, Module 8: Refactor,
      Module 9: MCP Filesystem Server
- [x] Module 12 — Backend fullstack-todo-app-jwt-authentication HOÀN THÀNH:
      - Prisma schema (User, Todo), PostgreSQL thật (database todo_app)
      - authController: register/login (bcrypt + JWT httpOnly cookie)
      - middleware requireAuth
      - todoController: CRUD đầy đủ, verify IDOR bằng Integration Test THẬT
        (không mock) tại repositoryIntegration.test.ts
      - routes (authRoutes, todoRoutes) test bằng Supertest
      - Coverage cuối: 9/9 test suites PASS, 51/51 tests PASS,
        96.84% Stmts, 100% Branch toàn bộ business logic
- [x] Khắc phục thành công sự cố đồng bộ đa máy (PC ↔ Laptop) do dùng zip/copy
      thủ công thay vì Git: worktree link hỏng, merge conflict, cấu trúc lồng sai,
      thiếu ts-jest, DB chưa sẵn sàng — xem chi tiết
      docs/ai-logs/2026-08-05-worktree-recovery-and-final-coverage.md
- [x] Dọn dẹp workspace root bằng AI Agent với ràng buộc tuyệt đối không đụng
      backend — archive các file/folder rác (logfile, memory-bank-summary-review*,
      package.json trùng ở root), cập nhật .gitignore, verify không gãy test

## Đang làm
- [ ] Chuẩn bị bắt đầu Frontend (React + TailwindCSS)

## Việc tiếp theo
- [ ] Frontend: React + TailwindCSS — trang đăng ký/đăng nhập/danh sách Todo
- [ ] Đổi JWT_SECRET sang chuỗi random an toàn (crypto.randomBytes) — hiện vẫn
      còn giá trị tạm "hai-chuyen-tau-dem"
- [ ] Cấu hình postgres MCP server với user quyền hạn chế (Least Privilege) —
      hoãn từ Module 9.4, giờ đã có DB thật nên đúng lúc áp dụng
- [ ] Vá nốt 2 dòng chưa coverage: app.ts dòng 17, errorHandler.ts dòng 12
      (mức độ ưu tiên thấp — không phải business logic bảo mật)
- [ ] Bảng tiêu chí tự đánh giá cuối Module 12

## Ghi chú kỹ thuật quan trọng (rút ra trong quá trình làm)
- Cloud Agent session của Copilot có thể tạo code trên branch/worktree Git riêng —
  luôn kiểm tra git branch -a nếu không thấy file mới sau khi AI báo "hoàn thành"
- File quy chuẩn (.md) chỉ đặt baseline, KHÔNG đảm bảo AI tự tuân thủ 100% — AI từng
  tự ý thêm --coverage=false để né Self-Check, phải tự phát hiện và chặn lại
- Coverage 100% ở tầng Controller KHÔNG đảm bảo bảo mật nếu chỉ mock Service —
  PHẢI có Integration Test thật (kết nối DB thật) ở tầng Repository để verify IDOR
  bị chặn đúng ở tầng query, không phải giả lập
- ⚠️ QUAN TRỌNG NHẤT: Git Worktree KHÔNG portable qua copy/zip thủ công giữa các
  máy — file .git bên trong worktree lưu đường dẫn tuyệt đối tới repo gốc, đổi máy
  sẽ hỏng liên kết. Từ nay LUÔN dùng git push/pull để đồng bộ đa máy, không zip/copy
- Luôn xác nhận ĐÚNG THƯ MỤC trước khi chạy lệnh test/npm — cấu trúc lồng sai
  (backend nằm sai cấp so với package.json/jest.config.js) gây lỗi khó hiểu mà
  không báo rõ nguyên nhân gốc ngay từ đầu