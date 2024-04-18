import { UserProfile, auth, currentUser } from "@clerk/nextjs";
import { Alert, AlertDescription, AlertTitle } from "@risc0/ui/alert";
import { Avatar, AvatarFallback, AvatarImage } from "@risc0/ui/avatar";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@risc0/ui/card";
import { Progress } from "@risc0/ui/progress";
import { RocketIcon } from "lucide-react";
import { redirect } from "next/navigation";
import { Prove } from "./_components/prove";
import {
	AMOUNT_OF_STEPS,
	calculateCompletionPercentage,
} from "./_utils/calculate-completion-percentage";

export default async function AppPage() {
	const { getToken, sessionClaims, ...rest } = auth();
	const user = await currentUser();
	const token = await getToken();
	const currentStep = sessionClaims?.nonce ? 3 : 2;

	console.log("user", user);
	console.log("rest", rest);
	console.log("sessionClaims", sessionClaims);

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
					<UserProfile />
				) : (
					<>
						<p className="text-xs mb-3 break-all">
							You are about to prove that address{" "}
							<strong>{sessionClaims?.nonce}</strong> owns the following social
							account(s):
						</p>

						{user?.externalAccounts.map(
							({
								imageUrl,
								firstName,
								username,
								id,
								provider,
								emailAddress,
							}) => (
								<Alert key={id} className="flex flex-row gap-4 items-center">
									<Avatar className="size-16">
										<AvatarImage src={imageUrl} alt={username} />
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

						<div className="mt-8">
							<Prove />
						</div>
					</>
				)}
			</CardContent>
		</Card>
	);
}
