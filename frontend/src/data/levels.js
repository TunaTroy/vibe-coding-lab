/* ============================================================
   Seed UI — CHỈ còn 2 widget chưa có endpoint backend tương ứng
   (bảng xếp hạng tuần + nhiệm vụ hàng ngày). Toàn bộ dữ liệu
   quiz/level/user gọi API thật trong services/.
   ============================================================ */

/** Bảng xếp hạng tuần — mock (giữ nguyên dữ liệu từ code gốc). */
export const RANKING_SEED = [
  { name: "UnitedKing99", stars: 45, coins: 3200 },
  { name: "RedDevilFan", stars: 42, coins: 2950 },
  { name: "OldTrafford", stars: 38, coins: 2700 },
  { name: "MUFC Forever", stars: 35, coins: 2450 },
];

export const DAILY_TASKS_SEED = [
  { id: "dt-1", label: "Hoàn thành 1 bài học", done: true },
  { id: "dt-2", label: "Đăng nhập 3 ngày liên tiếp", done: false },
  { id: "dt-3", label: "Thu thập 50 Đô la Đạt", done: false },
];
