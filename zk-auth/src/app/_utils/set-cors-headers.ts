import type { NextResponse } from "next/server";

// Helper function to set CORS headers
export function setCorsHeaders(response: NextResponse) {
	response.headers.set("Access-Control-Allow-Origin", "*");
	response.headers.set("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
	response.headers.set("Access-Control-Allow-Headers", "Content-Type");
}
