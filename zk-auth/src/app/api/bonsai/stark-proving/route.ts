import { NextRequest, NextResponse } from "next/server";
import { bonsaiStarkProving } from "~/app/_lib/bonsai-proving";
import { setCorsHeaders } from "~/app/_utils/set-cors-headers";

export async function POST(request: NextRequest) {
	const { iss, token } = await request.json();

	try {
		const uuid = await bonsaiStarkProving({ iss, token });
		const response = NextResponse.json({ uuid });
		setCorsHeaders(response);
		return response;
	} catch (error) {
		const errorResponse = NextResponse.json(
			{ error: "Internal Server Error" },
			{ status: 500 },
		);
		setCorsHeaders(errorResponse);
		return errorResponse;
	}
}

export function OPTIONS() {
	const response = new NextResponse(null, { status: 204 });
	setCorsHeaders(response);
	return response;
}
