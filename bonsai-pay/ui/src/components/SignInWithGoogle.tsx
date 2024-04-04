import { useEffect } from "react";
import { useAccount } from "wagmi";

declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    google?: any; 
  }
}

export const SignInWithGoogle = ({ disabled }) => {
  const { VITE_GOOGLE_CLIENT_ID } = import.meta.env;
  const { address } = useAccount();

  useEffect(() => {
    // Ensure that the initGsi function is idempotent
    const initGsi = () => {
      if (window.google?.accounts) {
        // Clean up the existing button
        const existingButton = document.getElementById("googleSignInButton");
        if (existingButton) {
          existingButton.innerHTML = "";
        }

        // Initialize the button
        window.google.accounts.id.initialize({
          client_id: VITE_GOOGLE_CLIENT_ID,
          callback: handleCredentialResponse,
          nonce: address,
          scope: "email",
          auto_select: false,
          state: "hello",
        });

        // Render the button
        window.google.accounts.id.renderButton(
          document.getElementById("googleSignInButton"),
          { theme: "outline", size: "large" }
        );
      }
    };

    // Create a script to load Google's accounts library
    const createScript = () => {
      const script = document.createElement("script");
      script.src = "https://accounts.google.com/gsi/client";
      script.async = true;
      script.defer = true;
      script.onload = () => {
        // Call initGsi on script load
        initGsi();
      };
      document.body.appendChild(script);
    };

    // Check if Google's accounts library is available
    if (window.google?.accounts) {
      initGsi();
    } else {
      createScript();
    }

    return () => {
      const script = document.querySelector(
        'script[src="https://accounts.google.com/gsi/client"]'
      );
      if (script) {
        script.remove();
      }
      initGsi();
    };
  }, [VITE_GOOGLE_CLIENT_ID, address]);

  const handleCredentialResponse = async (response) => {
    const { credential } = response;

    document.cookie = `jwt=${credential}; path=/; samesite=Strict`;
  };

  return (
    <div className="sign-in-container">
      <button
        className="gsi-btn"
        id="googleSignInButton"
        onClick={() => {}}
        disabled={disabled}
      ></button>
    </div>
  );
};
