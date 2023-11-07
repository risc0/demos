import React, { useState, useCallback } from "react";
import Account from "./Account";

interface ProveProps {
  disabled: boolean;
  email: string | null;
}

const Prove: React.FC<ProveProps> = (props) => {
  const { disabled, email } = props;
  const [isLoading, setIsLoading] = useState(false);

  const { VITE_API_HOST } = import.meta.env;

  const handleClick = useCallback(async () => {
    setIsLoading(true); 

    // Initialize a WebSocket connection
    const socket = new WebSocket(VITE_API_HOST);
    const jwtCookie = document.cookie
      .split("; ")
      .find((row) => row.startsWith("jwt="));
    const jwt = jwtCookie?.split("=")[1];

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const openHandler = (_event: Event) => {
      const message = JSON.stringify({ jwt });
      socket.send(message);
    };

    const messageHandler = (event: MessageEvent) => {
      document.cookie = `snark=${event.data}`; 
      setIsLoading(false); 
    };

    const errorHandler = (event: Event) => {
      console.error("WebSocket error: ", event);
      setIsLoading(false); // Set loading state to false if an error occurs
    };

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const closeHandler = (_event: CloseEvent) => {
      setIsLoading(false); // Set loading state to false when the socket is closed
    };

    // Setup WebSocket event listeners
    socket.addEventListener("open", openHandler);
    socket.addEventListener("message", messageHandler);
    socket.addEventListener("error", errorHandler);
    socket.addEventListener("close", closeHandler);

    // Clean up the event listeners when the component unmounts or if the WebSocket closes
    return () => {
      socket.removeEventListener("open", openHandler);
      socket.removeEventListener("message", messageHandler);
      socket.removeEventListener("error", errorHandler);
      socket.removeEventListener("close", closeHandler);
    };
  }, []);

  return (
    <>
      <button onClick={handleClick} disabled={isLoading || disabled}>
        {isLoading ? "Loading..." : "Prove with Bonsai™"}
      </button>
      <Account email={email} disabled={disabled} hideClaim={true} />
    </>
  );
};

export default Prove;
