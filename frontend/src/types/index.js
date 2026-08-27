/* ============================================================
   Domain "types" — tài liệu JSDoc (dự án chạy JavaScript).
   Khớp 1:1 với backend Prisma (fullstack-todo-app-jwt-authentication)
   và các response thật đã đọc từ code backend.
   ============================================================ */

/**
 * @typedef {"STUDENT" | "ADMIN"} Role
 *
 * @typedef {Object} User
 * @property {string} id
 * @property {string} email
 * @property {Role} role
 * @property {number} coinBalance  // LƯU Ý: GET /auth/me chưa trả field này — FE gán 0
 *
 * @typedef {Object} ApiError
 * @property {number} status       // 0 = lỗi mạng, 400 zod, 401 requireAuth, 403, 404, 500
 * @property {string} message
 * @property {Record<string, string[]>} [errors]  // zod fieldErrors
 *
 * --- Quiz (GET /api/levels/:id/questions) ---
 * @typedef {Object} Question
 * @property {string} id
 * @property {string} levelId
 * @property {"MULTIPLE_CHOICE"|"FILL_BLANK"|"MATCHING"|"CLOZE"|"TRUE_FALSE_NOT_GIVEN"} type
 * @property {string} prompt
 * @property {{ options: string[] }} payload      // MULTIPLE_CHOICE: payload.options
 * @property {number} order
 * // correctAnswer KHÔNG bao giờ xuống FE trước khi submit (backend strip)
 *
 * @typedef {Object} LevelDetail
 * @property {string} id
 * @property {number} order
 * @property {number} passScore     // điểm cần để qua (seed: 70)
 * @property {number} coinReward    // coin thưởng lần đầu pass (seed: 50)
 *
 * @typedef {Object} LevelQuestionsResponse
 * @property {LevelDetail} level
 * @property {Question[]} questions
 *
 * @typedef {Object} LevelInfo       // GET /api/levels/ → { levels }
 * @property {string} id
 * @property {number} order
 * @property {string} tenseName     // backend trả tense.name, không có title/icon
 * @property {boolean} isUnlocked   // backend tính từ LevelProgress
 * @property {number} starsEarned
 *
 * @typedef {Object} SubmitLevelResult  // POST /api/levels/:id/submit → chấm ở backend
 * @property {number} score             // % câu đúng
 * @property {number} stars             // ≥90→3, ≥70→2, ≥passScore→1, else 0
 * @property {number} coinAwarded       // = coinReward chỉ LẦN ĐẦU pass
 * @property {Record<string, *>} correctAnswers  // { [questionId]: đáp án đúng }
 *
 * --- Todo (model Prisma dùng field `done`) ---
 * @typedef {Object} TodoWire
 * @property {string} id
 * @property {string} title
 * @property {boolean} done
 * @property {string} createdAt
 *
 * @typedef {Object} Todo          // UI shape (service map done → completed)
 * @property {string} id
 * @property {string} title
 * @property {boolean} completed
 * @property {string} createdAt
 *
 * --- Home widgets (chưa có endpoint backend) ---
 * @typedef {Object} RankPlayer
 * @property {number} rank
 * @property {string} name
 * @property {number} stars
 * @property {number} coins
 * @property {boolean} [isCurrentUser]
 *
 * @typedef {Object} DailyTask
 * @property {string} id
 * @property {string} label
 * @property {boolean} done
 */

export {};
