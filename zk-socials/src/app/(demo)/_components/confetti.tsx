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
    <div className="pointer-events-none fixed inset-0 z-10">
      <ReactConfetti recycle={recycle} numberOfPieces={500} gravity={0.05} width={width} height={height} />
    </div>
  ) : null;
}
