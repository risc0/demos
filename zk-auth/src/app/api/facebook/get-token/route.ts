import { NextResponse } from "next/server";
import env from "~/env";

async function getFacebookTokensAndUserInfo(code: string, codeVerifier: string, origin: string) {
  try {
    const tokenUrl = new URL("https://graph.facebook.com/v15.0/oauth/access_token");
    tokenUrl.searchParams.append("client_id", env.FACEBOOK_APP_ID);
    tokenUrl.searchParams.append("redirect_uri", `${origin}/facebook/callback/`);
    tokenUrl.searchParams.append("code_verifier", codeVerifier);
    tokenUrl.searchParams.append("code", code);

    const tokenResponse = await fetch(tokenUrl.toString(), { method: "GET" });

    if (!tokenResponse.ok) {
      throw new Error(`HTTP error! status: ${tokenResponse.status}`);
    }

    const tokenData = await tokenResponse.json();

    if (!tokenData.access_token || !tokenData.id_token) {
      throw new Error("No access_token or id_token in Facebook response");
    }

    return {
      jwt: tokenData.id_token,
    };
  } catch (error) {
    console.error("Error getting Facebook tokens and user info:", error);
    throw error;
  }
}

export async function POST(request: Request) {
  try {
    const { code, codeVerifier, origin } = await request.json();
    const { jwt } = await getFacebookTokensAndUserInfo(code, codeVerifier, origin);

    return NextResponse.json({
      jwt,
    });
  } catch (error) {
    console.error("Failed to get tokens and user info:", error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
