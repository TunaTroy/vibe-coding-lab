## AI Session Log
- **Ngày**: 2026-08-05
- **Người thực hiện**: Troy
- **Công cụ**: VS Code Agent (GitHub Copilot) + Gemini (hỗ trợ xử lý sự cố Git/môi trường)
- **Module**: Module 12 — fullstack-todo-app-jwt-authentication
- **Phạm vi**: Khôi phục đồng bộ giữa PC/Laptop, sửa lỗi môi trường test, dọn dẹp
  cấu trúc workspace, hoàn thiện coverage cuối cùng

### Bối cảnh — Sự cố đồng bộ đa máy
Sáng nay ở PC dùng AI Agent tạo khung backend, xuất ra 3 file nằm ngoài folder
VIBE-CODING-LAB (không dùng Git để đồng bộ, chỉ zip riêng folder chính). Sang laptop
giải nén, sửa tiếp thành công nhưng cấu trúc bị lệch so với repo Git gốc trên PC.

### Chuỗi sự cố và cách xử lý (theo đúng trình tự thực tế)

**Sự cố 1 — Worktree link hỏng khi đổi máy**
`git status` báo `fatal: not a git repository:
C:/Users/AD/Documents/vibe-coding-lab/.git/worktrees/...` — vì file `.git` bên trong
worktree lưu đường dẫn tuyệt đối trỏ về máy cũ (`C:/Users/AD/...`), không khớp máy
hiện tại (`C:/Users/dell/...`). Đây là giới hạn kỹ thuật của Git Worktree: liên kết
worktree gắn chặt với đường dẫn tuyệt đối của repo gốc, không portable giữa các máy
nếu chỉ copy/zip thủ công (không dùng git clone/pull).

**Sự cố 2 — Merge conflict khi paste đè code**
Copy toàn bộ code từ laptop đè vào repo chính gây `both modified` ở 2 file log cũ.
Xử lý bằng `git checkout --ours` để giữ bản log trên laptop (đang mới nhất).

**Sự cố 3 — Cấu trúc dự án bị lồng sai (root package.json xung đột)**
Sau khi paste, `fullstack-todo-app-jwt-authentication/` nằm NGANG CẤP với root
`VIBE-CODING-LAB` thay vì đúng vị trí worktree cũ. Khi chạy `npm test` ở root,
Jest dùng nhầm `package.json`/`node_modules` của root (thiếu ts-jest) thay vì của
backend, gây lỗi `SyntaxError: Unexpected token` khi parse cú pháp TypeScript
(`: string[]`, `as any`).

**Sự cố 4 — Thiếu ts-jest**
Cài `ts-jest`, `@types/jest`, cấu hình `jest.config.js` với `preset: 'ts-jest'`
ngay TRONG thư mục `fullstack-todo-app-jwt-authentication` (không phải root) —
giải quyết dứt điểm lỗi parse cú pháp TypeScript.

**Sự cố 5 — Database chưa sẵn sàng trên máy laptop**
7 test FAIL với `Can't reach database server at localhost:5432` — vì laptop là máy
khác, PostgreSQL chưa chạy, database `todo_app` chưa tồn tại. Xử lý:
`pg_ctl start` → `psql -U postgres` → `CREATE DATABASE todo_app` (báo already exists
vì đã tạo từ trước) → `npx prisma generate` → `npx prisma migrate dev` (báo "Already
in sync") → 9/9 test suites PASS.

**Sự cố 6 — Workspace bị rác do quá trình merge thủ công**
Xuất hiện `memory-bank-summary-review/`, `memory-bank-summary-review.worktrees/`,
`logfile`, `package.json`/`package-lock.json` trùng lặp ở root — di sản của quá
trình copy/paste/worktree merge thủ công qua nhiều máy.

### Prompt gốc (dọn dẹp workspace — RÀNG BUỘC TUYỆT ĐỐI không đụng vào backend)
"Quét toàn bộ workspace gốc VIBE-CODING-LAB... KHÔNG ĐƯỢC CHỈNH SỬA, XÓA HOẶC THAY
ĐỔI BẤT KỲ CẤU TRÚC/FILE NÀO BÊN TRONG THƯ MỤC fullstack-todo-app-jwt-authentication...
[Master Prompt đầy đủ PLAN → ACT → SELF-CHECK → BÁO CÁO]"

### Output tóm tắt — Dọn dẹp workspace
AI di chuyển vào `archive/obsolete-root-artifacts/` (không xoá hẳn, giữ khả năng
khôi phục): `logfile`, `memory-bank-summary-review/`,
`memory-bank-summary-review.worktrees/`, `package.json`/`package-lock.json` root
(gây shadow app thật). Cập nhật `.gitignore` root thêm rule chặn `archive/`,
`*.worktrees`, `memory-bank-summary-review*`. Giữ nguyên `memory-bank/`, `docs/`,
`.github/`, `PROMPTS.md`, `CREATE_FEATURE_GUIDE.md`, `validators/` — xác nhận có
giá trị context. KHÔNG chạm vào `fullstack-todo-app-jwt-authentication/` — verify
bằng cách chạy lại `npm test` trong đúng thư mục backend sau dọn dẹp.

### Vá coverage cuối cùng (theo Master Prompt ưu tiên bảo mật — đã áp dụng từ phiên
trước, xác nhận lại kết quả cuối)
Chạy `npx jest --coverage` trực tiếp từ trong `fullstack-todo-app-jwt-authentication/`
(không phải từ root — bài học quan trọng: luôn cd đúng vào thư mục backend trước
khi test, vì package.json/jest.config.js/node_modules chỉ tồn tại đúng ở đó).

### Self-Check / Coverage (kết quả CUỐI CÙNG, xác nhận độc lập qua Terminal)
- Test Suites: 9 passed, 9 total
- Tests: 51 passed, 51 total
- All files: 96.84% Stmts, 100% Branch, 93.1% Funcs, 96.84% Lines
- 100% Branch coverage cho TOÀN BỘ business logic: controllers, repositories,
  routes, services, validators, config (env.ts, prisma.ts)
- Ngoại lệ chấp nhận được: app.ts (94.11% Stmts, dòng 17 = /health endpoint),
  server.ts (0% Stmts = entry point app.listen), errorHandler.ts (83.33%, dòng 12)
  — đều là code khởi động hạ tầng/log phụ, không phải business logic bảo mật

### Review của người thực hiện
- [x] Tự chạy lại `npm test` VÀ `npx jest --coverage` độc lập bằng tay qua Terminal,
      không chỉ tin báo cáo AI (đúng thói quen xây dựng từ Module 5)
- [x] Xác nhận đúng vị trí chạy lệnh (trong thư mục backend, không phải root) —
      bài học mới: cấu trúc thư mục sai vị trí có thể khiến Jest dùng nhầm config
      mà không báo lỗi rõ ràng ngay từ đầu
- [x] Xác nhận AI tuân thủ đúng ràng buộc "không đụng backend" khi dọn dẹp root —
      verify bằng cách chạy lại test sau dọn dẹp, không chỉ tin báo cáo text
- [x] Hiểu rõ nguyên nhân gốc rễ (Git Worktree không portable qua copy/zip thủ công
      giữa các máy — bài học lớn nhất của phiên làm việc này) để tránh lặp lại
- [ ] Cần rút kinh nghiệm: từ nay dùng git push/pull đồng bộ giữa PC/laptop thay vì
      zip/copy thủ công, tránh toàn bộ chuỗi sự cố này tái diễn