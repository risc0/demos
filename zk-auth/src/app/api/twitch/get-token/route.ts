import { NextResponse } from "next/server";
import env from "~/env";

async function getTwitchJWT(accessToken: string) {
  try {
    const params = new URLSearchParams({
      client_id: env.TWITCH_CLIENT_ID,
      client_secret: env.TWITCH_CLIENT_SECRET,
      grant_type: "client_credentials",
      scope: "openid",
    });

    const response = await fetch(`https://id.twitch.tv/oauth2/token?${params}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    return data.id_token; // This is the JWT
  } catch (error) {
    console.error("Error getting Twitch JWT:", error);
    throw error;
  }
}

export async function POST(request: Request) {
  try {
    const { accessToken } = await request.json();
    const jwt = await getTwitchJWT(accessToken);

    return NextResponse.json({ jwt });
  } catch (error) {
    console.error("Failed to get JWT:", error);
    return NextResponse.json({ error: "Failed to get JWT" }, { status: 500 });
  }
}
