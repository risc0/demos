import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@risc0/ui/table";
import { capitalize, toLowerCase } from "string-ts";

export function SnarkTable({ snarkData }) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="truncate">Status</TableHead>
          <TableHead className="truncate">Output</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        <TableRow>
          <TableCell>{capitalize(toLowerCase(snarkData.status))}</TableCell>
          <TableCell>
            <pre className="whitespace-pre-wrap break-all font-mono text-[10px]">
              {JSON.stringify(snarkData.output)}
            </pre>
          </TableCell>
        </TableRow>
      </TableBody>
    </Table>
  );
}
