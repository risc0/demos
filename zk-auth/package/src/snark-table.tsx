import { cn } from "@risc0/ui/cn";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@risc0/ui/table";
import { capitalize, toLowerCase } from "string-ts";
import { DownloadButton } from "./download-button";

export function SnarkTable({ snarkData }: any) {
	return (
		<Table>
			<TableHeader>
				<TableRow>
					<TableHead className="truncate">Status</TableHead>
					<TableHead className="truncate text-right">Output</TableHead>
				</TableRow>
			</TableHeader>
			<TableBody>
				<TableRow>
					<TableCell>
						<span
							className={cn(
								snarkData.status === "SUCCEEDED" &&
									"text-green-600 dark:text-green-500",
							)}
						>
							{capitalize(toLowerCase(snarkData.status))}
						</span>
					</TableCell>
					<TableCell className="text-right">
						<DownloadButton snarkData={snarkData} />
					</TableCell>
				</TableRow>
			</TableBody>
		</Table>
	);
}
