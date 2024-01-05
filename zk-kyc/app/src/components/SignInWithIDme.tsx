import { useEffect } from "react";
import { useAccount } from "wagmi";

// declare global {
//   interface Window {
//     // eslint-disable-next-line @typescript-eslint/no-explicit-any
//     google?: any; // Use a more specific type if available
//   }
// }

export const SignInWithIDme = function(disabled) {
  const { VITE_IDME_CLIENT_ID, VITE_REDIRECT_URI } = import.meta.env;
  const { address } = useAccount();

  // useEffect(() => {
  //   const initGsi = () => {
  //     if (window.google?.accounts) {
  //       // Clean up the existing button
  //       const existingButton = document.getElementById("IDmeSignInButton");
  //       if (existingButton) {
  //         existingButton.innerHTML = "";
  //       }
  //
  //       // Initialize the button
  //       window.google.accounts.id.initialize({
  //         client_id: VITE_GOOGLE_CLIENT_ID,
  //         callback: handleCredentialResponse,
  //         nonce: address,
  //         scope: "email",
  //         auto_select: false,
  //         state: "hello",
  //       });
  //
  //       // Render the button
  //       window.google.accounts.id.renderButton(
  //         document.getElementById("IDmeSignInButton"),
  //         { theme: "outline", size: "large" }
  //       );
  //     }
  //   };
  //
  //   // Create a script to load Google's accounts library
  //   const createScript = () => {
  //     const script = document.createElement("script");
  //     script.src = "https://accounts.google.com/gsi/client";
  //     script.async = true;
  //     script.defer = true;
  //     script.onload = () => {
  //       // Call initGsi on script load
  //       initGsi();
  //     };
  //     document.body.appendChild(script);
  //   };
  //
  //   // Check if Google's accounts library is available
  //   if (window.google?.accounts) {
  //     initGsi();
  //   } else {
  //     createScript();
  //   }
  //
  //   return () => {
  //     const script = document.querySelector(
  //       'script[src="https://accounts.google.com/gsi/client"]'
  //     );
  //     if (script) {
  //       script.remove();
  //     }
  //     initGsi();
  //   };
  // }, [VITE_GOOGLE_CLIENT_ID, address]);
  //
  // const handleCredentialResponse = async (response) => {
  //   const { credential } = response;
  //
  //   document.cookie = `jwt=${credential}; path=/; samesite=Strict`;
  // };
  
  const endpoint = `https://api.idmelabs.com/oauth/authorize?client_id=${VITE_IDME_CLIENT_ID}&redirect_ uri=${VITE_REDIRECT_URI}&response_type=code&scope=openid%20identity&nonce=${address}`;

  return (
    <div className="sign-in-container">
    <div className="idmebutton">
      <div className='errorMessage'>
      </div>
      <a href={endpoint} aria-disabled={disabled}>
        <img src="https://developers.id.me/assets/buttons/verify-32b84e457998bb752606ed89415338ec7aec19954ee1d3d4bfa002dd307ad433.svg" />
      </a>
    </div>
    </div>
  );
}
