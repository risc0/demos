import { useEffect, useState, useRef } from "react";
import { useAccount } from "wagmi";
import Cookies from 'js-cookie';

export const SignInWithIDme = function(disabled) {
  const { VITE_IDME_CLIENT_ID, VITE_REDIRECT_URI } = import.meta.env;
  const { address } = useAccount();
  const [userData, setUserData] = useState(null);
  const [error, setError] = useState(null);

  const getQueryParam = (param: any) => {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(param);
  };

 const hasRun = useRef(false);

  useEffect(() => {
        if (hasRun.current) return;
    hasRun.current = true;
    const code = getQueryParam('code');
    if (code) {
      const postUrl = '/api/auth'; // Proxy endpoint to exchange code for token

      fetch(postUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ code }),
      })
      .then(() => {
        const accessToken = Cookies.get('session');
        if (!accessToken) {
          throw new Error('Session cookie not found');
        }
        // Use the session cookie as the access token
        return fetch('/api/attributes', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
          },
        });
      })
      .then(response => response.json())
      .then(userData => {
        setUserData(userData);
      })
      .catch(error => {
        console.error('Error:', error);
        setError(error);
      });
    }
  }, []);

  const endpoint = `https://groups.id.me/?client_id=${VITE_IDME_CLIENT_ID}&redirect_uri=${VITE_REDIRECT_URI}&response_type=code&scopes=alumni,employee,government,military,nurse,responder,student,teacher`;

  return (
    <div className="sign-in-container">
      <div className="idmebutton">
        {error && <div className='errorMessage'>{error.message}</div>}
        {userData ? (
          <div>
            <p>User Data: {JSON.stringify(userData)}</p>
          </div>
        ) : (
          <a href={endpoint} aria-disabled={disabled}>
            <img src="https://developers.id.me/assets/buttons/verify-32b84e457998bb752606ed89415338ec7aec19954ee1d3d4bfa002dd307ad433.svg" />
          </a>
        )}
      </div>
    </div>
  );
}

