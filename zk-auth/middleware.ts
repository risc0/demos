import { NextResponse } from "next/server";

const allowedOrigins =
	process.env.NODE_ENV === "production"
		? ["https://zkauth.vercel.app/m", "http://localhost:3000"]
		: ["http://localhost:3000"];

export function middleware(request: Request) {
	const origin = request.headers.get("origin");

	if (origin && !allowedOrigins.includes(origin)) {
		return new Error("Invalid origin"), { status: 403 };
	}

	const response = NextResponse.next({
		request: {
			...request,
			headers: request.headers,
		},
	});

	response.headers.set("Access-Control-Allow-Origin", "*");
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

export const config = {
	matcher: "/api/:path*",
};
