import { useEffect, useRef } from "react";

/* ============================================================
   GoogleLoginButton — dùng google.accounts.id.renderButton().
   Ổn định hơn prompt()/One Tap: nút được Google vẽ trực tiếp,
   user bấm mới mở popup OAuth chuẩn, không phụ thuộc FedCM.
   ============================================================ */

let gsiInitialized = false;
let gsiClientId = null;

export default function GoogleLoginButton({ onSuccess, disabled = false }) {
  const buttonRef = useRef(null);
  const callbackRef = useRef(null);

  useEffect(() => {
    if (!onSuccess) return undefined;
    callbackRef.current = onSuccess;

    const initializeGoogleButton = () => {
      if (!buttonRef.current || !window.google?.accounts?.id) return;

      const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
      if (!clientId) return;

      if (!gsiInitialized || gsiClientId !== clientId) {
        window.google.accounts.id.initialize({
          client_id: clientId,
          callback: (response) => {
            if (response?.credential && callbackRef.current) {
              callbackRef.current(response.credential);
            }
          },
        });
        gsiInitialized = true;
        gsiClientId = clientId;
      }

      window.google.accounts.id.renderButton(buttonRef.current, {
        theme: "outline",
        size: "large",
        width: 300,
        text: "continue_with",
      });
    };

    if (window.google?.accounts?.id) {
      initializeGoogleButton();
      return undefined;
    }

    const existingScript = document.querySelector('script[src="https://accounts.google.com/gsi/client"]');
    const script = existingScript || document.createElement("script");

    if (!existingScript) {
      script.src = "https://accounts.google.com/gsi/client";
      script.async = true;
      script.defer = true;
      document.body.appendChild(script);
    }

    script.onload = initializeGoogleButton;

    return () => {
      if (!existingScript && document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, [onSuccess]);

  if (!import.meta.env.VITE_GOOGLE_CLIENT_ID) {
    return (
      <button
        type="button"
        disabled
        className="w-full rounded-xl border border-gold/30 bg-coal/50 px-4 py-3 text-sm font-medium text-cream/60"
      >
        Google login unavailable
      </button>
    );
  }

  return (
    <div className="w-full flex justify-center">
      <div ref={buttonRef} className={disabled ? "pointer-events-none opacity-60" : ""} />
    </div>
  );
}