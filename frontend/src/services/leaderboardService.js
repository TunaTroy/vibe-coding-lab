import { apiFetch } from "./api";

/* ============================================================
   Leaderboard service — gọi backend THẬT (mount tại
   /api/leaderboard, requireAuth).
   Route (src/routes/leaderboardRoutes.ts):
     GET /api/leaderboard/ → { players: [{ rank, name, coins,
                                            stars, isCurrentUser }] }
   ============================================================ */

/** Bảng xếp hạng đầy đủ, đã sort theo coins, backend tự đánh dấu isCurrentUser. */
export async function fetchLeaderboard() {
  return apiFetch("/api/leaderboard/");
}
