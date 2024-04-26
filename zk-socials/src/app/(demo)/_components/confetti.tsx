"use client";

import { useMounted } from "@risc0/ui/hooks/use-mounted";
import { useEffect, useState } from "react";
import { default as ReactConfetti } from "react-confetti";
import useWindowSize from "react-use/lib/useWindowSize";

export function Confetti() {
  const { width, height } = useWindowSize();
  const mounted = useMounted();
  const [recycle, setRecycle] = useState<boolean>(true);

  useEffect(() => {
    setTimeout(() => {
      setRecycle(false);
    }, 2000);
  }, []);

  return mounted ? (
    <ReactConfetti
      recycle={recycle}
      numberOfPieces={500}
      gravity={0.05}
      style={{ inset: "-16px" }}
      width={width}
      height={height}
    />
  ) : null;
}
