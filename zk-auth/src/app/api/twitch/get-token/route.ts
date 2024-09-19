import { NextResponse } from "next/server";
import env from "~/env";

async function getTwitchJWT(code: string) {
  try {
    const params = new URLSearchParams();
    params.append("client_id", env.TWITCH_CLIENT_ID);
    params.append("client_secret", env.TWITCH_CLIENT_SECRET);
    params.append("code", code);
    params.append("grant_type", "authorization_code");
    params.append("redirect_uri", "http://localhost:3000");

    console.log("params", params);

    const response = await fetch("https://id.twitch.tv/oauth2/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: params,
    });

    console.log("response", response);

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Twitch API Error:", response.status, errorText);
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
    const { code } = await request.json();
    const jwt = await getTwitchJWT(code);

    return NextResponse.json({ jwt });
  } catch (error) {
    console.error("Failed to get JWT:", error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
