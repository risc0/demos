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
import {
	AMOUNT_OF_STEPS,
	calculateCompletionPercentage,
} from "../_utils/calculate-completion-percentage";
import { Prove } from "./prove";
import { WalletOptions } from "./wallet-options";

export function Steps() {
	const { address } = useAccount();
	const [mounted, setMounted] = useState<boolean>(false);
	const [currentStep, setCurrentStep] = useState<number>(2);

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

	return (
		<Card>
			<CardHeader>
				<Progress
					className="mb-4"
					value={
						mounted
							? calculateCompletionPercentage(currentStep, AMOUNT_OF_STEPS)
							: 0
					}
				/>

				{mounted ? (
					<CardTitle>
						{currentStep === 2 ? "Connect your wallet" : "Prove with Bonsai"}
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
				{mounted && (currentStep === 2 ? <WalletOptions /> : <Prove />)}
			</CardContent>
		</Card>
	);
}
