import { NextRequest, NextResponse } from "next/server";
import { getBonsaiStarkStatus } from "~/app/_lib/bonsai-proving";

export async function GET(request: NextRequest) {
	const uuid = request.nextUrl.searchParams.get("uuid");

	if (!uuid) {
		const errorResponse = NextResponse.json(
			{ error: "Invalid UUID" },
			{ status: 400 },
		);
		// Add CORS headers to error response
		errorResponse.headers.set(
			"Access-Control-Allow-Origin",
			"http://localhost:3000",
		);
		errorResponse.headers.set("Access-Control-Allow-Methods", "GET");
		return errorResponse;
	}

	try {
		const status = await getBonsaiStarkStatus({ uuid });

		const response = NextResponse.json(status);
		// Add CORS headers
		response.headers.set(
			"Access-Control-Allow-Origin",
			"http://localhost:3000",
		);
		response.headers.set("Access-Control-Allow-Methods", "GET");
		return response;
	} catch (error) {
		const errorResponse = NextResponse.json(
			{ error: "Internal Server Error" },
			{ status: 500 },
		);
		// Add CORS headers to error response
		errorResponse.headers.set(
			"Access-Control-Allow-Origin",
			"http://localhost:3000",
		);
		errorResponse.headers.set("Access-Control-Allow-Methods", "GET");
		return errorResponse;
	}
}

// Handle OPTIONS request for preflight
export function OPTIONS() {
	const response = new NextResponse(null, { status: 204 });

	response.headers.set("Access-Control-Allow-Origin", "http://localhost:3000");
	response.headers.set("Access-Control-Allow-Methods", "GET");

	return response;
}
