import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
	console.log("lol!!!");
}

export const config = {
	matcher: "/",
};
