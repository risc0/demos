import { type NextRequest, NextResponse } from "next/server";
import { bonsaiStarkProving } from "~/app/_lib/bonsai-proving";

export async function POST(request: NextRequest) {
  const { iss, token } = await request.json();

  try {
    const uuid = await bonsaiStarkProving({ iss, token });

    return NextResponse.json({ uuid });
  } catch (error) {
    console.error(error);

    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
