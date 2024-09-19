"use client";

import { useCallback, useState } from "react";
import { useSocialsLocalStorage } from "./use-socials";

const LINKEDIN_CLIENT_ID = "78mnvddaf35fh5";
const LINKEDIN_REDIRECT_URI = window.location.origin;

export function useLinkedInAuth({ address }: { address: `0x${string}` }) {
  const { setLinkedInUserToken, setLinkedInUserInfos } = useSocialsLocalStorage({ address });
  const [error, setError] = useState<string | null>(null);

  const signInWithLinkedIn = useCallback(() => {
    const state = address;

    const authUrl = new URL("https://www.linkedin.com/oauth/v2/authorization");
    authUrl.searchParams.append("response_type", "code");
    authUrl.searchParams.append("client_id", LINKEDIN_CLIENT_ID);
    authUrl.searchParams.append("redirect_uri", LINKEDIN_REDIRECT_URI);
    authUrl.searchParams.append("state", state);
    authUrl.searchParams.append("scope", "r_liteprofile r_emailaddress");

    window.location.href = authUrl.toString();
  }, [address]);

  const handleLinkedInAuthCallback = useCallback(
    async (code: string) => {
      try {
        const response = await fetch("https://zkauth.vercel.app/api/linkedin/get-token", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ code }),
        });

        if (!response.ok) {
          setError("Failed to authenticate with LinkedIn");
          return;
        }

        const { jwt, email, profilePictureUrl, firstName, lastName } = await response.json();

        setLinkedInUserInfos({ email, profilePictureUrl, firstName, lastName });

        if (jwt) {
          setLinkedInUserToken(jwt);
        }
      } catch (err) {
        setError("Failed to authenticate with LinkedIn");
        console.error(err);
      }
    },
    [setLinkedInUserInfos, setLinkedInUserToken],
  );

  return {
    error,
    signInWithLinkedIn,
    handleLinkedInAuthCallback,
  };
}
