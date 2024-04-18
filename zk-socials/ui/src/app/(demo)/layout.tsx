import { Card, CardContent } from "@risc0/ui/card";
import { Separator } from "@risc0/ui/separator";
import { CodePreview } from "./_components/code-preview";
import { Footer } from "./_components/footer";
import { Header } from "./_components/header";

export default function SharedLayout({ children }) {
	return (
		<div className="container mx-auto flex max-w-screen-xl flex-1 flex-col">
			<Header />

			<div className="pb-2">
				<h1 className="title">Proof of Account</h1>
				<p className="subtitle-sm text-muted-foreground">
					Easily link web2 data with on-chain accounts via zk proofs over
					oauth-authenticated API data
				</p>
			</div>
			<Separator className="mb-8" />

			<div className="grid flex-1 grid-cols-5 gap-16">
				<div className="col-span-3">
					<div className="flex flex-row gap-4 pb-2 items-baseline">
						<h2 className="subtitle">The Code</h2>
						<h3 className="text-muted-foreground text-xs">- zkvm guest code</h3>
					</div>
					<Card>
						<CardContent>
							<CodePreview />
						</CardContent>
					</Card>
				</div>

				<div className="col-span-2">
					<div className="flex flex-row gap-4 pb-2 items-baseline">
						<h2 className="subtitle">The Demo</h2>
						<h3 className="text-muted-foreground text-xs">- the fun part</h3>
					</div>

					{children}
				</div>
			</div>

			<Footer />
		</div>
	);
}
