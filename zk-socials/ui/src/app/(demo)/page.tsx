"use client";

import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@risc0/ui/card";
import { Progress } from "@risc0/ui/progress";
import { Skeleton } from "@risc0/ui/skeleton";
import { useEffect, useState } from "react";
import { useAccount } from "wagmi";
import { ConnectWalletButton } from "./_components/connect-wallet-button";
import { ProveButton } from "./_components/prove-button";
import SignInButton from "./_components/sign-in-button";
import { useLocalStorage } from "./_hooks/useLocalStorage";
import {
	AMOUNT_OF_STEPS,
	calculateCompletionPercentage,
} from "./_utils/calculate-completion-percentage";

export default function AppPage() {
	const { address } = useAccount();
	const [user] = useLocalStorage("google-profile", null);
	const [mounted, setMounted] = useState<boolean>(false);
	const [currentStep, setCurrentStep] = useState<number>(1);

	useEffect(() => {
		if (address && currentStep === 2) {
			setCurrentStep(3);
		} else if (!address && currentStep === 3) {
			setCurrentStep(2);
		}
	}, [address, currentStep]);

	useEffect(() => {
		setMounted(true);
	}, []);

	useEffect(() => {
		if (user && currentStep === 1) {
			setCurrentStep(2);
		} else if (!user && currentStep !== 1) {
			setCurrentStep(1);
		}
	}, [user, currentStep]);

	return (
		<Card>
			<CardHeader>
				<Progress
					className="mb-4"
					value={
						mounted
							? calculateCompletionPercentage(currentStep - 1, AMOUNT_OF_STEPS)
							: 0
					}
				/>

				{mounted ? (
					<CardTitle>
						{currentStep === 1
							? "Sign In with Social Account"
							: currentStep === 2
								? "Connect your Wallet"
								: "Prove with Bonsai™"}
					</CardTitle>
				) : (
					<Skeleton className="h-4 w-40" />
				)}

				{mounted ? (
					<CardDescription>
						Step {currentStep} / {AMOUNT_OF_STEPS}
					</CardDescription>
				) : (
					<Skeleton className="h-5 w-20" />
				)}
			</CardHeader>

			<CardContent>
				{mounted &&
					(currentStep === 1 ? (
						<SignInButton />
					) : currentStep === 2 ? (
						<ConnectWalletButton />
					) : (
						<ProveButton />
					))}
			</CardContent>
		</Card>
	);
}
