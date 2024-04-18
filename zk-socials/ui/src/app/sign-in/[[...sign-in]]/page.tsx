import { SignIn } from "@clerk/nextjs";
import { Card, CardContent, CardHeader, CardTitle } from "@risc0/ui/card";

export default function SignInPage() {
	return (
		<div className="container mx-auto max-w-screen-sm py-10 flex justify-center flex-col flex-1">
			<Card>
				<CardHeader>
					<CardTitle>Proof of Account</CardTitle>
				</CardHeader>
				<CardContent>
					<SignIn />
				</CardContent>
			</Card>
		</div>
	);
}
