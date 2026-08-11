# Tiến độ dự án

## Đã hoàn thành
- [x] Setup môi trường: VS Code, Node.js, Git
- [x] validators/emailValidator.js: isValidEmail(), isDisposableEmail(), normalizeEmail()
      — 100% Branch coverage
- [x] validators/passwordValidator.js: checkPasswordStrength() — 100% Branch coverage,
      làm theo đúng quy trình PLAN/ACT/REVIEW (Module 6.1)
- [x] Quy chuẩn kỹ thuật: .github/copilot-instructions.md (có Self-Check bắt buộc)
- [x] Ghi log AI đầy đủ tại docs/ai-logs/
- [x] Master Prompt tái sử dụng tại PROMPTS.md
- [x] Module 6.2: Memory Bank (memory-bank/architecture.md, progress.md) — verify
      thành công qua New Chat và qua máy PC mới, AI tóm tắt đúng ngữ cảnh dự án
- [x] Module 7: AI Code Review trên passwordValidator.js — không phát hiện
      Critical/Warning, chỉ 2 Suggestion nhỏ
- [x] Module 8: validators/registrationValidator.js — tạo code cố ý lỗi (spaghetti)
      rồi refactor dùng lại isValidEmail() + checkPasswordStrength(), tách side-effect
      (sendWelcomeEmail/logAudit) khỏi validator — 100% Branch coverage
- [x] Test chuyển máy PC thành công (clone repo, npm install, tạo lại .env,
      Memory Bank hoạt động đúng trên máy mới)
- [x] Module 9: MCP Filesystem Server cấu hình qua .vscode/mcp.json (khác sách —
      VS Code Copilot dùng key "servers" thay vì "mcpServers"), verify qua Output
      panel (14 tools, Running) và test thực tế liệt kê file qua MCP tool
- [x] Module 9.4: MCP Postgres Server với user mcp_readonly (Least Privilege) —
      cấu hình 2026-08-05, VERIFY THỰC TẾ hoàn tất 2026-08-09: thử DELETE FROM
      public.users qua pgAdmin bằng user mcp_readonly, xác nhận bị chặn
      (permission denied) — bảo mật hoạt động đúng thiết kế, không chỉ đúng lý
      thuyết cấu hình
- [x] MODULE 12 — HOÀN THÀNH ĐẦY ĐỦ (2026-08-09):
      - Backend fullstack-todo-app-jwt-authentication: Prisma schema (User, Todo),
        authController (bcrypt + JWT httpOnly cookie), middleware requireAuth,
        todoController CRUD với IDOR protection có Integration Test thật (không
        mock, dùng DB thật) — 9/9 test suites PASS, 51/51 tests PASS, 100% Branch
        coverage toàn bộ business logic
      - Frontend: React + Vite + TailwindCSS, cấu trúc đúng chuẩn
        (components/reusable, components/todos, pages, hooks, services), chạy ổn
        định tại localhost:5173/5174, kết nối Backend đúng bằng cookie httpOnly
        (không dùng Bearer Token)
      - Test E2E qua UI thật: Register → Login → CRUD Todo → Logout hoạt động đúng
      - Đối chiếu bảng tiêu chí tự đánh giá cuối Module 12 trong sách: đạt đủ 8/8
        tiêu chí
- [x] Xử lý thành công sự cố đồng bộ đa máy (PC ↔ Laptop) do zip/copy thủ công
      thay vì Git: worktree link hỏng, merge conflict, cấu trúc lồng sai, thiếu
      ts-jest, DB chưa sẵn sàng trên máy mới
- [x] Xử lý thành công sự cố worktree lồng 3 cấp do nhiều Cloud Agent session liên
      tiếp — dùng Devin CLI phân tích read-only, xác nhận code tốt nhất đã có sẵn
      trong master, dọn sạch toàn bộ worktree/branch thừa, restart máy giải quyết
      lỗi file lock không xác định được process

## Đang làm
- [ ] Chưa có việc đang làm — Module 12 đã khép lại đầy đủ, cuốn sách "Từ Zero Đến
      Vibe Coding" đã hoàn thành trọn vẹn 12/12 module

## Việc tiếp theo (tuỳ chọn, không bắt buộc, mở rộng thêm nếu muốn)
- [ ] Thêm blacklist mật khẩu phổ biến vào passwordValidator
- [ ] Module 10: Git Worktree, tmux — đã trải nghiệm thực tế qua sự cố worktree
      lồng nhau, có thể học lại lý thuyết chính thức nếu muốn hệ thống hoá kiến thức
- [ ] Module 11: Background Agents — đã dùng thử Devin để phân tích worktree,
      có thể khám phá thêm Cursor/Windsurf nếu muốn
- [ ] Dọn 2 thư mục rác còn sót: memory-bank-summary-review/,
      memory-bank-summary-review.worktrees/
- [ ] Deploy thử ứng dụng lên môi trường thật (Vercel/Railway/Render) — mở rộng
      ngoài phạm vi sách nếu muốn có sản phẩm thật để chia sẻ

## Ghi chú kỹ thuật quan trọng (rút ra trong quá trình làm)
- Cloud Agent session của Copilot có thể tạo code trên branch/worktree Git riêng
  (không ghi trực tiếp vào thư mục làm việc) — cần kiểm tra git branch -a /
  git worktree list NGAY sau mỗi lần AI báo "hoàn thành", xử lý (merge hoặc xoá)
  ngay lập tức, không để dồn nhiều worktree lồng nhau qua nhiều phiên
- File quy chuẩn (.md) chỉ đặt baseline, không đảm bảo AI tự tuân thủ 100% — vẫn cần
  con người verify bằng công cụ khách quan (npx jest --coverage), không tin báo cáo
  text của AI
- MCP server chỉ nên cấu hình khi thực sự có hệ thống/dữ liệu thật để kết nối — tránh
  set up giả (ví dụ database chưa tồn tại) chỉ để "cho có", không mang lại giá trị
  thực hành thật
- Coverage 100% ở tầng Controller KHÔNG đảm bảo bảo mật nếu chỉ mock Service — cần
  Integration Test thật (kết nối DB thật) ở tầng Repository để verify IDOR bị chặn
  đúng ở tầng query
- Cấu hình GRANT/REVOKE cho MCP đúng về mặt lý thuyết SQL vẫn cần được verify bằng
  thao tác thật (thử chạy đúng lệnh bị cấm và xác nhận bị từ chối), không chỉ tin
  câu lệnh đã chạy thành công là đủ
- Lỗi "Permission denied"/file lock khi xoá thư mục worktree trên Windows: nếu công
  cụ như handle64.exe không tìm ra process cụ thể, restart máy là giải pháp nhanh
  và đáng tin cậy nhất, không cần cố xoay xở thêm
- Git Worktree KHÔNG portable qua copy/zip thủ công giữa các máy — file .git bên
  trong worktree lưu đường dẫn tuyệt đối tới repo gốc, đổi máy sẽ hỏng liên kết.
  Luôn dùng git push/pull để đồng bộ đa máy, không zip/copy thủ công

  ## PIVOT LỚN (2026-08-10): Todo App → Kid English Quiz App
- Dự án chuyển hướng từ Todo App sang "Kid English Quiz App" (ứng dụng luyện tiếng
  Anh gamification cho trẻ em trong gia đình), theo roadmap 6 Phase.
- QUYẾT ĐỊNH KIẾN TRÚC QUAN TRỌNG: GIỮ NGUYÊN PostgreSQL + Prisma (đã có 100%
  Branch coverage, đã test kỹ) — KHÔNG chuyển sang MongoDB/Mongoose dù roadmap gốc
  viết theo MongoDB. Mọi model mới (Question, QuizAttempt, CoinTransaction, Reward,
  RedemptionRequest) phải viết bằng Prisma schema, không phải Mongoose schema.
- QUYẾT ĐỊNH KIẾN TRÚC QUAN TRỌNG: GIỮ NGUYÊN hạ tầng Auth hiện có (bcrypt hash
  password + JWT lưu trong httpOnly cookie) — không viết lại từ đầu. Chỉ MỞ RỘNG
  bằng cách thêm field `role` vào model User.
- Nguyên tắc bất biến từ roadmap (BẮT BUỘC tuân thủ khi code Phase 3 trở đi):
  - Client tuyệt đối không tự gửi score/coinAwarded — Backend luôn tự tính lại
  - CoinTransaction là append-only ledger — không xoá/sửa, chỉ tạo giao dịch mới
  - Mọi thao tác ảnh hưởng Coin phải chạy trong 1 database transaction
  - correctAnswer không bao giờ trả về cho Student trong response API
  - Idempotency: 1 QuizAttempt chỉ được tính điểm/cộng Coin đúng 1 lần
- Thứ tự triển khai bắt buộc theo roadmap: Phase 1 (Authorization) → Phase 2 (Data
  Model) → Phase 3 (Core Quiz API) → Phase 4 (Streak) → Phase 5 (Leaderboard/Shop)
  → Phase 6 (Admin Panel & Polish)
- Roadmap gốc: xem file Kid_English_Quiz_App_Roadmap.pdf đã upload (hoặc lưu vào
  docs/ nếu muốn tham chiếu lâu dài)