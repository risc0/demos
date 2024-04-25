"use client";

import { useEffect, useState } from "react";
import { default as ReactConfetti } from "react-confetti";
import useWindowSize from "react-use/lib/useWindowSize";

export function Confetti() {
  const { width, height } = useWindowSize();
  const [recycle, setRecycle] = useState<boolean>(true);
  const [mounted, setMounted] = useState<boolean>(false);

  useEffect(() => {
    setTimeout(() => {
      setRecycle(false);
    }, 2000);

    setMounted(true);
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
