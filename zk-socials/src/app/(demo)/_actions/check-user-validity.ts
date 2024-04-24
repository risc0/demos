"use server";

import { sql } from "@vercel/postgres";

export async function checkUserValidity({ email }): Promise<{
  status: number;
  message?: string;
}> {
  if (!email) {
    throw new Error("Email is required");
  }

  const existingEmail = await sql`SELECT * FROM GoogleUsers WHERE Email = ${email};`;

  try {
    if (!email) {
      throw new Error("Email required");
    }

    if (existingEmail.rowCount > 0) {
      return { message: "Already Verified this Google Account", status: 403 };
    }

    // insert the new email in the DB
    await sql`INSERT INTO GoogleUsers (Email) VALUES (${email});`;
  } catch {
    return { message: "Something went wrong", status: 500 };
  }

  return { status: 200 };
}
