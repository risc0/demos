import { Badge } from "@risc0/ui/badge";
import { Card, CardContent } from "@risc0/ui/card";
import { Separator } from "@risc0/ui/separator";
import { CodePreview } from "./_components/code-preview";
import { Footer } from "./_components/footer";
import { Header } from "./_components/header";
import { SignOutButton } from "./_components/sign-out-button";

export default function SharedLayout({ children }) {
  return (
    <div className="container mx-auto flex max-w-screen-xl flex-1 flex-col">
      <Header />

      <div className="pb-2">
        <h1 className="title">Proof of Account</h1>
        <p className="subtitle-sm text-muted-foreground">
          Easily link web2 data with on-chain accounts via zk proofs over oauth-authenticated API data
        </p>
      </div>

      <Separator className="mb-6" decorative />

      <div className="flex flex-1 flex-col-reverse gap-8 lg:flex-row">
        <div className="flex flex-1 flex-col">
          <h2 className="subtitle min-h-10">👨‍💻 The zkVM Guest Code</h2>
          <div className="text-xs text-muted-foreground pb-2">
            The RISC Zero zkVM enables enables developers to write simple programs in vanilla Rust, instead of
            specialized languages for writing circuits. This gives developers the power of Rust crates, control flow and
            other conveniences of general purpose languages as demonstrated in the simple example program below. In just
            a few lines of code, a JWT is verified using the open source{" "}
            <Badge variant="secondary" className="text-[10px] p-0 px-1 font-normal font-mono">
              oidc_validator
            </Badge>{" "}
            crate.
          </div>

          <Card
            className="overflow-auto rounded-lg bg-neutral-950 shadow-xl dark:bg-inherit"
            style={{ colorScheme: "dark" }}
          >
            <CardContent>
              <CodePreview />
            </CardContent>
          </Card>
        </div>

        <div className="w-full max-w-unset lg:max-w-[520px]">
          <div className="flex min-h-10 flex-row items-center justify-between gap-4 pb-2">
            <h2 className="subtitle">💅 The Demo</h2>

            <SignOutButton />
          </div>
          <p className="text-xs text-muted-foreground pb-2">
            Try out the program and generate an example proof that links your Ethereum address to your Google account.
          </p>

          {children}
        </div>
      </div>

      <Footer />
    </div>
  );
}
