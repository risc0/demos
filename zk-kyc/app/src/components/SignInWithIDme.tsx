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
    if (hasRun.current) return;
    hasRun.current = true;
    const code = getQueryParam("code");
    if (code) {
      const postUrl = "/api/auth"; // Proxy endpoint to exchange code for token

      fetch(postUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ code }),
      })
        .then((res) => {
          const token = Cookies.get("id_token");
          const decoded = jwtDecode(token);

          setUserData(decoded);
          onUserData(decoded);
        })
        .finally(() => onNext())
        .catch((error) => {
          console.error("Error:", error);
          setError(error);
        });
    }
  }, []);

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
    </div>
  );
};

export default SignInWithIDme;
