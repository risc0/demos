"use client";

import { Alert, AlertDescription, AlertTitle } from "@risc0/ui/alert";
import { useLocalStorage } from "@risc0/ui/hooks/use-local-storage";
import { useEffect, useState } from "react";
import { ProveButton } from "./_components/prove-button";
import { SignInButton } from "./_components/sign-in-button";
import { SnarkTable } from "./_components/snark-table";
import { StarkTable } from "./_components/stark-table";

export default function AppPage() {
	const address = "0xeB4Fc761FAb7501abe8cD04b2d831a45E8913DdF"; // @todo: replace with the address of the user
	const [googleUserToken] = useLocalStorage("google-token", null);
	const [currentStep, setCurrentStep] = useState<number>(1);
	const [starkResults] = useLocalStorage<any | undefined>(
		"stark-results",
		undefined,
	);
	const [snarkResults] = useLocalStorage<any | undefined>(
		"snark-results",
		undefined,
	);

	useEffect(() => {
		if (!googleUserToken) {
			setCurrentStep(2);
			return;
		}

		if (starkResults || snarkResults) {
			setCurrentStep(4);
			return;
		}

		setCurrentStep(3);
	}, [address, googleUserToken, starkResults, snarkResults]);

	console.log(currentStep);

	return currentStep === 2 ? (
		<SignInButton />
	) : currentStep === 3 ? (
		<ProveButton />
	) : (
		<>
			{starkResults && (
				<Alert className="border-none px-0">
					<AlertTitle>STARK Results</AlertTitle>
					<AlertDescription className="rounded border bg-neutral-50 dark:bg-neutral-900">
						<StarkTable starkData={starkResults} />
					</AlertDescription>
				</Alert>
			)}

			{snarkResults && (
				<Alert className="border-none px-0 pb-0">
					<AlertTitle>SNARK Results</AlertTitle>
					<AlertDescription className="rounded border bg-neutral-50 dark:bg-neutral-900">
						<SnarkTable snarkData={snarkResults} />
					</AlertDescription>
				</Alert>
			)}
		</>
	);
}
