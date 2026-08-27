import { apiFetch } from "./api";

/* ============================================================
   Level service — gọi backend THẬT (mount tại /api/levels, requireAuth).
   Routes (src/routes/levelRoutes.ts):
     GET  /api/levels/              → { levels }
     GET  /api/levels/first         → { id, order }
     GET  /api/levels/:id/questions → { level, questions }
     POST /api/levels/:id/submit    → { score, stars, coinAwarded, correctAnswers }
   ============================================================ */

/** Danh sách level + tiến độ (isUnlocked, starsEarned do backend tính). */
export async function fetchAllLevels() {
  return apiFetch("/api/levels/");
}

/** Câu hỏi của level — payload.options, KHÔNG kèm đáp án đúng. */
export async function fetchLevelQuestions(levelId) {
  return apiFetch(`/api/levels/${levelId}/questions`);
}

/**
 * Nộp bài — backend chấm điểm trong transaction, FE KHÔNG tự tính.
 * @param {string} levelId
 * @param {{ questionId: string, answer: string|number }[]} answers
 * @returns {Promise<import('../types/index').SubmitLevelResult>}
 */
export async function submitLevel(levelId, answers) {
  // submitLevelSchema: { levelId: string, answers: [{ questionId, answer: string|number }] }
  return apiFetch(`/api/levels/${levelId}/submit`, {
    method: "POST",
    body: { levelId, answers },
  });
}
