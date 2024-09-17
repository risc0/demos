import { NextRequest, NextResponse } from "next/server";

const allowedOrigins = ["https://zkauth.vercel.app", "http://localhost:3000"];

const corsOptions = {
	"Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
	"Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export function middleware(request: NextRequest) {
	const origin = request.headers.get("origin") ?? "";
	const isAllowedOrigin = allowedOrigins.includes(origin);
	const isImageRoute = request.nextUrl.pathname.startsWith("/images");
	const isApiRoute = request.nextUrl.pathname.startsWith("/api");

	// Allow all origins for image routes
	if (isImageRoute) {
		console.log("Image route detected:", request.nextUrl.pathname);
		const response = NextResponse.next();
		response.headers.set("Access-Control-Allow-Origin", "*");
		// Add additional headers that might be required
		response.headers.set("Access-Control-Allow-Methods", "GET, HEAD, OPTIONS");
		response.headers.set("Access-Control-Allow-Headers", "Content-Type");

		return response;
	}

	// Handle CORS for API routes
	if (isApiRoute) {
		console.log("API route detected:", request.nextUrl.pathname);

		// Handle preflight requests
		if (request.method === "OPTIONS") {
			const response = new NextResponse(null, { status: 204 });
			response.headers.set(
				"Access-Control-Allow-Origin",
				isAllowedOrigin ? origin : (allowedOrigins[0] ?? ""),
			);
			response.headers.set(
				"Access-Control-Allow-Methods",
				corsOptions["Access-Control-Allow-Methods"],
			);
			response.headers.set(
				"Access-Control-Allow-Headers",
				corsOptions["Access-Control-Allow-Headers"],
			);
			response.headers.set("Access-Control-Max-Age", "86400");
			return response;
		}

		// Handle actual requests
		const response = NextResponse.next();
		response.headers.set(
			"Access-Control-Allow-Origin",
			isAllowedOrigin ? origin : (allowedOrigins[0] ?? ""),
		);
		Object.entries(corsOptions).forEach(([key, value]) => {
			response.headers.set(key, value);
		});

		return response;
	}

	// For all other routes, proceed without modifying headers
	return NextResponse.next();
}
