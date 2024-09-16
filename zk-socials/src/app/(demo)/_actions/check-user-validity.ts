"use server";

import { sql } from "@vercel/postgres";

const ALLOWED_EMAILS_INFINITE_TRIES = [
	"hans@risczero.com",
	"brett@risczero.com",
	"cohan@risczero.com",
	"cohan.carpentier@gmail.com",
];

export async function checkUserValidity({ emailOrId }): Promise<{
	status: number;
	message?: string;
}> {
	if (!emailOrId) {
		throw new Error("Email or ID is Required");
	}

	if (ALLOWED_EMAILS_INFINITE_TRIES.includes(emailOrId)) {
		return { status: 200 };
	}

	const existingEmail =
		await sql`SELECT * FROM Users WHERE EmailOrId = ${emailOrId};`;

	try {
		if (existingEmail.rowCount && existingEmail.rowCount > 0) {
			return { message: "Already Verified this Account", status: 403 };
		}

		// insert the new email in the DB
		await sql`INSERT INTO Users (EmailOrId) VALUES (${emailOrId});`;
	} catch {
		return { message: "Something Went Wrong", status: 500 };
	}

	return { status: 200 };
}
