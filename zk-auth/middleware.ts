import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const allowedOrigins = [
	// 'https://your-allowed-domain1.com',
	// 'https://your-allowed-domain2.com',
	"http://localhost:3000", // For local development
	"https://zk-auth.vercel.app",
];

export function middleware(request: NextRequest) {
	if (request.nextUrl.pathname.startsWith("/api/")) {
		const origin = request.headers.get("origin");

		if (origin && !allowedOrigins.includes(origin)) {
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

		if (origin) {
			response.headers.set("Access-Control-Allow-Origin", origin);
		}
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
