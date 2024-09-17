import { useEffect } from "react";

export function useZkAuth() {
  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://unpkg.com/@risc0/zkauth@latest/dist/index.js";
    script.async = true;
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);
}
