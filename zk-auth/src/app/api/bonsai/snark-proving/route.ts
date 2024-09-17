import { type NextRequest, NextResponse } from "next/server";
import { bonsaiSnarkProving } from "~/app/_lib/bonsai-proving";

export async function POST(request: NextRequest) {
  const { uuid } = await request.json();

  try {
    const snarkUuid = await bonsaiSnarkProving({ uuid });

    return NextResponse.json({ uuid: snarkUuid });
  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
