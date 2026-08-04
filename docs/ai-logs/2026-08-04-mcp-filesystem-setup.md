## AI Session Log
- **Ngày**: 2026-08-04
- **Người thực hiện**: Troy
- **Công cụ**: VS Code Copilot + MCP Filesystem Server
- **Module**: Module 9 — MCP (Model Context Protocol)

### Việc đã làm
- Tạo .vscode/mcp.json cấu hình MCP Filesystem Server
  (điều chỉnh từ sách: Claude Code dùng .mcp.json + key "mcpServers",
  VS Code Copilot dùng .vscode/mcp.json + key "servers")
- Khởi động server qua nút Start trong Editor, xác nhận qua Output panel:
  Connection state Running, Discovered 14 tools
- Verify bằng cách yêu cầu AI liệt kê file qua MCP tool

### Review
- [x] Server chạy đúng, giới hạn phạm vi đúng 1 thư mục dự án (Least Privilege)
- [ ] Chưa thử Custom MCP Server (9.3) — để dành khi có nhu cầu tích hợp hệ thống ngoài thật
- [ ] Chưa áp dụng MCP cho Database — dự án hiện chưa dùng DB