# AI Log — Fix bug "0/10 câu đúng" ở Level 3/4 & điều hướng sai sau khi nộp bài

**Ngày:** 2026-08-30
**Công cụ AI dùng:** Claude (đọc code trực tiếp qua Git clone, sửa tay, không dùng AI agent tự động)
**Phase:** Phase 3 (Core Quiz API) / mục [13] progress.md — hoàn thiện 4 loại câu hỏi còn lại
**Commit đối chiếu tại đầu phiên:** `0bfd790` "Update naviagation Page" (branch `master`)

## Mục tiêu phiên làm việc
Người dùng báo 2 bug thực tế khi test UI ở Level 3 (Nối Câu — MATCHING) và
Level 4 (Điền Đoạn Văn — CLOZE):
1. Làm xong không hiển thị đúng số câu đúng — luôn ra `0/10`.
2. Bấm "Tiếp tục hành trình" ở màn kết quả bị điều hướng thẳng ra `/tenses`
   thay vì quay lại đúng danh sách Level của Thì đang học.

## Đã làm được

- [x] Clone repo `TunaTroy/vibe-coding-lab` (branch `master`), đọc toàn bộ
      `memory-bank/architecture.md` + `progress.md` để nắm kiến trúc và 7
      nguyên tắc bất biến trước khi đụng code.
- [x] Đọc `levelService.ts` (backend) xác nhận: **backend chấm điểm và cộng
      coin ĐÚNG** — so sánh answer bằng `JSON.stringify(answer.answer) ===
      JSON.stringify(question.correctAnswer)`, chạy trong 1 `$transaction`,
      đúng nguyên tắc bất biến. Vậy bug không nằm ở điểm/sao/coin thật, chỉ có
      thể là bug hiển thị hoặc điều hướng ở FE.
- [x] Đọc `PlayLevelPage.jsx` + `ResultModal.jsx` + `QuestionRenderer.jsx` +
      contract answer đã ghi sẵn trong comment của `QuestionRenderer` (rất hữu
      ích — biết ngay MATCHING/CLOZE dùng `number[]`, còn lại dùng
      string/number đơn).
- [x] **Xác định root cause Bug A:** `PlayLevelPage.jsx` tự đếm lại
      `correctCount` để hiển thị (không lấy thẳng từ backend) bằng toán tử
      `===`. Với `number[]` (MATCHING, CLOZE), hai mảng luôn khác instance nên
      `===` luôn `false` dù giá trị hệt nhau → Level 3/4 luôn hiện `0/N`.
      Level 1/2/5 (answer là `number`/`string`) không bị vì so sánh nguyên
      thủy hoạt động đúng với `===`.
- [x] **Fix Bug A:** đổi so sánh sang `JSON.stringify(a) === JSON.stringify(b)`
      — khớp 100% cách backend đang chấm, không cần đụng backend cho bug này.
- [x] **Xác định root cause Bug B:** đọc `App.jsx` phát hiện route `/levels`
      đã bị deprecate từ đợt refactor sang mô hình đa Thì (`Update naviagation
      Page`, `0bfd790`) và tự `<Navigate to="/tenses" replace />`. Trong khi đó
      `PlayLevelPage.jsx` vẫn còn gọi `navigate("/levels")` (sót lại từ trước
      refactor) → luôn văng về màn chọn Thì, mất context Thì đang học.
- [x] **Fix Bug B:** `LevelRecord` (backend) vốn đã có sẵn field `tenseId`
      nhưng `getLevelQuestions()` chưa expose ra API response — bổ sung
      `tenseId` vào object `level` trả về của `GET /api/levels/:id/questions`,
      rồi sửa FE `navigate(\`/tenses/${level.tenseId}/levels\`)`.
- [x] Kiểm tra `levelService.test.ts` dùng `toMatchObject` (không assert cứng
      toàn bộ shape) → xác nhận thêm field `tenseId` KHÔNG làm vỡ test hiện có.
- [x] Cập nhật `memory-bank/progress.md` (mục [2] trong Nhật ký cập nhật) theo
      đúng quy ước append-only của repo.

## Sự cố gặp phải & cách xử lý (quan trọng — đọc trước khi lặp lại)

### 1. Không chạy được `npx jest` để verify sau khi sửa
- **Hiện tượng:** `npx prisma generate` báo lỗi
  `Failed to fetch sha256 checksum at https://binaries.prisma.sh/... - 403
  Forbidden` → thiếu Prisma Client type đúng → `jest` báo `TS7006: Parameter
  'tx' implicitly has an 'any' type` ở `levelService.ts` dòng `$transaction`.
- **Cách xác minh đây KHÔNG phải lỗi do bản sửa gây ra:** chạy `git stash` để
  lùi lại code gốc rồi chạy lại `npx jest levelService.test.ts` — lỗi
  `TS7006` y hệt vẫn xuất hiện ở dòng tương ứng của code gốc → kết luận đây là
  giới hạn môi trường sandbox (domain `binaries.prisma.sh` không nằm trong
  allowlist mạng), không liên quan tới logic vừa sửa. `git stash pop` khôi
  phục lại bản sửa ngay sau đó.
- **Bài học:** Trước khi kết luận "lỗi do tôi vừa sửa", luôn `git stash` thử
  lại trên baseline để tách bạch lỗi môi trường và lỗi logic — đặc biệt quan
  trọng khi làm việc trong sandbox có network allowlist giới hạn.
- **CHƯA XONG:** vẫn cần chạy `npx jest --coverage` thật (đặc biệt
  `levelIntegration.test.ts` — cần DB Postgres thật) trên máy có mạng đầy đủ
  trước khi coi 2 bug này là "đã verify khách quan", không chỉ dừng ở đọc code.

### 2. Nghi ngờ có commit mới nhưng fetch không thấy
- **Hiện tượng:** người dùng báo "vừa đẩy 1 commit mới lên GitHub", nhưng
  `git fetch origin master` (chạy 2 lần, có `--prune -v`) đều báo
  `up to date`, HEAD vẫn là `0bfd790` cũ.
- **Xử lý:** hỏi lại người dùng xác nhận đúng branch `master` hay không, sau
  đó người dùng chọn "cứ cập nhật 2 file tài liệu luôn, không chờ commit" →
  chuyển sang cập nhật `progress.md` + tạo log này dựa trên các fix đã làm
  trực tiếp trong phiên (không dựa vào diff của commit chưa xuất hiện).
- **Bài học:** Khi báo cáo "đã push" nhưng công cụ không thấy thay đổi, khả
  năng cao nhất là quên `git push` sau khi `commit`, hoặc push nhầm
  remote/fork — không nên tự suy diễn nguyên nhân, hỏi thẳng người dùng kiểm
  tra `git status` / `git remote -v` / `git push origin master`.

## Việc còn thiếu / để lại cho phiên sau
- Chạy `npx jest --coverage` (Unit + Integration) thật trên máy có Postgres +
  mạng đầy đủ để xác nhận 2 bug đã fix không phá vỡ test nào, và
  `levelService.test.ts` pass với field `tenseId` mới.
- Test lại bằng tay qua UI thật cho **cả 5 Level** (không chỉ 3, 4) để chắc
  chắn `JSON.stringify` không có edge case lệch thứ tự phần tử trong mảng
  MATCHING/CLOZE (nếu FE và BE build mảng theo thứ tự khác nhau, so sánh vẫn
  có thể sai dù cả hai đều "đúng ý nghĩa nghiệp vụ" — chưa kiểm tra kỹ thứ tự
  này trong phiên nay).
- Đồng bộ lại repo: người dùng cần `git push` các thay đổi (đã confirm miệng
  là "làm được rồi" nhưng `origin/master` tại thời điểm ghi log này vẫn chưa
  thấy commit mới) để 2 file `progress.md` và log này khớp với code thật trên
  GitHub.