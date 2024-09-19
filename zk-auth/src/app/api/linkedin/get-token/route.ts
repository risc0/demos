import { NextResponse } from "next/server";
import env from "~/env";

async function getLinkedInTokensAndUserInfo(code: string) {
  try {
    const params = new URLSearchParams();
    params.append("client_id", env.LINKEDIN_CLIENT_ID);
    params.append("client_secret", env.LINKEDIN_CLIENT_SECRET);
    params.append("code", code);
    params.append("grant_type", "authorization_code");
    params.append("redirect_uri", "http://localhost:3000");

    const response = await fetch("https://www.linkedin.com/oauth/v2/accessToken", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: params,
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("LinkedIn API Error:", response.status, errorText);
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    console.log("data", data);

    return data;
  } catch (error) {
    console.error("Error getting LinkedIn tokens and user info:", error);
    throw error;
  }
}

export async function POST(request: Request) {
  try {
    const { code } = await request.json();
    const { id_token } = await getLinkedInTokensAndUserInfo(code);

    return NextResponse.json({
      jwt: id_token,
    });
  } catch (error) {
    console.error("Failed to get tokens and user info:", error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
