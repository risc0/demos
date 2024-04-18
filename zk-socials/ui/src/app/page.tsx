import Image from "next/image";
import { ThemeToggle } from "~/client/theme/theme-toggle";

export default function Home() {
	return (
		<div className="container mx-auto max-w-screen-lg py-8">
			<div className="flex flex-row justify-between gap-8">
				<h1 className="title">Proof of Account</h1>
				<ThemeToggle />
			</div>

			<Image
				src="/image.jpeg"
				alt="Proof of Account"
				width={400}
				height={400}
			/>
		</div>
	);
}
