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

## Đang làm
- [ ] Chuẩn bị bước sang Module 9 (MCP - Model Context Protocol)

## Việc tiếp theo
- [ ] Thêm blacklist mật khẩu phổ biến vào passwordValidator
- [ ] Module 9: Xây dựng hệ sinh thái MCP
- [ ] Module 10-11: Kỹ thuật nâng cao + Background Agents
- [ ] Module 12: đồ án Todo App full-stack (register/login/JWT — sẽ tái sử dụng
      emailValidator + passwordValidator + registrationValidator đã có)

## Ghi chú kỹ thuật quan trọng (rút ra trong quá trình làm)
- Cloud Agent session của Copilot có thể tạo code trên branch Git riêng (không ghi
  trực tiếp vào thư mục làm việc) — cần kiểm tra git branch -a nếu không thấy file
  mới xuất hiện sau khi AI báo "hoàn thành"
- File quy chuẩn (.md) chỉ đặt baseline, không đảm bảo AI tự tuân thủ 100% — vẫn cần
  con người verify bằng công cụ khách quan (npx jest --coverage)