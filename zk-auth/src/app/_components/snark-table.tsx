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
import { capitalize, toLowerCase } from "string-ts";

function DownloadButton({ snarkData }) {
	const handleDownload = () => {
		const dataStr = `data:text/json;charset=utf-8,${encodeURIComponent(JSON.stringify(snarkData.output))}`;
		const downloadAnchorNode = document.createElement("a");
		downloadAnchorNode.setAttribute("href", dataStr);
		downloadAnchorNode.setAttribute(
			"download",
			`snark_data_${new Date().toLocaleDateString()}.json`,
		);
		document.body.appendChild(downloadAnchorNode); // required for firefox
		downloadAnchorNode.click();
		downloadAnchorNode.remove();
	};

	return (
		<Button size="sm" startIcon={<DownloadIcon />} onClick={handleDownload}>
			Download
		</Button>
	);
}

export function SnarkTable({ snarkData }) {
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
