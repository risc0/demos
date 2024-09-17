"use client";

import { Alert, AlertDescription, AlertTitle } from "@risc0/ui/alert";
import { useLocalStorage } from "@risc0/ui/hooks/use-local-storage";
import { useEffect, useState } from "react";
import { ProveButton } from "./_components/prove-button";
import { SignInButton } from "./_components/sign-in-button";
import { Button } from "@risc0/ui/button";
import { cn } from "@risc0/ui/cn";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@risc0/ui/table";
import { DownloadIcon } from "lucide-react";
import Link from "next/link";
import { capitalize, toLowerCase } from "string-ts";

function StarkTable({ starkData }) {
	const isSuccess = starkData.status === "SUCCEEDED";

	return (
		<Table>
			<TableHeader>
				<TableRow>
					<TableHead className="truncate">Status</TableHead>
					{!isSuccess && (
						<TableHead className="truncate">Error Message</TableHead>
					)}
					<TableHead className="truncate text-right">Stats</TableHead>
					<TableHead className="truncate text-right">Elapsed Time</TableHead>
					{isSuccess && (
						<TableHead className="truncate text-right">Receipt URL</TableHead>
					)}
				</TableRow>
			</TableHeader>
			<TableBody>
				<TableRow>
					<TableCell>
						<span
							className={cn(
								starkData.status === "SUCCEEDED" &&
									"text-green-600 dark:text-green-500",
							)}
						>
							{capitalize(toLowerCase(starkData.status))}
						</span>
					</TableCell>
					{!isSuccess && <TableCell>{starkData.error_msg ?? "-"}</TableCell>}
					<TableCell>
						<div className="flex flex-col items-end">
							<span>
								<span className="text-muted-foreground">Segments:</span>{" "}
								{starkData.stats?.segments}
							</span>
							<span>
								<span className="text-muted-foreground">Cycles:</span>{" "}
								{starkData.stats?.cycles}
							</span>
							<span>
								<span className="text-muted-foreground">Total Cycles:</span>{" "}
								{starkData.stats?.total_cycles}
							</span>
						</div>
					</TableCell>
					<TableCell className="text-right">
						{starkData.elapsed_time}s
					</TableCell>
					{isSuccess && (
						<TableCell className="text-right">
							<Link href={starkData.receipt_url}>
								<Button size="sm" startIcon={<DownloadIcon />}>
									Download
								</Button>
							</Link>
						</TableCell>
					)}
				</TableRow>
			</TableBody>
		</Table>
	);
}

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
