import { Button } from "@risc0/ui/button";
import { DownloadIcon } from "lucide-react";

export function DownloadButton({ snarkData }: any) {
  const handleDownload = () => {
    const dataStr = `data:text/json;charset=utf-8,${encodeURIComponent(JSON.stringify(snarkData.output))}`;
    const downloadAnchorNode = document.createElement("a");
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", `snark_data_${new Date().toLocaleDateString()}.json`);
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
