import { NextResponse } from "next/server";
import env from "~/env";

async function getFacebookTokensAndUserInfo(code: string, codeVerifier: string, origin: string) {
  try {
    // Exchange code for access token and id_token
    const tokenResponse = await fetch(
      `https://graph.facebook.com/v12.0/oauth/access_token?client_id=${env.FACEBOOK_APP_ID}&redirect_uri=${origin}&code_verifier=${codeVerifier}&code=${code}`,
      { method: "GET" },
    );

    console.log("tokenResponse", tokenResponse);

    if (!tokenResponse.ok) {
      throw new Error(`HTTP error! status: ${tokenResponse.status}`);
    }

    const tokenData = await tokenResponse.json();
    console.log("tokenData", tokenData);

    if (!tokenData.access_token || !tokenData.id_token) {
      throw new Error("No access_token or id_token in Facebook response");
    }

    // Get user info using the access token
    const userInfoResponse = await fetch(
      `https://graph.facebook.com/me?fields=id,name,email,picture&access_token=${tokenData.access_token}`,
    );

    console.log("userInfoResponse", userInfoResponse);

    if (!userInfoResponse.ok) {
      throw new Error(`HTTP error! status: ${userInfoResponse.status}`);
    }

    const userData = await userInfoResponse.json();

    console.log("userData", userData);

    return {
      access_token: tokenData.access_token,
      id_token: tokenData.id_token,
      email: userData.email,
      profile_image_url: userData.picture?.data?.url,
      display_name: userData.name,
    };
  } catch (error) {
    console.error("Error getting Facebook tokens and user info:", error);
    throw error;
  }
}

export async function POST(request: Request) {
  try {
    const { code, codeVerifier, nonce, origin } = await request.json();
    console.log("code", code);
    console.log("codeVerifier", codeVerifier);
    console.log("nonce", nonce);
    console.log("origin", origin);
    const { access_token, id_token, email, profile_image_url, display_name } = await getFacebookTokensAndUserInfo(
      code,
      codeVerifier,
      origin,
    );

    // TODO: Validate the id_token here (verify signature, check nonce, etc.)

    return NextResponse.json({
      jwt: id_token,
      access_token,
      id_token,
      display_name,
      email,
      profile_image_url,
    });
  } catch (error) {
    console.error("Failed to get tokens and user info:", error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
