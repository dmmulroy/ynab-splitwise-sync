export default function extractSWIDfromMemo(memo: string): number {
  const swid = Number(memo.split('SWID:')[1]);

  if (!swid) {
    throw new Error(`SWID not found in YNAB transaction memo: ${memo}`);
  }

  return Number(swid);
}
