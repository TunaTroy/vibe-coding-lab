import { useEffect, useRef } from 'react';

// Global flag to ensure GSI is initialized only once per app
let gsiInitialized = false;
let gsiClientId = null;

export default function GoogleLoginButton({ onSuccess, disabled = false, label = 'Continue with Google' }) {
  const buttonRef = useRef(null);
  const callbackRef = useRef(null);

  useEffect(() => {
    if (!onSuccess) {
      return undefined;
    }

    // Store the latest callback
    callbackRef.current = onSuccess;

    const initializeGoogleButton = () => {
      if (!buttonRef.current || !window.google?.accounts?.id) {
        return;
      }

      const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
      if (!clientId) {
        return;
      }

      // Only initialize GSI once globally with the same client ID
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
        theme: 'outline',
        size: 'large',
        width: 300,
        text: 'continue_with',
      });
    };

    if (window.google?.accounts?.id) {
      initializeGoogleButton();
      return undefined;
    }

    const existingScript = document.querySelector('script[src="https://accounts.google.com/gsi/client"]');
    const script = existingScript || document.createElement('script');

    if (!existingScript) {
      script.src = 'https://accounts.google.com/gsi/client';
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
      <button type="button" disabled className="w-full rounded-md border border-slate-200 bg-slate-100 px-4 py-2.5 text-sm font-medium text-slate-500">
        Google login unavailable
      </button>
    );
  }

  return (
    <div className="w-full flex justify-center">
      <div ref={buttonRef} className={disabled ? 'pointer-events-none opacity-60' : ''} aria-label={label} />
    </div>
  );
}
