import { NextRequest, NextResponse } from "next/server";
import { getBonsaiSnarkStatus } from "~/app/_lib/bonsai-proving";

export async function GET(request: NextRequest) {
	const uuid = request.nextUrl.searchParams.get("uuid");

	if (!uuid) {
		return NextResponse.json({ error: "Invalid UUID" }, { status: 400 });
	}

	try {
		const status = await getBonsaiSnarkStatus({ uuid });

		return NextResponse.json(status);
	} catch (error) {
		return NextResponse.json(
			{ error: "Internal Server Error" },
			{ status: 500 },
		);
	}
}
