### 6. NẠP MEMORY BANK ĐẦU PHIÊN
-   Trước khi làm gì, hãy đọc toàn bộ file trong thư mục memory-bank/
    để nắm các quyết định kiến trúc đã chốt và tiến độ hiện tại của dự án.
    Sau đó tóm tắt lại cho tôi những gì bạn vừa nạp được.
### 6.1. PROMPT — YÊU CẦU LẬP KẾ HOẠCH TRƯỚC
-   Tôi muốn thêm tính năng "Quên mật khẩu" (Forgot Password) vào hệ thống auth hiện có.
    TRƯỚC KHI CODE: hãy trình bày PLAN gồm:
    1. Danh sách file sẽ tạo mới / sửa đổi
    2. Luồng xử lý (data flow) từng bước
    3. Các thư viện cần cài thêm (nếu có)
    4. Rủi ro/điểm cần lưu ý bảo mật
    Không code gì cho đến khi tôi xác nhận "OK, thực thi".
## MẸO: MẸO NÂNG CAO
-   Với Claude Code, bạn có thể đặt tên file chuẩn CLAUDE.md ở thư mục gốc — công cụ sẽ tự
    động nạp file này vào mỗi phiên mà không cần bạn nhắc lại. Hãy đặt link tới các file trong
    memory-bank/ ngay trong CLAUDE.md để việc nạp context diễn ra tự động.

### 7. PROMPT — YÊU CẦU AI REVIEW PULL REQUEST
-   Hãy review đoạn diff sau (git diff đính kèm) với vai trò Senior Reviewer.
    Tập trung vào các nhóm sau, liệt kê rõ theo mức độ nghiêm trọng (Critical/Warning/Suggestion):
    1. Lỗ hổng bảo mật
    2. Vấn đề hiệu năng
    3. Vi phạm coding convention trong CLAUDE.md
    4. Thiếu test coverage
    KHÔNG đánh giá về đặt tên biến trừ khi vi phạm convention đã định nghĩa.
## CẢNH BÁO: GIỚI HẠN CỦA AI REVIEWER
-   AI không biết rằng, theo yêu cầu khách hàng, "chỉ Admin mới được xoá đơn hàng đã hoàn
    thành trong vòng 24h" — đây là quy tắc nghiệp vụ chỉ con người nắm được từ buổi họp. Vì
    vậy bước review của con người là bắt buộc, không thể thay thế hoàn toàn bằng AI.

### 8. MẸO: PROMPT REFACTOR CHUẨN
-   Refactor hàm handleOrder hiện tại theo Repository Pattern + Service Layer, tách rõ 3
    lớp: Controller (nhận request) / Service (logic nghiệp vụ) / Repository (truy vấn dữ liệu).
    Giữ nguyên hành vi hiện tại 100%, viết kèm test đảm bảo không có regression.

### 9. PROMPT — KIỂM TRA MCP SERVER ĐÃ KẾT NỐI
-   Dùng MCP filesystem server, liệt kê các file trong thư mục [tên thư mục cần kiểm tra]
    (dùng để xác nhận MCP server đã hoạt động, thay vì tin vào báo cáo "Connected" suông)
## MẸO: CẤU HÌNH MCP KHÁC NHAU GIỮA CÁC CÔNG CỤ
-   Claude Code: file .mcp.json ở thư mục gốc, key "mcpServers", kiểm tra qua lệnh
    Terminal `claude mcp list`
-   VS Code Copilot (đang dùng cho dự án này): file .vscode/mcp.json, key "servers",
    kiểm tra qua Command Palette `Ctrl+Shift+P → MCP: List Servers`, hoặc xem log chi
    tiết tại Output panel → chọn "MCP: [tên server]"
## CẢNH BÁO: PHÂN QUYỀN KHI TRAO QUYỀN CHO MCP
-   MCP server kết nối database với quyền superuser đồng nghĩa AI có thể chạy DROP
    TABLE nếu hiểu sai yêu cầu. Luôn tạo user riêng với quyền tối thiểu
    (Principle of Least Privilege) — ví dụ chỉ cấp SELECT, không cấp DELETE/DROP
    trừ khi thực sự cần.    