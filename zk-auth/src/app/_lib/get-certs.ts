import axios from "axios";

export async function getCerts(provider: "google" | "linkedin" | "twitch" | "paypal"): Promise<string> {
  return JSON.stringify(
    (
      await axios.get(
        provider === "google"
          ? "https://www.googleapis.com/oauth2/v3/certs"
          : provider === "linkedin"
            ? "https://www.linkedin.com/oauth/openid/jwks"
            : provider === "twitch"
              ? "https://id.twitch.tv/oauth2/keys"
              : provider === "paypal"
                ? "https://api.paypal.com/v1/oauth2/certs"
                : "",
      )
    ).data,
  );
}
