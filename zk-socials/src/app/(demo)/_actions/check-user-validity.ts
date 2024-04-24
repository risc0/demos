"use server";

import { sql } from "@vercel/postgres";

export async function checkUserValidity({ emailOrId }): Promise<{
  status: number;
  message?: string;
}> {
  if (!emailOrId) {
    throw new Error("Email or ID is Required");
  }

  const existingEmail = await sql`SELECT * FROM Users WHERE EmailOrId = ${emailOrId};`;

  try {
    if (existingEmail.rowCount > 0) {
      return { message: "Already Verified this Account", status: 403 };
    }

    // insert the new email in the DB
    await sql`INSERT INTO Users (EmailOrId) VALUES (${emailOrId});`;
  } catch {
    return { message: "Something Went Wrong", status: 500 };
  }

  return { status: 200 };
}
