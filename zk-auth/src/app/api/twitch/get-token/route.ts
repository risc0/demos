import { NextResponse } from "next/server";
import env from "~/env";

async function getTwitchTokensAndUserInfo(code: string) {
  try {
    const params = new URLSearchParams();
    params.append("client_id", env.TWITCH_CLIENT_ID);
    params.append("client_secret", env.TWITCH_CLIENT_SECRET);
    params.append("code", code);
    params.append("grant_type", "authorization_code");
    params.append("redirect_uri", "http://localhost:3000");

    const response = await fetch("https://id.twitch.tv/oauth2/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: params,
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
    const userData = userInfo.data[0];

    return {
      id_token: data.id_token,
      access_token: data.access_token,
      email: userData?.email,
      profile_image_url: userData?.profile_image_url,
      display_name: userData?.display_name,
    };
  } catch (error) {
    console.error("Error getting Twitch tokens and user info:", error);
    throw error;
  }
}

export async function POST(request: Request) {
  try {
    const { code } = await request.json();
    const { id_token, access_token, email, profile_image_url, display_name } = await getTwitchTokensAndUserInfo(code);

    return NextResponse.json({
      jwt: id_token,
      access_token,
      display_name,
      email,
      profile_image_url,
    });
  } catch (error) {
    console.error("Failed to get tokens and user info:", error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
