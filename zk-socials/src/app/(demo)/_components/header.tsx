import { Button } from "@risc0/ui/button";
import { GithubIcon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { ThemeToggle } from "~/client/theme/theme-toggle";

export function Header() {
  return (
    <div className="flex flex-row justify-between pt-8 pb-5">
      <Link href="https://risczero.com" className="flex flex-col gap-2 transition-opacity hover:opacity-70">
        <Image width={59} height={43} src="/risczero.svg" alt="RISC Zero" className="dark:invert dark:invert-1" />

        <h1 className="truncate text-[10px] text-primary">Demos</h1>
      </Link>

      <div className="flex flex-row justify-end gap-2">
        <div>
          <ThemeToggle />
        </div>

        <Link tabIndex={-1} target="_blank" href="https://github.com/risc0/risc0/">
          <Button variant="outline" size="sm" className="hidden sm:flex" startIcon={<GithubIcon />}>
            GitHub
          </Button>
          <Button variant="outline" className="flex sm:hidden" size="icon-sm" startIcon={<GithubIcon />}>
            <span className="sr-only">GitHub</span>
          </Button>
        </Link>
      </div>
    </div>
  );
}
