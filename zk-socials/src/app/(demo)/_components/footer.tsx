import Link from "next/link";

export function Footer() {
  return (
    <div className="space-x-2 pt-12 pb-6 text-center text-muted-foreground text-xs">
      <span>
        Built by{" "}
        <Link className="link text-muted-foreground" href="https://www.risczero.com" target="_blank">
          RISC Zero
        </Link>
      </span>
      <span>•</span>
      <Link target="_blank" className="link text-muted-foreground" href="https://dev.risczero.com/api/">
        Docs
      </Link>
      <span>•</span>
      <Link target="_blank" className="link text-muted-foreground" href="https://github.com/risc0/risc0/">
        GitHub
      </Link>
    </div>
  );
}
