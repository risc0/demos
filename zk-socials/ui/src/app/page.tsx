import { UserButton, auth, useSession } from "@clerk/nextjs";
import { Button } from "@risc0/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@risc0/ui/card";
import jwtDecode from "jwt-decode";
import { redirect } from "next/navigation";
import { Prove } from "./_components/prove";
import { SignOutButton } from "./_components/sign-out-button";
import WalletConnect from "./_components/wallet-connect";

export default async function AppPage() {
	const { getToken, sessionClaims, ...rest } = auth();
	const token = await getToken();

	console.log("sessionClaims", sessionClaims);
	console.log("rest", rest);

	if (!token) {
		redirect("/sign-in");
	}

	console.log("decoded", jwtDecode(token));

	return (
		<div className="container mx-auto max-w-screen-sm py-10 flex justify-center flex-col flex-1">
			<Card>
				<CardHeader>
					<UserButton />
					<CardTitle>Proof of Account</CardTitle>
					<CardDescription>
						Easily link web2 data with on-chain accounts via zk proofs over
						oauth-authenticated API data.
					</CardDescription>
				</CardHeader>
				<CardContent>
					<SignOutButton />

					<Prove />
				</CardContent>
				<CardFooter className="flex justify-between">
					<Button variant="outline">Cancel</Button>
					<Button>Deploy</Button>
				</CardFooter>
			</Card>
		</div>
	);
}
