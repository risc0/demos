import { auth } from "@clerk/nextjs";
import { Button } from "@risc0/ui/button";
import {
	Card,
	CardContent,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@risc0/ui/card";
import { SignOutButton } from "./_components/sign-out-button";
import WalletConnect from "./_components/wallet-connect";

export default function AppPage() {
	const { ...rest } = auth();

	console.log("rest", rest);
	//const { user } = useUser();

	//console.log("user", user);

	return (
		<div className="container mx-auto max-w-screen-sm py-10 flex justify-center flex-col flex-1">
			<Card>
				<CardHeader>
					<CardTitle>Proof of Account</CardTitle>
				</CardHeader>
				<CardContent>
					<SignOutButton />

					<WalletConnect />
				</CardContent>
				<CardFooter className="flex justify-between">
					<Button variant="outline">Cancel</Button>
					<Button>Deploy</Button>
				</CardFooter>
			</Card>
		</div>
	);
}
