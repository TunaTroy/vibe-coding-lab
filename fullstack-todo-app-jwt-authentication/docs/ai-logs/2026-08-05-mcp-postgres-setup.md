## AI Session Log
- **Ngày**: 2026-08-05
- **Người thực hiện**: Troy
- **Công cụ**: VS Code Agent (GitHub Copilot) + MCP Postgres Server
- **Module**: Module 9.4 (hoãn từ trước) — áp dụng khi có DB thật ở Module 12

### Việc đã làm
- Tạo user `mcp_readonly` trong PostgreSQL với quyền hạn chế (Principle of Least
  Privilege): CONNECT, USAGE schema public, SELECT trên toàn bộ bảng — KHÔNG cấp
  INSERT/UPDATE/DELETE.
- Cấu hình MCP Postgres Server trong `.vscode/mcp.json` ở REPO GỐC (vibe-coding-lab),
  không phải trong subfolder `fullstack-todo-app-jwt-authentication` — bài học: VS
  Code chỉ đọc `.vscode/mcp.json` ở cấp workspace root khi mở nhiều folder lồng nhau.
- Connection string dùng ký tự đặc biệt trong password (`$`) cần URL-encode thành
  `%24`, nếu không sẽ gây lỗi parse connection string.
- Verify kết nối qua Output panel: Connection state Running, Discovered 1 tools.
- Test thực tế: yêu cầu AI đếm số user/todo qua MCP — kết quả khớp đúng dữ liệu
  thật trong database (3 users, 2 todos).

### Phát hiện đáng lưu ý
Khi thực hiện yêu cầu đơn giản (đếm dữ liệu), AI tự ý mở rộng phạm vi hành động:
tự tìm kiếm PostgreSQL binary trên hệ thống và tự chạy `pg_ctl start` mà không được
yêu cầu — dù vô hại trong trường hợp này, đây là dấu hiệu cần giám sát kỹ khi AI có
quyền truy cập filesystem + hệ thống, không chỉ giới hạn ở đúng phạm vi câu hỏi.

### Review của người thực hiện
- [x] User mcp_readonly tạo đúng, không dùng superuser postgres cho AI
- [x] MCP Postgres kết nối thành công, verify bằng truy vấn thực tế khớp dữ liệu
- [x] Ghi nhận AI có xu hướng tự mở rộng hành động ngoài phạm vi yêu cầu — cần giám
      sát khi cấp thêm quyền/công cụ cho AI trong tương lai
- [ ] CHƯA verify thực nghiệm quyền bị chặn thật (chưa thử DELETE để xác nhận bị
      permission denied) — chỉ dựa vào cấu hình GRANT/REVOKE đã chạy đúng lý thuyết,
      chưa test thực tế. Cần làm khi có thời gian, trước khi tin tưởng tuyệt đối.