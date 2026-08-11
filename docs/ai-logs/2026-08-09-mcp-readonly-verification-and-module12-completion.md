## AI Session Log
- **Ngày**: 2026-08-09
- **Người thực hiện**: Troy
- **Công cụ**: pgAdmin (xác minh thủ công), VS Code Agent
- **Module**: Module 9.4 (hoàn tất) + Module 12 (tổng kết hoàn thành)

### Việc đã làm

**1. Verify quyền mcp_readonly bị chặn (việc tồn đọng từ 2026-08-05)**
Đăng ký thêm 1 server trong pgAdmin, đăng nhập bằng user `mcp_readonly` (thay vì
`postgres`), mở Query Tool, thử chạy:
```sql
DELETE FROM public.users;
```
Xác nhận bị từ chối đúng như thiết kế (permission denied) — chứng minh nguyên tắc
Least Privilege cho MCP Postgres hoạt động đúng thực tế, không chỉ đúng lý thuyết
cấu hình GRANT/REVOKE.

**2. Xử lý xong sự cố cấu trúc thư mục (worktree lồng nhau)**
Do nhiều phiên Cloud Agent liên tiếp, workspace bị lồng worktree tới 3 cấp
(vibe-coding-lab.worktrees/memory-bank-restructuring-plan.worktrees/
repository-cleanup-plan). Dùng Devin CLI để phân tích read-only, xác nhận
agents/repository-cleanup-plan chứa code Frontend+Backend đầy đủ nhất và giống hệt
master (0 khác biệt 2 chiều git log). Dọn sạch toàn bộ worktree/branch thừa bằng
git worktree remove/prune và git branch -D. Gặp lỗi Permission denied khi xoá thư
mục do file lock không xác định được process cụ thể (handle64.exe không tìm ra) —
restart máy giải quyết dứt điểm.

**3. Frontend chạy thành công**
`frontend/` (React + Vite + TailwindCSS) chạy ổn định tại localhost:5173/5174,
kết nối đúng Backend qua cookie httpOnly (không dùng Bearer Token, đúng kiến trúc
đã chốt). Cấu trúc đúng chuẩn: components/reusable, components/todos, pages,
hooks, services.

### Self-Check / Verify cuối cùng
- Backend: 9/9 test suites PASS, 51/51 tests PASS, 100% Branch coverage (verify
  lại sau toàn bộ sự cố worktree — không mất dữ liệu/code nào)
- Frontend: chạy ổn định, đăng ký/đăng nhập/CRUD Todo qua UI thật hoạt động đúng
- MCP Postgres: user mcp_readonly xác nhận bị chặn DELETE — bảo mật đúng thiết kế
- git worktree list / git branch -a: sạch hoàn toàn, chỉ còn master

### Review của người thực hiện
- [x] Không chỉ tin cấu hình GRANT/REVOKE đúng lý thuyết — tự tay verify bằng thao
      tác thật qua pgAdmin, xác nhận DELETE bị chặn thực tế
- [x] Xử lý được sự cố hạ tầng phức tạp (worktree lồng 3 cấp, file lock không rõ
      nguyên nhân) bằng cách kết hợp nhiều công cụ điều tra (Devin CLI phân tích
      read-only, handle64.exe, restart máy) thay vì xoá bừa có nguy cơ mất code
- [x] Verify lại toàn bộ test suite sau sự cố để đảm bảo không mất gì trong quá
      trình dọn dẹp — không tin "chắc là ổn", luôn tự chạy lại kiểm chứng

## KẾT LUẬN: MODULE 12 — HOÀN THÀNH ĐẦY ĐỦ
Đối chiếu bảng tiêu chí tự đánh giá cuối Module 12 trong sách: đạt đủ 8/8 tiêu chí
(đăng ký/đăng nhập, JWT, chống IDOR có Integration Test thật, không hardcode secret,
đủ test case, cấu trúc Frontend đúng chuẩn, quy chuẩn kỹ thuật + log AI đầy đủ,
commit history chuẩn Conventional Commits).