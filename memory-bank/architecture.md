# Kiến trúc hệ thống — Kid English Quiz App

## 1. Tổng quan
- Ứng dụng luyện tiếng Anh gamification cho trẻ em trong gia đình (4-5 cháu, 5-15
  tuổi), theo roadmap 6 Phase.
- Pivot từ dự án gốc "Todo App JWT Authentication" (2026-08-10) — GIỮ NGUYÊN hạ
  tầng Auth + Database, chỉ MỞ RỘNG thêm domain Quiz/Level/Coin.
- Repo: TunaTroy/vibe-coding-lab — root chứa 2 thư mục con độc lập:
  fullstack-todo-app-jwt-authentication/ (backend) và frontend/ (frontend).

## 2. Ngăn xếp công nghệ
- Backend: Node.js + Express + TypeScript, Prisma ORM, PostgreSQL.
- Auth: bcrypt hash password + JWT lưu trong httpOnly cookie; có thêm Google
  OAuth login song song (không thay thế email/password).
- Testing backend: Jest + Supertest; Integration Test dùng DB thật (không mock)
  ở tầng Repository để verify đúng hành vi (vd. chặn IDOR, unlock level).
- Frontend: React + Vite + TailwindCSS, react-router-dom, kiến trúc theo
  layer components/pages/hooks/services.

## 3. Cấu trúc thư mục Backend (fullstack-todo-app-jwt-authentication/src)
```
src/
├── app.ts, server.ts
├── config/          (env.ts, prisma.ts)
├── controllers/      (authController, levelController, todoController)
├── middleware/        (requireAuth, requireRole, errorHandler)
├── repositories/       (userRepository, levelRepository, todoRepository)
├── routes/             (authRoutes, levelRoutes, adminRoutes, todoRoutes)
├── services/           (authService, levelService, todoService)
├── validators/         (authValidators.ts — schema Zod, KHÁC với validators/
│                         ở root repo, không liên quan)
├── types/              (express.d.ts)
└── tests/              (1 file test song song mỗi layer, Integration Test riêng
                          cho level + repository)
prisma/
├── schema.prisma
└── seed.ts
```

## 4. Cấu trúc thư mục Frontend (frontend/src)
```
src/
├── app/App.jsx          (route table: Protected/Public Route)
├── components/
│   ├── home/             (BattleModeCard, EventBanner, LeaderboardWidget,
│   │                       RankingPanel, StudyModeCard — UI cho HomePage)
│   ├── layout/            (PageShell, SideMenu, SidebarNav, TopBar)
│   ├── quiz/               (QuestionRenderer — render câu hỏi theo
│   │                         question.payload từ backend)
│   ├── todos/               (TodoList — dùng lại cho tính năng "Ghi Chú HLV")
│   └── ui/                  (Button, Card, Input, Reveal, ResultModal,
│                              GoogleLoginButton)
├── data/levels.js
├── hooks/useAuth.jsx
├── pages/                (HomePage, LevelSelectPage, PlayLevelPage,
│                          LeaderboardPage, ShopPage, WarModePage, ProfilePage,
│                          LoginPage, RegisterPage, TodoPage)
├── services/              (api.js, authService.js, levelService.js,
│                            todoService.js)
└── types/index.js
```

## 5. Data Model (Prisma schema hiện tại)
- `User`: role (STUDENT/ADMIN), coinBalance, quan hệ tới Todo/LevelProgress/
  CoinTransaction.
- `Todo`: giữ nguyên từ dự án gốc, phục vụ tính năng "Ghi Chú HLV".
- `Tense`, `Level` (thuộc 1 Tense, có passScore + coinReward).
- `Question`: field `type` theo enum `QuestionType` (MULTIPLE_CHOICE,
  FILL_BLANK, MATCHING, CLOZE, TRUE_FALSE_NOT_GIVEN), `payload` +
  `correctAnswer` dạng Json.
- `LevelProgress`: bestScore, stars, passedAt, unique theo (userId, levelId).
- `CoinTransaction`: ledger append-only (id, userId, amount, reason).

## 6. API Routes hiện có
- `/api/auth`: register, login, google, logout, me.
- `/api/levels`: GET /first, GET / (danh sách kèm tiến độ + trạng thái mở
  khoá), GET /:id/questions (KHÔNG kèm correctAnswer), POST /:id/submit
  (chấm điểm + cộng Coin).
- `/api/admin`: GET /test — chỉ để kiểm tra middleware requireRole hoạt động,
  chưa có chức năng quản trị thật.
- `/api/todos`: CRUD, hiện phục vụ tính năng "Ghi Chú HLV" trên frontend
  (route /todos), không phải rác cần xoá.

## 7. Quyết định kiến trúc đã chốt (bất biến, bắt buộc tuân thủ khi code tiếp)
- 7.1. Giữ PostgreSQL + Prisma (đã test kỹ) — KHÔNG chuyển MongoDB/Mongoose dù
  roadmap gốc viết theo MongoDB.
- 7.2. Giữ nguyên hạ tầng Auth cũ (bcrypt + JWT httpOnly cookie), chỉ mở rộng
  bằng field `role` trên User — không viết lại từ đầu.
- 7.3. Client tuyệt đối không tự gửi score/coinAwarded — Backend luôn tự tính
  lại trong `levelService.submitLevel()`.
- 7.4. CoinTransaction là ledger append-only — không xoá/sửa, chỉ tạo giao
  dịch mới.
- 7.5. Mọi thao tác ảnh hưởng Coin phải chạy trong 1 `prisma.$transaction`
  (đã áp dụng đúng ở submitLevel).
- 7.6. `correctAnswer` không bao giờ trả về cho Student trước khi chấm điểm
  (GET /questions strip field này, chỉ trả trong response của POST /submit).
- 7.7. Idempotency: 1 lượt chơi chỉ được cộng Coin đúng 1 lần — kiểm tra qua
  `existingProgress.passedAt` trước khi cộng.
- 7.8. Route `/todos` (TodoPage) giữ lại, đã đổi vai trò thành "Ghi Chú HLV"
  trong sidebar — không xoá khi dọn dẹp code thừa.

## 8. Giới hạn / chưa hỗ trợ hiện tại (cần biết trước khi nhận việc mới)
- 8.1. Frontend `QuestionRenderer` mới chỉ hỗ trợ render loại
  `MULTIPLE_CHOICE`; 4 loại còn lại trong enum `QuestionType` (Fill Blank,
  Matching, Cloze, True/False/Not Given) chưa có component tương ứng.
- 8.2. `ShopPage`, `LeaderboardPage`, `WarModePage` mới là UI khung ("đang
  được phát triển"), chưa gọi API thật, chưa có backend tương ứng.
- 8.3. `adminRoutes` chỉ có 1 endpoint `/test` kiểm tra quyền — Admin Panel
  thật (Phase 6) chưa triển khai.
- 8.4. Seed data hiện chỉ có 1 Tense (Present Simple), 1 Level, 5 câu hỏi —
  đủ để chạy vertical slice, chưa đủ nội dung thật.