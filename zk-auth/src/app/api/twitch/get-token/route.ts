import { NextResponse } from "next/server";
import env from "~/env";

async function getTwitchTokensAndEmail(code: string) {
  try {
    const body = new URLSearchParams();
    body.append("client_id", env.TWITCH_CLIENT_ID);
    body.append("client_secret", env.TWITCH_CLIENT_SECRET);
    body.append("code", code);
    body.append("grant_type", "authorization_code");
    body.append("redirect_uri", "http://localhost:3000");

    const response = await fetch("https://id.twitch.tv/oauth2/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body,
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Twitch API Error:", response.status, errorText);
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    if (!data.access_token) {
      console.error("Twitch response:", data);
      throw new Error("No access_token in Twitch response");
    }

    // Now use the access token to get user info
    const userInfoResponse = await fetch("https://api.twitch.tv/helix/users", {
      headers: {
        Authorization: `Bearer ${data.access_token}`,
        "Client-Id": env.TWITCH_CLIENT_ID,
      },
    });

    if (!userInfoResponse.ok) {
      throw new Error(`HTTP error! status: ${userInfoResponse.status}`);
    }

    const userInfo = await userInfoResponse.json();
    const email = userInfo.data[0]?.email;

    return {
      id_token: data.id_token,
      access_token: data.access_token,
      email: email,
    };
  } catch (error) {
    console.error("Error getting Twitch tokens and email:", error);
    throw error;
  }
}

export async function POST(request: Request) {
  try {
    const { code } = await request.json();
    const { id_token, access_token, email } = await getTwitchTokensAndEmail(code);

    return NextResponse.json({
      jwt: id_token,
      access_token: access_token,
      email: email,
    });
  } catch (error) {
    console.error("Failed to get tokens and email:", error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
