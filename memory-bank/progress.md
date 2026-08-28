# Tiến độ dự án

> **Quy ước cập nhật (append-only):** các mục đã đánh số `[N]` là bất biến. Cập nhật mới
> CHỈ thêm vào **"Nhật ký cập nhật" ở CUỐI file** (mục kế tiếp = số kế tiếp), không sửa
> bất kỳ dòng nào ở trên. Nếu một việc trong "Đang làm" hoàn thành, chép nguyên văn
> xuống Nhật ký với số mới.

## Đã hoàn thành

- [x] [1] Setup môi trường: VS Code, Node.js, Git
- [x] [2] Nền tảng từ sách "Từ Zero Đến Vibe Coding" (Modules 6–9): validators đạt 100%
      Branch coverage, `.github/copilot-instructions.md`, `docs/ai-logs/`, Memory Bank
      (verify qua New Chat + máy PC mới), MCP Filesystem + MCP Postgres với user
      `mcp_readonly` (đã verify chặn lệnh DELETE thật 2026-08-09)
- [x] [3] MODULE 12 — fullstack Todo App (2026-08-09): Backend Prisma (User, Todo) +
      bcrypt + JWT httpOnly cookie + CRUD có IDOR protection bằng Integration Test với
      DB thật — 9/9 suites, 51/51 tests, 100% Branch coverage · Frontend React + Vite +
      Tailwind kết nối backend bằng cookie httpOnly (không Bearer) · E2E qua UI thật ·
      đạt 8/8 tiêu chí tự đánh giá của sách
- [x] [4] Xử lý thành công 2 sự cố hạ tầng: đồng bộ đa máy do zip/copy thủ công và
      worktree lồng 3 cấp do nhiều Cloud Agent session (chi tiết trong Ghi chú kỹ thuật)
- [x] [5] PHASE 1 (2026-08-11) — Role-based Authorization: field `role` (STUDENT/ADMIN)
      trong User model, middleware `requireRole`, route test `/api/admin/test`, seed
      script tạo Admin · sửa dứt điểm sự cố enum Role trùng nhau (custom vs Prisma
      Client gây lỗi compile 13 file) — 10/10 suites, 81/81 tests, 98.07% Branch coverage
- [x] [6] Login Google (2026-08-09, commit fb1449a): backend `POST /auth/google` verify
      idToken (google-auth-library) · frontend dùng Google Identity Services One Tap thật
- [x] [7] PHASE 2 — Data Model Quiz (mức tối giản, 2026-08-24): models `Tense`,
      `Level` (passScore, coinReward), `Question` (payload/correctAnswer dạng Json, enum
      5 loại câu hỏi), `LevelProgress` · seed Present Simple: 5 câu MULTIPLE_CHOICE,
      passScore 70, coinReward 50 · GHI CHÚ: chưa tạo QuizAttempt/CoinTransaction
      (xem architecture.md §7)
- [x] [8] PHASE 3 — Core Quiz API (2026-08-24, commit e33b1a6): `GET /api/levels/`
      (kèm isUnlocked + starsEarned backend tự tính), `GET /api/levels/:id/questions`
      (strip correctAnswer), `POST /api/levels/:id/submit` chấm server-side trong 1
      transaction → `{score, stars, coinAwarded, correctAnswers}` · coin chỉ thưởng lần
      pass đầu · level khóa tuần tự · 403 khi submit level chưa mở
- [x] [9] Frontend PresentSimple Flow + Homepage UI/UX (2026-08-24, e33b1a6 + f62cee7):
      flow trả lời → nộp bài → ResultModal (sao + Đô la Đạt) · dashboard với Study Mode,
      Battle Mode (sự kiện cuối tuần), Ranking tuần, Daily Tasks · theme Quỷ Đỏ hoàn chỉnh
- [x] [10] Refactor cấu trúc frontend (2026-08-27, dda7bb5 → 45293df → a8f3bb9):
      chuẩn hoá `app/ · pages/ · components/{ui,layout,quiz,todos,home} · hooks/ ·
      services/ · data/ · types/` · GIỮ nguyên môi trường React 18.3.1 + Vite 5.4.10 +
      Tailwind 3.4.16 + JSX · nối lại services với backend THẬT (cookie httpOnly,
      Google GSI, submit server chấm — xoá toàn bộ mock/localStorage auth) · thêm route
      `/todos` trước đây bị bỏ quên · tách HomePage 21KB thành PageShell + SideMenu +
      3 widget

- [x] [11] Quy hoạch Memory Bank theo hiện trạng & gom tài liệu về 1 mối (2026-08-27):
      viết lại `architecture.md` bám sát code backend/frontend thật · đánh số progress
      + thêm Nhật ký append-only · xoá các bản sao trùng lặp còn sót TRONG backend
      (`fullstack-todo-app-jwt-authentication/.github/`, `validators/`, `PROMPTS.md`,
      `CREATE_FEATURE_GUIDE.md`, file rác `logfile`) — giữ duy nhất `memory-bank/` ở gốc

- [x] [12] Leaderboard/Shop: thay RankingPanel mock bằng API thật · quyết định
      ledger CoinTransaction (append-only) TRƯỚC khi làm Shop

## Đang làm
- [x] [13] 4 loại câu hỏi còn lại: FILL_BLANK, MATCHING, CLOZE, TRUE_FALSE_NOT_GIVEN
      (enum + payload đã thiết kế sẵn, cần thêm renderer + seed) 
      Tương ứng với 4 level nữa để qua được cái cửa ải Present Simple.


## Việc tiếp theo (tuỳ chọn, không bắt buộc, mở rộng thêm nếu muốn)

- [ ] PHASE 4 — Streak: model + logic chuỗi ngày học liên tiếp + UI

- [ ] PHASE 6 — Admin Panel & Polish: mở rộng từ `requireRole` + `/api/admin/test`
- [ ] 4 loại câu hỏi còn lại: FILL_BLANK, MATCHING, CLOZE, TRUE_FALSE_NOT_GIVEN
      (enum + payload đã thiết kế sẵn, cần thêm renderer + seed)
- [ ] Bổ sung `coinBalance` vào response của `GET /auth/me` để frontend hiển thị số dư
      đúng ngay khi tải trang (hiện hiển thị 0 + cộng dồn trong phiên)
- [ ] Deploy thử (Vercel/Railway/Render) — chú ý cookie sameSite/secure + CORS origin

## Ghi chú kỹ thuật quan trọng (rút ra trong quá trình làm)

- Cloud Agent session có thể tạo code trên branch/worktree Git riêng (không ghi trực
  tiếp vào thư mục làm việc) — kiểm tra `git branch -a` / `git worktree list` NGAY sau
  mỗi lần AI báo "hoàn thành", merge hoặc xoá liền, không để dồn lồng nhau
- File quy chuẩn (.md) chỉ đặt baseline — vẫn phải verify bằng công cụ khách quan
  (`npx jest --coverage`), không tin báo cáo text của AI
- Coverage 100% ở tầng Controller KHÔNG đảm bảo bảo mật nếu chỉ mock Service — cần
  Integration Test với DB thật ở tầng Repository để verify IDOR bị chặn đúng tầng query
- MCP server chỉ cấu hình khi có hệ thống/dữ liệu thật; user phân quyền tối thiểu và
  phải verify bằng thao tác cấm thật (thử DELETE và xác nhận bị từ chối)
- Git Worktree KHÔNG portable qua copy/zip thủ công (file .git lưu đường dẫn tuyệt
  đối) — luôn đồng bộ đa máy bằng git push/pull
- Lỗi "Permission denied"/file lock khi xoá worktree trên Windows: restart máy là giải
  pháp nhanh và đáng tin cậy nhất
- **Refactor cấu trúc KHÔNG kèm nâng cấp môi trường** (version, framework, ngôn ngữ) —
  đã suýt vỡ project khi refactor frontend bị đổi Tailwind v3→v4 + JSX→TSX; yêu cầu
  "quy hoạch cấu trúc" chỉ được chạm cấu trúc
- Frontend KHÔNG lưu token: JWT trong cookie httpOnly + `credentials: 'include'` ở mọi
  fetch; backend CORS bắt buộc `credentials: true` (đã có)
- Mọi giá trị score/stars/coin chỉ lấy từ response `POST /submit` — client không tự
  tính, không tự gửi (nguyên tắc bất biến số 1 của roadmap)

## PIVOT LỚN (2026-08-10): Todo App → Kid English Quiz App

- Dự án chuyển hướng từ Todo App sang "Kid English Quiz App" (ứng dụng luyện tiếng
  Anh gamification cho trẻ em trong gia đình), theo roadmap 6 Phase.
- QUYẾT ĐỊNH KIẾN TRÚC QUAN TRỌNG: GIỮ NGUYÊN PostgreSQL + Prisma (đã có 100%
  Branch coverage, đã test kỹ) — KHÔNG chuyển sang MongoDB/Mongoose dù roadmap gốc
  viết theo MongoDB. Mọi model mới phải viết bằng Prisma schema.
- QUYẾT ĐỊNH KIẾN TRÚC QUAN TRỌNG: GIỮ NGUYÊN hạ tầng Auth hiện có (bcrypt hash
  password + JWT lưu trong httpOnly cookie) — không viết lại từ đầu. Chỉ MỞ RỘNG
  bằng cách thêm field `role` vào model User.
- Nguyên tắc bất biến từ roadmap (BẮT BUỘC tuân thủ khi code Phase 3 trở đi):
  - Client tuyệt đối không tự gửi score/coinAwarded — Backend luôn tự tính lại
  - CoinTransaction là append-only ledger — không xoá/sửa, chỉ tạo giao dịch mới
  - Mọi thao tác ảnh hưởng Coin phải chạy trong 1 database transaction
  - correctAnswer không bao giờ trả về cho Student trong response API
  - Idempotency: 1 QuizAttempt chỉ được tính điểm/cộng Coin đúng 1 lần
- Thứ tự triển khai bắt buộc: Phase 1 (Authorization) → Phase 2 (Data Model) →
  Phase 3 (Core Quiz API) → Phase 4 (Streak) → Phase 5 (Leaderboard/Shop) →
  Phase 6 (Admin Panel & Polish)
- Roadmap gốc: file Kid_English_Quiz_App_Roadmap.pdf đã upload

### Trạng thái 6 Phase (đánh số để theo dõi)

- [x] **Phase 1** — Role-based Authorization (mục [5])
- [x] **Phase 2** — Data Model, hoàn thành mức tối giản (mục [7])
- [x] **Phase 3** — Core Quiz API (mục [8])
- [ ] **Phase 4** — Streak (chưa bắt đầu)
- [ ] **Phase 5** — Leaderboard/Shop (frontend có RankingPanel UI dạng mock)
- [ ] **Phase 6** — Admin Panel & Polish (đã có nền `requireRole` + `/api/admin/test`)

## Nhật ký cập nhật (append-only — chỉ thêm [N+1] ở cuối, KHÔNG sửa mục cũ)

### [1] 2026-08-27 — Quy hoạch Memory Bank theo hiện trạng Kid English
- `architecture.md` viết lại toàn bộ bám sát code backend/frontend trên master
  (đọc trực tiếp từ routes/controllers/services/schema, không đoán)
- `progress.md` đánh số [1]–[10], lược bỏ chi tiết râu ria, thêm bảng trạng thái
  6 Phase và Nhật ký append-only này
- Gom tài liệu về 1 mối: xoá bản sao `.github/`, `validators/`, `PROMPTS.md`,
  `CREATE_FEATURE_GUIDE.md`, `logfile` nằm trong `fullstack-todo-app-jwt-authentication/`
  (trùng với gốc); `memory-bank/` duy nhất ở gốc repo
