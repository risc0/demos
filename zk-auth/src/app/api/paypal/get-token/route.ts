import { NextResponse } from "next/server";
import env from "~/env";

async function getPayPalTokensAndUserInfo(code: string, origin: string) {
  try {
    console.log("code", code);
    console.log("origin", origin);
    const params = new URLSearchParams();
    params.append("grant_type", "authorization_code");
    params.append("code", code);

    const response = await fetch("https://api-m.sandbox.paypal.com/v1/oauth2/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: `Basic ${Buffer.from(`${env.PAYPAL_CLIENT_ID}:${env.PAYPAL_CLIENT_SECRET}`).toString("base64")}`,
      },
      body: params,
    });

    console.log("response-----", response);

    if (!response.ok) {
      const errorText = await response.text();
      console.error("PayPal API Error:", response.status, errorText);
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    // Fetch user info using the access token
    const userInfoResponse = await fetch(
      "https://api-m.sandbox.paypal.com/v1/identity/oauth2/userinfo?schema=paypalv1.1",
      {
        headers: {
          Authorization: `Bearer ${data.access_token}`,
        },
      },
    );

    if (!userInfoResponse.ok) {
      throw new Error(`Failed to fetch user info: ${userInfoResponse.status}`);
    }

    const userInfo = await userInfoResponse.json();

    return {
      ...data,
      user_info: userInfo,
    };
  } catch (error) {
    console.error("Error getting PayPal tokens and user info:", error);
    throw error;
  }
}

export async function POST(request: Request) {
  try {
    const { code, origin } = await request.json();
    const { access_token, user_info } = await getPayPalTokensAndUserInfo(code, origin);

    console.log("access_token", access_token);
    console.log("user_info", user_info);

    // Create a simple JWT-like token with user info
    const id_token = Buffer.from(JSON.stringify(user_info)).toString("base64");

    return NextResponse.json({
      jwt: id_token,
    });
  } catch (error) {
    console.error("Failed to get tokens and user info:", error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
