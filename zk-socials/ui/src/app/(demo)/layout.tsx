import { Card, CardContent } from "@risc0/ui/card";
import { CodePreview } from "./_components/code-preview";
import { Header } from "./_components/header";

export default async function SharedLayout({ children }) {
	return (
		<div className="container mx-auto max-w-screen-xl flex flex-1 flex-col">
			<Header />

			<div className="mb-8 bg-muted py-6 px-8 rounded -mx-8">
				<h1 className="title">Proof of Account</h1>
				<p className="subtitle-sm text-muted-foreground">
					Easily link web2 data with on-chain accounts via zk proofs over
					oauth-authenticated API data
				</p>
			</div>

			<div className="gap-12 flex-1 grid grid-cols-5">
				<div className="col-span-3">
					<h2 className="title-sm">The Code</h2>
					<h3 className="pb-2 text-xs text-muted-foreground">
						zkvm guest code
					</h3>
					<Card className="bg-neutral-950 dark:bg-transparent">
						<CardContent>
							<CodePreview />
						</CardContent>
					</Card>
				</div>

				<div className="col-span-2">
					<h2 className="title-sm">The Demo</h2>
					<h3 className="pb-2 text-xs text-muted-foreground">The fun part</h3>

					{children}
				</div>
			</div>
		</div>
	);
}
