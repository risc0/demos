import { useEffect, useState } from "react";
import { Auth } from "aws-amplify";
import { useAccount } from "wagmi";

declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    AppleID?: any; 
  }
}

export const SignInWithApple = ({ disabled }) => {
  const { address } = useAccount();
  const [appleAuth, setAppleAuth] = useState(null);

  useEffect(() => {
    const loadAppleAuthScript = () => {
      if (!window.AppleID) {
        const script = document.createElement("script");
        script.src =
          "https://appleid.cdn-apple.com/appleauth/static/jsapi/appleid/1/en_US/appleid.auth.js";
        script.onload = initializeAppleSignIn;
        document.body.appendChild(script);
      } else {
        initializeAppleSignIn();
      }
    };

    loadAppleAuthScript();
  });

  const initializeAppleSignIn = () => {
    const { VITE_APPLE_SERVICE_ID, VITE_APPLE_REDIRECT_URI } = import.meta.env;
    if (window.AppleID) {
      try {
        setAppleAuth(
          window.AppleID.auth.init({
            clientId: VITE_APPLE_SERVICE_ID,
            scope: "email",
            redirectURI: VITE_APPLE_REDIRECT_URI,
            state: address,
            usePopup: false,
          })
        );
      } catch (error) {
        console.error("Error initializing Apple Sign In:", error);
      }
    }
  };

  useEffect(() => {
    const onSignInSuccess = (event) => {
      handleAppleResponse(event.detail.data);
    };

    const onSignInFailure = (event) => {
      console.error("Apple sign in failed:", event.detail.error);
    };

    window.addEventListener("AppleIDSignInOnSuccess", onSignInSuccess);
    window.addEventListener("AppleIDSignInOnFailure", onSignInFailure);

    return () => {
      window.removeEventListener("AppleIDSignInOnSuccess", onSignInSuccess);
      window.removeEventListener("AppleIDSignInOnFailure", onSignInFailure);
    };
  }, []);

  const handleAppleResponse = async (response) => {
    console.log("Apple sign in response received:", response);
    const { authorization } = response;
    const { id_token: idToken } = authorization;

    try {
      const awsUser = await Auth.federatedSignIn(
        "appleid.apple.com",
        { token: idToken, expires_at: authorization.expires_at },
        {
          name: `${response.user.name.firstName} ${response.user.name.lastName}`,
        }
      );
      console.log("AWS Amplify user:", awsUser);
    } catch (error) {
      console.error("Error signing in with Apple:", error);
    }
  };

  useEffect(() => {
    if (appleAuth && document.getElementById("appleid-signin")) {
      window.AppleID.auth.renderButton({
        element: "#appleid-signin",
        theme: "black", // or 'white'
        type: "sign in", 
        border: true,
        disabled: disabled,
      });
    }
  }, [appleAuth, disabled]);

  return (
    <div className="sign-in-container">
      <div className="asi-btn" id="appleid-signin"></div>
    </div>
  );
};

