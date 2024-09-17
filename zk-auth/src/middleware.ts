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

	// Handle preflighted requests
	if (request.method === "OPTIONS") {
		const preflightHeaders = {
			...(isAllowedOrigin && { "Access-Control-Allow-Origin": origin }),
			...corsOptions,
		};
		return NextResponse.json({}, { headers: preflightHeaders });
	}

	// Handle simple requests
	const response = NextResponse.next();

	if (isAllowedOrigin) {
		response.headers.set("Access-Control-Allow-Origin", origin);
	}

	Object.entries(corsOptions).forEach(([key, value]) => {
		response.headers.set(key, value);
	});

	return response;
}

export const config = {
	matcher: ["/(.*?)"],
};
