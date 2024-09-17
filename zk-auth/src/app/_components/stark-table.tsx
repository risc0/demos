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

export function StarkTable({ starkData }) {
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
