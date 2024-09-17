import { NextRequest, NextResponse } from "next/server";
import { getBonsaiStarkStatus } from "~/app/_lib/bonsai-proving";
import { setCorsHeaders } from "~/app/_utils/set-cors-headers";

export async function GET(request: NextRequest) {
	const uuid = request.nextUrl.searchParams.get("uuid");

	if (!uuid) {
		const errorResponse = NextResponse.json(
			{ error: "Invalid UUID" },
			{ status: 400 },
		);
		setCorsHeaders(errorResponse);
		return errorResponse;
	}

	try {
		const status = await getBonsaiStarkStatus({ uuid });
		const response = NextResponse.json(status);
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
