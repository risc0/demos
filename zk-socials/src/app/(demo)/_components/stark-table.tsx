import formatters from "@poppinss/intl-formatter";
import { Button } from "@risc0/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@risc0/ui/table";
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
          {isSuccess && <TableHead className="truncate">Receipt URL</TableHead>}
          {!isSuccess && <TableHead className="truncate">Error Message</TableHead>}
          <TableHead className="truncate text-right">Stats</TableHead>
          <TableHead className="truncate text-right">Ellapsed Time</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        <TableRow>
          <TableCell>{capitalize(toLowerCase(starkData.status))}</TableCell>
          {isSuccess && (
            <TableCell>
              <Link href={starkData.receipt_url}>
                <Button size="sm" startIcon={<DownloadIcon />}>
                  Download
                </Button>
              </Link>
            </TableCell>
          )}
          {!isSuccess && <TableCell>{starkData.error_msg ?? "-"}</TableCell>}
          <TableCell>
            <div className="flex flex-col items-end">
              <span>
                <span className="text-muted-foreground">segments</span>{" "}
                {formatters.number("en-US").format(starkData.stats?.segments)}
              </span>
              <span>
                <span className="text-muted-foreground">cycles</span>{" "}
                {formatters.number("en-US").format(starkData.stats?.cycles)}
              </span>
              <span>
                <span className="text-muted-foreground">total cycles</span>{" "}
                {formatters.number("en-US").format(starkData.stats?.total_cycles)}
              </span>
            </div>
          </TableCell>
          <TableCell className="text-right">{starkData.elapsed_time}s</TableCell>
        </TableRow>
      </TableBody>
    </Table>
  );
}
