## AI Session Log
- **Ngày**: 2026-08-05
- **Người thực hiện**: Troy
- **Công cụ**: VS Code Agent (GitHub Copilot)
- **Module**: Module 12 — fullstack-todo-app-jwt-authentication
- **File**: src/config/env.ts, src/controllers/authController.ts,
  src/controllers/todoController.ts, src/repositories/todoRepository.ts,
  src/repositories/userRepository.ts, src/tests/repositoryIntegration.test.ts

### Bối cảnh
Sau khi nhảy thẳng từ Module 9 sang Module 12, AI báo cáo backend "hoàn thiện đúng
mục tiêu" với "7 test suites passed, 30/30 tests passed" — nhưng lệnh thực tế chạy là
`npx jest --runInBand --coverage=false`, VI PHẠM Self-Check bắt buộc trong
copilot-instructions.md (tự ý tắt coverage). Khi chạy lại đúng `npx jest --coverage`,
phát hiện hàng loạt vấn đề nghiêm trọng bị che giấu.

### Prompt gốc (3 lượt, theo đúng Master Prompt: PLAN → ACT → SELF-CHECK → BÁO CÁO)
1. Sửa lỗi test FAIL thật ở env.test.ts (env.ts không throw lỗi khi thiếu DATABASE_URL)
2. Vá Branch coverage cho authController.ts (50%) và todoController.ts (60%) —
   yêu cầu xác định rõ dòng nào liên quan IDOR trước khi viết test
3. Vá toàn bộ file 0% coverage còn lại theo thứ tự ưu tiên bảo mật (Repository trước,
   Routes sau) — yêu cầu Integration Test THẬT (không mock) cho tầng Repository

### Output tóm tắt — tiến trình qua từng lượt
| Lượt | Vấn đề phát hiện | Kết quả sau khi sửa |
|---|---|---|
| 1 | env.test.ts FAIL thật, không phải chỉ thiếu coverage | env.ts đạt 100% Branch, 0 fail |
| 2 | authController/todoController thiếu test nhánh lỗi quan trọng | Cả 2 file đạt 100% Branch |
| 3 | todoRepository.ts và userRepository.ts ở 0% — nơi thực sự chạy query IDOR, chưa hề được kiểm chứng dù Controller đã 100% | Viết Integration Test thật (repositoryIntegration.test.ts), kết nối DB todo_app thật, có afterEach dọn dữ liệu |

### Phát hiện quan trọng nhất của phiên làm việc
Coverage 100% ở tầng Controller KHÔNG đảm bảo bảo mật — vì các test ban đầu chỉ mock
todoService, xác nhận Controller "chuyển lỗi cho next()" mà không verify Service/
Repository có logic chặn IDOR thật hay không. Phải viết riêng Integration Test dùng
Prisma thật, tạo User A/User B/Todo mẫu, xác nhận:
`todoRepository.findByIdAndUserId(todoOfUserB, userA.id)` trả về `null`
— đây mới là bằng chứng IDOR bị chặn thật ở tầng database.

### Self-Check / Coverage (kết quả cuối)
- Lệnh chạy: npx jest --coverage
- Test Suites: 8 passed, 8 total
- Tests: 45 passed, 45 total
- todoRepository.ts, userRepository.ts, authController.ts, todoController.ts,
  env.ts, prisma.ts, authValidators.ts, authService.ts, todoService.ts: 100% Branch
- Còn lại: authRoutes.ts, todoRoutes.ts (0%), app.ts, server.ts (0% Stmts) — đang xử lý
  nhóm ưu tiên trung bình/thấp

### Review của người thực hiện
- [x] Không chấp nhận báo cáo "test PASS" khi AI dùng cờ tắt coverage — phát hiện và
      chặn ngay hành vi né tránh Self-Check
- [x] Không chấp nhận coverage 100% ở Controller là đủ bằng chứng bảo mật — yêu cầu
      Integration Test thật ở tầng Repository, đọc trực tiếp nội dung file test để
      xác nhận (không tin báo cáo tóm tắt của AI)
- [x] Xác nhận bằng mắt: repositoryIntegration.test.ts có đúng kịch bản User A/User B,
      dùng prisma thật, có afterEach cleanup
- [ ] Chưa hoàn thiện coverage cho authRoutes.ts, todoRoutes.ts, app.ts, server.ts —
      việc tiếp theo
- [ ] Chưa đổi JWT_SECRET sang chuỗi random an toàn (vẫn còn "hai-chuyen-tau-dem")
- [ ] Chưa cấu hình postgres MCP server với user quyền hạn chế (Module 9.4 hoãn lại)