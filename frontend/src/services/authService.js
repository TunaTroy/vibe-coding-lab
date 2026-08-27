import { apiFetch, toApiError } from "./api";

/* ============================================================
   Auth service — gọi backend Express THẬT (mount tại /auth).
   Auth hoàn toàn qua httpOnly cookie `token` (credentials: 'include'):
   - KHÔNG đọc/ghi localStorage cho user/token/password.
   - Google Login: Google Identity Services (GSI) script thật của
     Google → nhận credentialResponse.credential (idToken thật)
     → POST /auth/google { idToken }.
   ============================================================ */

/** User từ backend — /auth/me không kèm coinBalance nên gán 0. */
function normalizeUser(wire) {
  return {
    id: wire?.id ?? "",
    email: wire?.email ?? "",
    role: wire?.role ?? "STUDENT",
    coinBalance: typeof wire?.coinBalance === "number" ? wire.coinBalance : 0,
  };
}

/* ---------------- login / register / logout / me ---------------- */

/** POST /auth/login — body loginSchema { email, password } → 200 { message, user } + set cookie. */
export async function login(email, password) {
  const data = await apiFetch("/auth/login", {
    method: "POST",
    body: { email, password },
  });
  return normalizeUser(data.user);
}

/** POST /auth/register — body registerSchema { email, password ≥ 8 ký tự } → 201 { message, user }. */
export async function register(email, password) {
  const data = await apiFetch("/auth/register", {
    method: "POST",
    body: { email, password },
  });
  return normalizeUser(data.user);
}

/** POST /auth/logout — backend clearCookie('token') → 200 { message }. */
export async function logout() {
  await apiFetch("/auth/logout", { method: "POST" });
}

/**
 * GET /auth/me (requireAuth) → { user: { id, email, role } }.
 * Khôi phục phiên từ cookie khi mở app; 401/lỗi mạng → null (chưa đăng nhập).
 * @returns {Promise<import('../types/index').User | null>}
 */
export async function restoreSession() {
  try {
    const data = await apiFetch("/auth/me");
    return normalizeUser(data.user);
  } catch {
    return null;
  }
}

/**
 * POST /auth/google { idToken } → backend verify → set cookie → { message, user }.
 * idToken lấy từ callback của GoogleLoginButton (renderButton).
 */
export async function loginWithGoogle(idToken) {
  if (!idToken) {
    throw toApiError(401, "Google không trả về credential.");
  }
  const data = await apiFetch("/auth/google", {
    method: "POST",
    body: { idToken },
  });
  return normalizeUser(data.user);
}

// /* ---------------- Google Identity Services (thật) ----------------
//    window.google.accounts.id (do script https://accounts.google.com/gsi/client
//    cung cấp): initialize({ client_id, callback }) rồi prompt() mở One Tap.
//    callback nhận { credential } — credential là JWT idToken thật.
//    ------------------------------------------------------------ */

// const GSI_SRC = "https://accounts.google.com/gsi/client";
// let gsiLoader = null;

// /** Inject script GSI của Google đúng một lần. */
// function loadGsiScript() {
//   if (window.google?.accounts?.id) return Promise.resolve();
//   if (gsiLoader) return gsiLoader;

//   gsiLoader = new Promise((resolve, reject) => {
//     const script = document.createElement("script");
//     script.src = GSI_SRC;
//     script.async = true;
//     script.onload = () => resolve();
//     script.onerror = () => {
//       gsiLoader = null;
//       reject(toApiError(0, "Không tải được Google Identity Services. Kiểm tra mạng."));
//     };
//     document.head.appendChild(script);
//   });
//   return gsiLoader;
// }

// /**
//  * Đăng nhập Google THẬT:
//  * 1. load script GSI → google.accounts.id.initialize({ client_id, callback })
//  * 2. google.accounts.id.prompt() mở One Tap; người dùng chọn tài khoản
//  * 3. callback nhận credentialResponse.credential (JWT idToken thật)
//  * 4. POST /auth/google { idToken } → backend verify → set cookie → { message, user }
//  *
//  * Cần VITE_GOOGLE_CLIENT_ID trong .env (OAuth Client ID — Google Cloud Console).
//  */
// export async function loginWithGoogle() {
//   const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
//   if (!clientId) {
//     throw toApiError(
//       500,
//       "Chưa cấu hình VITE_GOOGLE_CLIENT_ID trong frontend/.env — tạo OAuth Client ID (Web) trong Google Cloud Console rồi điền vào."
//     );
//   }

//   await loadGsiScript();
//   const gsi = window.google?.accounts?.id;
//   if (!gsi) {
//     throw toApiError(0, "Google Identity Services chưa sẵn sàng. Thử lại.");
//   }

//   return new Promise((resolve, reject) => {
//     gsi.initialize({
//       client_id: clientId,
//       cancel_on_tap_outside: true,
//       callback: async (response) => {
//         if (!response.credential) {
//           reject(toApiError(401, "Google không trả về credential."));
//           return;
//         }
//         try {
//           const data = await apiFetch("/auth/google", {
//             method: "POST",
//             body: { idToken: response.credential },
//           });
//           resolve(normalizeUser(data.user));
//         } catch (err) {
//           reject(err);
//         }
//       },
//     });

//     gsi.prompt((notification) => {
//       // One Tap bị chặn/đóng/skip → báo lỗi để UI hiển thị
//       if (
//         notification.isNotDisplayed?.() ||
//         notification.isSkippedMoment?.() ||
//         notification.isDismissedMoment?.()
//       ) {
//         reject(toApiError(401, "Cửa sổ Google bị đóng hoặc bị trình duyệt chặn."));
//       }
//     });
//   });
// }
