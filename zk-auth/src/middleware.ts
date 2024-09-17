import { NextRequest, NextResponse } from "next/server";

const allowedOrigins = ["https://zkauth.vercel.app", "http://localhost:3000"];

const corsOptions = {
	"Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
	"Access-Control-Allow-Headers": "Content-Type, Authorization",
};

function isImageRequest(request: NextRequest) {
	return (
		request.method === "GET" &&
		request.nextUrl.pathname.match(/\.(svg|png|jpg|jpeg|gif)$/i)
	);
}

export function middleware(request: NextRequest) {
	// Handle image requests
	if (isImageRequest(request)) {
		const response = NextResponse.next();
		response.headers.set("Access-Control-Allow-Origin", "*");
		return response;
	}

	// Check the origin from the request
	const origin = request.headers.get("origin") ?? "";
	const isAllowedOrigin = allowedOrigins.includes(origin);

	// Handle preflighted requests
	const isPreflight = request.method === "OPTIONS";

	if (isPreflight) {
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
	matcher: [
		"/api/:path*",
		/*
		 * Match all request paths except for the ones starting with:
		 * - _next/static (static files)
		 * - _next/image (image optimization files)
		 * - favicon.ico, sitemap.xml, robots.txt (metadata files)
		 */
		"/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)",
	],
};
