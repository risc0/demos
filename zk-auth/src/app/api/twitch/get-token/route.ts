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

    console.log("params", params);

    const response = await fetch(`https://id.twitch.tv/oauth2/token?${params}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
    });

    console.log("response", response);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    console.log("data", data);

    if (!data.id_token) {
      console.error("Twitch response:", data);
      throw new Error("No id_token in Twitch response");
    }

    console.log("data.id_token", data.id_token);

    return data.id_token;
  } catch (error) {
    console.error("Error getting Twitch JWT:", error);
    throw error;
  }
}

export async function POST(request: Request) {
  try {
    const { accessToken } = await request.json();
    const jwt = await getTwitchJWT(accessToken);

    console.log("jwt", jwt);

    return NextResponse.json({ jwt });
  } catch (error) {
    console.error("Failed to get JWT:", error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
