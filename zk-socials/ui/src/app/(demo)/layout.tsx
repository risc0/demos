import { Card, CardContent } from "@risc0/ui/card";
import { CodePreview } from "./_components/code-preview";
import { Header } from "./_components/header";

export default function SharedLayout({ children }) {
  return (
    <div className="container mx-auto flex max-w-screen-xl flex-1 flex-col">
      <Header />

      <div className="-mx-8 mb-8 rounded bg-muted px-8 py-6">
        <h1 className="title">Proof of Account</h1>
        <p className="subtitle-sm text-muted-foreground">
          Easily link web2 data with on-chain accounts via zk proofs over oauth-authenticated API data
        </p>
      </div>

      <div className="grid flex-1 grid-cols-5 gap-12">
        <div className="col-span-3">
          <h2 className="title-sm">The Code</h2>
          <h3 className="pb-2 text-muted-foreground text-xs">zkvm guest code</h3>
          <Card className="bg-neutral-950 dark:bg-transparent">
            <CardContent>
              <CodePreview />
            </CardContent>
          </Card>
        </div>

        <div className="col-span-2">
          <h2 className="title-sm">The Demo</h2>
          <h3 className="pb-2 text-muted-foreground text-xs">The fun part</h3>

          {children}
        </div>
      </div>
    </div>
  );
}
