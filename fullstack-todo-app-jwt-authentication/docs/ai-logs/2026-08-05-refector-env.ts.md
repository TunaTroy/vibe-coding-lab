## AI Session Log
- **Ngày**: 2026-08-05
- **Người thực hiện**: Troy
- **Công cụ**: VS Code Agent (GitHub Copilot)
- **Module**: Module 12 — fullstack-todo-app-jwt-authentication
- **File**: src/config/env.ts, src/tests/env.test.ts

### Bối cảnh
Sau khi nhảy thẳng từ Module 9 sang Module 12, AI báo cáo backend "7 test suites
passed, 30/30 tests passed" khi chạy `npx jest --runInBand --coverage=false`.
Phát hiện đây là báo cáo sai lệch vì:
1. AI tự ý tắt coverage (--coverage=false), vi phạm Self-Check bắt buộc trong
   copilot-instructions.md
2. Khi chạy lại đúng `npx jest --coverage`, phát hiện 1 test THẤT BẠI thật:
   env.test.ts mong đợi env.ts throw lỗi "DATABASE_URL is required" khi thiếu biến
   môi trường, nhưng code không throw
3. Coverage toàn project chỉ đạt 61.57%, xa mục tiêu 100%

### Prompt gốc
"Sửa lỗi test đang FAIL trong src/tests/env.test.ts... [Master Prompt đầy đủ với
PLAN/ACT/SELF-CHECK/BÁO CÁO, tham chiếu memory-bank/ và copilot-instructions.md]"

### Output tóm tắt
- Sửa src/config/env.ts: thêm logic validate throw đúng lỗi khi thiếu DATABASE_URL
- env.ts đạt 100% Branch coverage (từ 40% ban đầu)
- Toàn bộ 7 test suites PASS, 31/31 tests PASS (tăng từ 30 vì thêm test mới)
- Coverage tổng thể tăng từ 61.57% → cần tiếp tục vá authController.ts (50%) và
  todoController.ts (60%) — CHƯA XONG, đang ở bước tiếp theo

### Self-Check / Coverage
- Lệnh chạy: npx jest --coverage
- env.ts: 100% Stmts/Branch/Funcs/Lines
- Toàn project: 7/7 test suites PASS, 31/31 tests PASS, 0 fail

### Review của người thực hiện
- [x] Phát hiện AI né tránh Self-Check bằng cờ --coverage=false — đã cập nhật
      copilot-instructions.md để cấm tường minh hành vi này
- [x] Đã đọc kỹ PLAN trước khi duyệt, yêu cầu AI xác định rõ nguyên nhân trước khi sửa
- [x] Đã tự chạy lại npx jest --coverage để verify độc lập
- [ ] Chưa vá xong authController.ts và todoController.ts — việc tiếp theo,
      đặc biệt cần kiểm tra dòng liên quan IDOR/ownership check