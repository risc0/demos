import React, { useState, useCallback } from "react";
import Account from "./Account";

interface ProveProps {
  disabled: boolean;
  email: string | null;
}

const Prove: React.FC<ProveProps> = ({ disabled, email }) => {
  const [isLoading, setIsLoading] = useState(false);

  const { VITE_API_HOST } = import.meta.env;

  const handleClick = useCallback(async () => {
    setIsLoading(true);

    const jwtCookie = document.cookie
      .split("; ")
      .find((row) => row.startsWith("jwt="));
    const jwt = jwtCookie?.split("=")[1];

    if (!jwt) {
      console.error("JWT not found");
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch(`${VITE_API_HOST}/auth`, {
        method: "GET",
        headers: {
          'X-Auth-Token': jwt
        },
      });

      if (response.ok) {
        const data = await response.body;
        // Handle your response data here
        console.log("Success:", data);
      } else {
        throw new Error('Response not OK');
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setIsLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      <button onClick={handleClick} disabled={isLoading || disabled}>
        {isLoading ? "Proving..." : "Prove with Bonsai™"}
      </button>
      {isLoading && <p>This will take a couple of minutes...</p>}
      <Account email={email} disabled={disabled} hideClaim={true} />
    </>
  );
};

export default Prove;