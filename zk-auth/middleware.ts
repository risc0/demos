import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
	const allowedOrigin = "http://localhost:3000";

	if (request.nextUrl.pathname.startsWith("/api/")) {
		const origin = request.headers.get("origin");

		if (origin !== allowedOrigin) {
			return new NextResponse(null, {
				status: 403,
				statusText: "Forbidden",
				headers: {
					"Content-Type": "text/plain",
				},
			});
		}

		// For successful requests, add CORS headers
		const response = NextResponse.next();

		response.headers.set("Access-Control-Allow-Origin", allowedOrigin);
		response.headers.set(
			"Access-Control-Allow-Methods",
			"GET, POST, PUT, DELETE, OPTIONS",
		);
		response.headers.set(
			"Access-Control-Allow-Headers",
			"Content-Type, Authorization",
		);

		return response;
	}

	return NextResponse.next();
}

export const config = {
	matcher: "/api/:path*",
};
