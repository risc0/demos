import axios from "axios";

export async function getCerts(provider: "google" | "twitch"): Promise<string> {
  return JSON.stringify(
    (
      await axios.get(
        provider === "google"
          ? "https://www.googleapis.com/oauth2/v3/certs"
          : provider === "twitch"
            ? "https://id.twitch.tv/oauth2/keys"
            : "",
      )
    ).data,
  );
}
