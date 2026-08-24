# AI Log — Vertical Slice Level 1 (Present Simple, Multiple Choice) End-to-End

**Ngày:** 2026-08-24
**Công cụ AI dùng:** Devin (VS Code) cho code, Claude cho PLAN/prompt-engineering/debug
**Phase:** Phase 3 (Core Quiz API) — bước đầu tiên, phạm vi 1 Level mẫu duy nhất

## Mục tiêu phiên làm việc
Dựng 1 vertical slice hoàn chỉnh (Backend + Frontend) cho Level đầu tiên của Tense
Present Simple, Question Type = Multiple Choice, để chuẩn hóa kiến trúc
`QuestionRenderer` + luồng chấm điểm/Coin trước khi mở rộng ra 12 Tense × 10 Level ×
5 Question Type.

## Đã làm được
- [x] Prisma schema mở rộng: `enum QuestionType`, model `Tense`, `Level`, `Question`,
      `LevelProgress`, thêm field `coinBalance` vào `User`
- [x] Seed data: 1 Tense (Present Simple) → 1 Level (order=1) → 5 Question Multiple
      Choice nội dung thật
- [x] Backend: `levelService`, `levelController`, `levelRoutes` — luồng chấm điểm
      chạy trong 1 Prisma transaction, verify unlock permission server-side, chặn
      Coin farming (chỉ award Coin lần pass đầu tiên), correctAnswer không lộ ở
      GET /questions
- [x] Frontend: `QuestionRenderer`, `MultipleChoiceQuestion`, `PlayLevel`,
      `ResultModal` — route `/play/:levelId` hoạt động, đọc levelId qua `useParams()`
- [x] Nút điều hướng liên kết `/todos` ↔ `/play/:levelId` (Frontend-only, không đụng
      backend)
- [x] Test end-to-end qua UI thật: đăng nhập → vào Level → làm bài → nộp → xem kết
      quả (60%, 2 sao) → quay lại /todos — chạy được

## Sự cố gặp phải & cách xử lý (quan trọng — đọc trước khi lặp lại)

### 1. Devin tự ý đổi kiến trúc từ JS sang TypeScript
- **Hiện tượng:** `architecture.md` chốt rõ "Node.js thuần, chưa dùng TypeScript",
  nhưng Devin tạo toàn bộ file mới (`levelService.ts`, `seed.ts`, `app.ts`...) bằng
  TypeScript mà không hỏi trước.
- **Quyết định:** CHẤP NHẬN giữ TypeScript cho phần code mới (không rollback về JS)
  — cần cập nhật lại `architecture.md` để phản ánh đúng thực tế, tránh AI agent các
  phiên sau tiếp tục lẫn lộn 2 chuẩn.
- **Bài học:** Cần thêm dòng vào `copilot-instructions.md`/prompt cho Devin: "Nếu
  muốn đổi bất kỳ quyết định kiến trúc nào đã ghi trong memory-bank/architecture.md,
  PHẢI dừng lại hỏi trước, không tự quyết."

### 2. Lỗi TypeScript compile lặp lại nhiều vòng (TS2345/TS2322)
- **Hiện tượng:** Devin sửa 2 lần liên tiếp vẫn ra lỗi y hệt vì không tìm đúng root
  cause — lỗi thật nằm ở Zod schema (`z.any()` tự bị Zod suy ra kiểu optional dù
  không có `.optional()`, đây là quirk đã biết của Zod), không phải ở Controller
  như Devin tưởng.
- **Xử lý:** Con người (qua Claude) tự đọc stack trace, xác định đúng root cause ở
  `validators/authValidators.ts`, sửa tay `z.any()` → union kiểu cụ thể
  (`z.union([z.string(), z.number()])`).
- **Bài học:** AI agent đôi khi sửa đúng triệu chứng nhưng sai gốc, lặp lại vòng lặp
  không tiến triển — cần con người đọc kỹ stack trace thay vì để AI tự loay hoay.

### 3. Devin báo cáo "✅ Đạt/HOÀN THÀNH" nhưng thực tế chưa chạy được
- **Hiện tượng:** Báo cáo lần đầu ghi "✅ Đạt" cho toàn bộ tiêu chí, nhưng thực tế:
  Integration Test với DB thật CHƯA từng chạy (chỉ Unit Test mock), Migration chưa
  chạy, và sau đó phát hiện thêm App.jsx còn thiếu hẳn Route dẫn tới tính năng vừa
  code — nghĩa là tính năng không thể truy cập được từ UI dù báo "hoàn thành".
- **Xử lý:** Bắt Devin tự audit lại toàn bộ + thêm cột "Đã tự verify được không
  (Có/Không/Không thể tự verify)" vào bảng báo cáo — buộc nó khai rõ giới hạn thay
  vì báo "Đạt" cho việc chưa tự kiểm tra được.
- **Bài học (nhắc lại từ Module 12, vẫn đúng):** KHÔNG BAO GIỜ tin báo cáo text của
  AI là đủ — luôn tự tay chạy thật qua UI/API để verify, đặc biệt là bước cuối cùng
  "người dùng thật có dùng được tính năng không", không chỉ dừng ở "code compile
  được"/"test mock pass".

### 4. Lỗi môi trường không liên quan tới code (2 lần)
- PostgreSQL bị tắt giữa chừng (do chạy thủ công, không phải Windows Service) →
  lỗi `Can't reach database server`
- Vite tự đổi port 5173 → 5174 do port cũ bị chiếm bởi terminal cũ chưa tắt → Google
  OAuth chặn vì origin không khớp danh sách "Authorized JavaScript origins"
- **Bài học:** Cả 2 lỗi này KHÔNG phải do code sai, dễ nhầm là bug — cần kiểm tra
  môi trường (Postgres có chạy không, đúng port không) trước khi nghi ngờ code.

## Việc còn thiếu / để lại cho phiên sau
- Chưa làm `attemptId` chống double-submit (để scope tối thiểu, có thể bổ sung sau)
- Chưa có World Map/Level Map UI thật (mới có 1 Level, chưa cần bản đồ)
- 4 Question Type còn lại chưa làm: Fill Blank, Matching, Cloze, True/False/Not Given
- Nút "Nộp bài" ở UI có dấu hiệu bị disable dù đã trả lời hết câu — cần kiểm tra lại
  điều kiện enable của nút này (chưa xác nhận rõ nguyên nhân, ghi chú để theo dõi)
- Integration Test với DB thật (`levelIntegration.test.ts`) cần chạy lại và xác nhận
  PASS thật — tại thời điểm ghi log này chưa có xác nhận cuối cùng bằng text log rõ
  ràng, chỉ xác nhận gián tiếp qua test UI thủ công