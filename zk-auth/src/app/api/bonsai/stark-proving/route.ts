import { NextRequest, NextResponse } from "next/server";
import { bonsaiStarkProving } from "~/app/_lib/bonsai-proving";

export async function POST(request: NextRequest) {
	const { iss, token } = await request.json();

	try {
		const uuid = await bonsaiStarkProving({ iss, token });

		const response = NextResponse.json({ uuid });

		// Add CORS headers
		response.headers.set(
			"Access-Control-Allow-Origin",
			"http://localhost:3000",
		);
		response.headers.set("Access-Control-Allow-Methods", "POST");
		response.headers.set("Access-Control-Allow-Headers", "Content-Type");

		return response;
	} catch (error) {
		const errorResponse = NextResponse.json(
			{ error: "Internal Server Error" },
			{ status: 500 },
		);

		// Add CORS headers to error response as well
		errorResponse.headers.set(
			"Access-Control-Allow-Origin",
			"http://localhost:3000",
		);
		errorResponse.headers.set("Access-Control-Allow-Methods", "POST");
		errorResponse.headers.set("Access-Control-Allow-Headers", "Content-Type");

		return errorResponse;
	}
}

// Handle OPTIONS request for preflight
export function OPTIONS() {
	const response = new NextResponse(null, { status: 204 });

	response.headers.set("Access-Control-Allow-Origin", "http://localhost:3000");
	response.headers.set("Access-Control-Allow-Methods", "POST");
	response.headers.set("Access-Control-Allow-Headers", "Content-Type");

	return response;
}
