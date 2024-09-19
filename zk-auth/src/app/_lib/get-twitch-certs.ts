import axios from "axios";

export async function getTwitchCerts(): Promise<string> {
  return JSON.stringify((await axios.get("https://id.twitch.tv/oauth2/keys")).data);
}
