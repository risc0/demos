import { useEffect, useState, useRef } from "react";
import { useAccount } from "wagmi";
import Cookies from "js-cookie";
import jwtDecode from "jwt-decode";

const SignInWithIDme = function ({ disabled, onNext, onUserData }) {
  const { VITE_IDME_CLIENT_ID, VITE_REDIRECT_URI } = import.meta.env;
  const { address } = useAccount();
  const [userData, setUserData] = useState(null);
  const [error, setError] = useState(null);

  const getQueryParam = (param) => {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(param);
  };

  const hasRun = useRef(false);

  useEffect(() => {
    const authenticateUser = async () => {
      try {
        if (hasRun.current) return;
        hasRun.current = true;

        const code = getQueryParam("code");
        if (!code) return;

        const postUrl = "/api/auth"; // Proxy endpoint to exchange code for token
        const response = await fetch(postUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ code }),
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const token = Cookies.get("id_token");
        if (!token) {
          throw new Error("Token not found");
        }

        const decoded = jwtDecode(token);
        setUserData(decoded);
        onUserData(decoded);

        if (token) {
          onNext();
        }
      } catch (error) {
        console.error("Authentication Error:", error);
        setError(error);
      }
    };

    authenticateUser();
  }, [onNext, onUserData]);

  const authEndpoint = `https://api.idmelabs.com/oauth/authorize?client_id=${VITE_IDME_CLIENT_ID}&redirect_uri=${VITE_REDIRECT_URI}&response_type=code&scope=openid%20identity&nonce=${address}`;

  return (
    <div className="sign-in-container">
      <div className="idmebutton">
        {error && <div className="errorMessage">{error.message}</div>}
        {userData ? (
          <div>
            <p>User Data: {JSON.stringify(userData)}</p>
          </div>
        ) : (
          <a href={authEndpoint} aria-disabled={disabled}>
            <img src="https://developers.id.me/assets/buttons/verify-32b84e457998bb752606ed89415338ec7aec19954ee1d3d4bfa002dd307ad433.svg" />
          </a>
        )}
      </div>
          <p className="whoisidme">
            🔒 Verification by ID.me • <a href="https://www.id.me/about">
            What is ID.me? 
            </a>
          </p>
    </div>
  );
};

export default SignInWithIDme;
