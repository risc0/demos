import { ThemeToggle } from "~/client/theme/theme-toggle";

export default function Home() {
	return (
		<div className="container mx-auto max-w-screen-lg py-8">
			<div className="flex flex-row justify-between gap-8">
				<h1 className="title">Proof of Account</h1>
				<ThemeToggle />
			</div>
		</div>
	);
}
