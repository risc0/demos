import { useEffect } from "react";
import { useAccount } from "wagmi";

export const SignInWithIDme = function(disabled) {
  const { VITE_IDME_CLIENT_ID, VITE_REDIRECT_URI } = import.meta.env;
  const { address } = useAccount();
  
  // const endpoint = `https://api.idmelabs.com/oauth/authorize?client_id=${VITE_IDME_CLIENT_ID}&redirect_ uri=${VITE_REDIRECT_URI}&response_type=code&scope=openid%20identity&nonce=${address}`;

 const endpoint =  `https://groups.id.me/?client_id=${VITE_IDME_CLIENT_ID}&redirect_uri=${VITE_REDIRECT_URI}&response_type=code&scopes=alumni,employee,government,military,nurse,responder,student,teacher`;

  
   useEffect(() => {
    // Function to parse query string and return the value for a given key
    const getQueryParam = (param) => {
      const urlParams = new URLSearchParams(window.location.search);
      return urlParams.get(param);
    };

    // Extract the code from URL query parameters
    const code = getQueryParam('code');

    if (code) {
      const postUrl = '/api'; // Using the proxy endpoint

      const body = JSON.stringify({ code });

      // Perform the POST request
      fetch(postUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: body,
      })
      .then(response => response.json())
      .then(data => {
        console.log('Success:', data);
      })
      .catch((error) => {
        console.error('Error:', error);
      });
    }
  }, []);

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
