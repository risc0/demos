import axios from "axios";

export async function getGoogleCerts(): Promise<string> {
  return JSON.stringify((await axios.get("https://www.googleapis.com/oauth2/v3/certs")).data);
}
