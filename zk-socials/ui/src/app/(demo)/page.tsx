import { UserProfile, auth, clerkClient, currentUser } from "@clerk/nextjs";
import { Alert, AlertDescription } from "@risc0/ui/alert";
import { Avatar, AvatarImage } from "@risc0/ui/avatar";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@risc0/ui/card";
import { Progress } from "@risc0/ui/progress";
import { redirect } from "next/navigation";
import { CreateWalletLinking } from "./_components/create-wallet-linking";
import { Listener } from "./_components/listener";
import { Prove } from "./_components/prove";
import {
	AMOUNT_OF_STEPS,
	calculateCompletionPercentage,
} from "./_utils/calculate-completion-percentage";

export default async function AppPage() {
	const { getToken, sessionClaims } = auth();
	const user = await currentUser();
	const token = await getToken();
	const currentStep = sessionClaims?.nonce ? 3 : 2;

	console.log("HERE!", user);
	console.log("sessionClaims!", sessionClaims);

	if (!token) {
		redirect("/sign-in");
	}

	return (
		<Card>
			<CardHeader>
				<Progress
					className="mb-4"
					value={calculateCompletionPercentage(currentStep, AMOUNT_OF_STEPS)}
				/>

				<CardTitle>
					{currentStep === 2 ? "Connect your wallet" : "Prove with Bonsai"}
				</CardTitle>
				<CardDescription>
					Step {currentStep} / {AMOUNT_OF_STEPS}
				</CardDescription>
			</CardHeader>

			<CardContent>
				{currentStep === 2 ? (
					<Listener>
						<UserProfile />
					</Listener>
				) : (
					<>
						<p className="mb-3 break-all text-xs">
							You are about to prove that address{" "}
							<strong>{sessionClaims?.nonce}</strong> owns the following social
							account(s):
						</p>

						<div className="space-y-3">
							{user?.externalAccounts.map(
								({ imageUrl, username, id, provider, emailAddress }) => (
									<Alert
										key={id}
										className="flex flex-row items-center gap-4 bg-neutral-900 p-5"
									>
										<Avatar className="size-16">
											<AvatarImage
												src={imageUrl}
												alt={username ?? "user avatar"}
											/>
										</Avatar>
										<AlertDescription>
											<p className="font-bold text-xl">{username}</p>
											<p className="text-muted-foreground text-sm">
												{emailAddress}
											</p>
											<p className="font-mono text-[10px]">{provider}</p>
										</AlertDescription>
									</Alert>
								),
							)}
						</div>

						<code className="break-all text-[8px]">
							{JSON.stringify(sessionClaims)}
						</code>

						<div className="mt-8">
							<Prove />
						</div>
					</>
				)}
			</CardContent>
		</Card>
	);
}
