import { UserButton, auth, currentUser } from "@clerk/nextjs";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@risc0/ui/card";
import { Progress } from "@risc0/ui/progress";
import jwtDecode from "jwt-decode";
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

	if (!token) {
		redirect("/sign-in");
	}

	console.log("sessionClaims", sessionClaims);
	console.log("rest", rest);
	console.log("user", user);
	console.log("decoded", jwtDecode(token));

	return (
		<Card>
			<CardHeader>
				<Progress
					className="mb-4"
					value={calculateCompletionPercentage(
						AMOUNT_OF_STEPS,
						AMOUNT_OF_STEPS,
					)}
				/>

				<CardTitle>Prove with Bonsai</CardTitle>
				<CardDescription>
					Step {AMOUNT_OF_STEPS} / {AMOUNT_OF_STEPS}
				</CardDescription>
			</CardHeader>
			<CardContent>
				<UserButton />

				<Prove />
			</CardContent>
		</Card>
	);
}
