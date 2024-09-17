import { NextResponse } from "next/server";

export function middleware() {
	const response = NextResponse.next();
	response.headers.set("Access-Control-Allow-Origin", "*");
	return response;
}
