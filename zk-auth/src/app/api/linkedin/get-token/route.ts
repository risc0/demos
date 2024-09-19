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

    console.log("response", response);

    if (!response.ok) {
      const errorText = await response.text();
      console.error("LinkedIn API Error:", response.status, errorText);
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    console.log("data", data);

    // Get user profile information
    const userInfoResponse = await fetch("https://api.linkedin.com/v2/userinfo", {
      headers: {
        Authorization: `Bearer ${data.access_token}`,
      },
    });

    console.log("userInfoResponse", userInfoResponse);

    if (!userInfoResponse.ok) {
      throw new Error(`HTTP error! status: ${userInfoResponse.status}`);
    }

    const profileData = await userInfoResponse.json();

    console.log("profileData", profileData);

    // Get user email address
    const emailResponse = await fetch(
      "https://api.linkedin.com/v2/emailAddress?q=members&projection=(elements*(handle~))",
      {
        headers: {
          Authorization: `Bearer ${data.access_token}`,
        },
      },
    );

    if (!emailResponse.ok) {
      throw new Error(`HTTP error! status: ${emailResponse.status}`);
    }

    const emailData = await emailResponse.json();

    return {
      access_token: data.access_token,
      email: emailData.elements[0]["handle~"].emailAddress,
      firstName: profileData.localizedFirstName,
      lastName: profileData.localizedLastName,
      profilePictureUrl: profileData.profilePicture?.["displayImage~"]?.elements[0]?.identifiers[0]?.identifier,
    };
  } catch (error) {
    console.error("Error getting LinkedIn tokens and user info:", error);
    throw error;
  }
}

export async function POST(request: Request) {
  try {
    const { code } = await request.json();
    const { access_token, email, firstName, lastName, profilePictureUrl } = await getLinkedInTokensAndUserInfo(code);

    return NextResponse.json({
      jwt: access_token, // Note: LinkedIn doesn't provide an id_token, so we're using access_token here
      access_token,
      email,
      firstName,
      lastName,
      profilePictureUrl,
    });
  } catch (error) {
    console.error("Failed to get tokens and user info:", error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
