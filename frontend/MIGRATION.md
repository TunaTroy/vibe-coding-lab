# 📦 Frontend refactor — Troy (Old Trafford Academy · Vibe English Lab)

> **Môi trường GIỮ NGUYÊN 100%** như dự án gốc: JavaScript (.jsx/.js),
> Vite 5.4.10, Tailwind CSS 3.4.16 + PostCSS 8.4.49 + Autoprefixer 10.4.20,
> React 18.3.1, React Router DOM 6.28.0, font **Inter**, theme đỏ-vàng MU.
> **Chỉ thay CẤU TRÚC thư mục** + nối services vào backend thật.

---

## ✅ Bước 1 — Copy

Chép đè folder `frontend/` này lên `frontend/` trong repo trên máy.

## 🗑 Bước 2 — XÓA các file cũ bị thay thế

Config gốc **giữ nguyên** (chỉ `tailwind.config.js` được mở rộng thêm bảng màu
MU — các file config của bạn: `vite.config.js`, `postcss.config.js`,
`tsconfig.json`, `package.json` đều giữ đúng phiên bản cũ).

```bash
cd frontend/src

# entry + style cũ (đã có bản mới cùng tên)
rm App.jsx main.jsx index.css

# hook + services cũ
rm hooks/useAuth.js
rm services/api.js services/levelService.js

# pages cũ — LƯU Ý đổi tên file (LevelSelect → LevelSelectPage, PlayLevel → PlayLevelPage)
rm pages/HomePage.jsx pages/LevelSelect.jsx pages/LoginPage.jsx
rm pages/PlayLevel.jsx pages/RegisterPage.jsx pages/TodoPage.jsx

# components cũ
rm -r components/reusable
rm -r components/sidebar
rm -r components/quiz/types
rm components/quiz/QuestionRenderer.jsx
rm components/todos/TodoItem.jsx components/todos/TodoList.jsx
```

## 🔧 Bước 3 — Chạy

```bash
cd frontend
npm install     # dependencies không đổi, cài lại cho chắc
npm run dev     # http://localhost:5173 — backend mặc định http://localhost:4000
```

Backend (`fullstack-todo-app-jwt-authentication/`): điền `.env`
(DATABASE_URL, JWT_SECRET, PORT=4000...) → `npx prisma migrate dev &&
npx prisma db seed` → `npm run dev`.

---

## 🌳 Cấu trúc mới trong máy bạn

```
frontend/
├── index.html                  # GIỮ (title Troy + Inter)
├── package.json                # GIỮ nguyên deps gốc
├── vite.config.js              # GIỮ (kèm gợi ý proxy comment)
├── tailwind.config.js          # MỞ RỘNG: bảng màu MU + font Inter
├── postcss.config.js           # GIỮ
├── tsconfig.json               # GIỮ
├── .env.example                # MỚI: VITE_API_URL + VITE_GOOGLE_CLIENT_ID
├── MIGRATION.md                # file này
└── src/
    ├── main.jsx                # BrowserRouter + AuthProvider
    ├── index.css               # @tailwind + CSS var + animations
    ├── app/
    │   └── App.jsx             # route table + guards (thêm route /todos)
    ├── pages/                  # 6 trang MỎNG, chỉ compose component
    │   ├── HomePage.jsx
    │   ├── LoginPage.jsx
    │   ├── RegisterPage.jsx
    │   ├── LevelSelectPage.jsx   (đổi tên từ LevelSelect.jsx)
    │   ├── PlayLevelPage.jsx     (đổi tên từ PlayLevel.jsx)
    │   └── TodoPage.jsx          (đã được wire vào router)
    ├── components/
    │   ├── ui/                 # Button · Card · Input · ResultModal · Reveal
    │   ├── layout/             # PageShell (header/logo/stats) · SideMenu
    │   ├── quiz/               # QuestionRenderer (đọc payload.options)
    │   ├── todos/              # TodoList
    │   └── home/               # StudyModeCard · BattleModeCard · RankingPanel
    ├── hooks/
    │   └── useAuth.jsx         # AuthContext (single source of truth)
    ├── services/               # gọi backend THẬT — cookie httpOnly
    │   ├── api.js              # apiFetch + getErrorMessage
    │   ├── authService.js      # /auth/* + Google GSI thật
    │   ├── levelService.js     # /api/levels/*
    │   └── todoService.js      # /todos (GET/POST/PUT/DELETE)
    ├── data/
    │   └── levels.js           # seed ranking + daily tasks (chưa có endpoint)
    └── types/
        └── index.js            # JSDoc typedefs khớp Prisma (không runtime)
```

## 🗺 Bảng mapping cũ → mới

| File cũ | File mới |
|---|---|
| `src/App.jsx` | `src/app/App.jsx` (thêm route `/todos`) |
| `src/hooks/useAuth.js` | `src/hooks/useAuth.jsx` (Context Provider, session qua `GET /auth/me`) |
| `src/services/api.js` + `getErrorMessage` trong HomePage | `src/services/api.js` |
| `pages/HomePage.jsx` (~21KB) | `HomePage.jsx` + `PageShell` + `SideMenu` + 3 widget |
| `sidebar/Menu.jsx` | `components/layout/SideMenu.jsx` |
| `reusable/*` (7 file) | `components/ui/*` (GoogleLoginButton gộp vào Login/Register, LevelCard gộp vào LevelSelectPage, StarRating gộp vào ResultModal) |
| `quiz/QuestionRenderer.jsx` + `quiz/types/MultipleChoiceQuestion.jsx` | `components/quiz/QuestionRenderer.jsx` |
| `todos/TodoList.jsx` + `TodoItem.jsx` | `components/todos/TodoList.jsx` |
| `pages/LevelSelect.jsx` / `PlayLevel.jsx` | `LevelSelectPage.jsx` / `PlayLevelPage.jsx` |

## 🔌 Endpoint backend thật đang gọi (đọc từ code backend, không đoán)

| Service | Endpoint |
|---|---|
| `login` | `POST /auth/login` `{email,password}` → 200 `{message,user}` + cookie `token` httpOnly |
| `register` | `POST /auth/register` — password **≥ 8 ký tự** (registerSchema) |
| `loginWithGoogle` | script GSI thật → One Tap nhận `credential` → `POST /auth/google` `{idToken}` |
| `restoreSession` | `GET /auth/me` (requireAuth) → `{user:{id,email,role}}`; 401 → null |
| `logout` | `POST /auth/logout` → clearCookie |
| `fetchAllLevels` | `GET /api/levels/` → `{levels:[{id,order,tenseName,isUnlocked,starsEarned}]}` |
| `fetchLevelQuestions` | `GET /api/levels/:id/questions` → `{level:{id,order,passScore,coinReward}, questions:[…payload:{options}…]}` |
| `submitLevel` | `POST /api/levels/:id/submit` `{levelId, answers:[{questionId, answer:index}]}` → `{score,stars,coinAwarded,correctAnswers}` |
| `todoService` | `GET/POST /todos` · `PUT /todos/:id` `{done}` · `DELETE /todos/:id` |

Mọi fetch dùng `credentials: 'include'` (backend đã
`cors({ origin: true, credentials: true })`). **Không còn** localStorage
cho user/token/password, **không** Bearer token.

### Google Login

1. Google Cloud Console → OAuth Client ID (Web) → thêm
   `http://localhost:5173` vào Authorized JavaScript origins.
2. `frontend/.env`: `VITE_GOOGLE_CLIENT_ID=<client-id>`.

## 🎯 Khác biệt hành vi so với bản mock (đều do backend quyết định)

- **Sao/điểm/coin chấm ở backend**: score ≥90→3⭐, ≥70→2⭐, ≥passScore→1⭐;
  coin = `level.coinReward` **chỉ lần đầu pass** (chơi lại = 0).
- **Sự kiện cuối tuần ×2 chưa có trong backend** → ResultModal nhận
  `isWeekendBoost=false` (muốn giữ: thêm logic vào levelService backend).
- **Không có giải thích từng câu** (backend strip `correctAnswer`).
- **coinBalance**: `/auth/me` chưa trả → FE gán 0 + cộng dồn trong phiên.
  Muốn số dư đúng khi tải lại: thêm `coinBalance` vào `getMe` (authController).
- Level list dùng `tenseName`, icon trang trí theo số thứ tự, sao lấy
  `starsEarned` từ backend.
