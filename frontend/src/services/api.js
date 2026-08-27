/* ============================================================
   API core — gọi backend Express (fullstack-todo-app-jwt-authentication).
   - Auth qua httpOnly cookie `token`: mọi fetch đều
     credentials: 'include'. KHÔNG lưu token/user vào
     localStorage/state.
   - CORS backend: cors({ origin: true, credentials: true }) ✓
   - Mount thật (src/app.ts backend): /auth, /todos, /api/levels
   ============================================================ */

/** Mặc định trỏ đúng PORT backend (không để rỗng chạy mock nữa). */
export const API_BASE = import.meta.env.VITE_API_URL ?? "http://localhost:4000";

export function toApiError(status, message, errors) {
  return { status, message, errors };
}

/**
 * Map ApiError → thông điệp tiếng Việt thân thiện.
 * Shape lỗi backend: 400 zod → { message: 'Validation error.', errors: fieldErrors },
 * 401 requireAuth → { message: 'Unauthorized.' | 'Token expired.' | 'Invalid token.' }
 * @param {unknown} error
 */
export function getErrorMessage(error) {
  const err = /** @type {import('../types/index').ApiError | null | undefined} */ (error);

  if (err?.status === 0) {
    return "Không thể kết nối tới máy chủ. Kiểm tra backend đã chạy chưa (mặc định http://localhost:4000).";
  }
  if (err?.status === 400) {
    const firstField = err.errors ? Object.values(err.errors)[0] : undefined;
    return firstField?.[0] ?? err.message ?? "Dữ liệu không hợp lệ.";
  }
  if (err?.status === 401) {
    if (err.message === "Token expired.") return "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.";
    return err.message === "Unauthorized." || err.message === "Invalid token."
      ? "Phiên đăng nhập không hợp lệ. Vui lòng đăng nhập lại."
      : err.message || "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.";
  }
  if (err?.status === 403) return err.message || "Bạn không có quyền thực hiện thao tác này.";
  if (err?.status === 404) return err.message || "Không tìm thấy tài nguyên yêu cầu.";
  if (err?.status === 500) return err.message || "Lỗi máy chủ. Vui lòng thử lại sau.";

  return err?.message || "Đã có lỗi xảy ra với yêu cầu của bạn.";
}

/**
 * Fetch chuẩn của toàn app:
 * - credentials: 'include' → gửi/nhận cookie httpOnly `token`
 * - 2xx → trả JSON đã parse; !ok → ném ApiError đúng shape backend
 * - Lỗi mạng (backend chưa chạy) → ApiError status 0
 * @template T
 * @param {string} path
 * @param {{ method?: "GET"|"POST"|"PUT"|"PATCH"|"DELETE", body?: unknown }} [options]
 * @returns {Promise<T>}
 */
export async function apiFetch(path, options = {}) {
  const { method = "GET", body } = options;

  let res;
  try {
    res = await fetch(`${API_BASE}${path}`, {
      method,
      credentials: "include",
      headers: body !== undefined ? { "Content-Type": "application/json" } : undefined,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  } catch {
    // ERR_CONNECTION_REFUSED / offline — backend chưa chạy
    throw toApiError(0, "Không thể kết nối tới máy chủ.");
  }

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw toApiError(res.status, data.message ?? "Request failed", data.errors);
  }
  return data;
}
