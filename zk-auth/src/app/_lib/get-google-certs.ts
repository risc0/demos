import axios from "axios";

export async function getGoogleCerts(): Promise<string> {
  const response = await axios.get("https://www.googleapis.com/oauth2/v3/certs");
  const certs = response.data;

  return JSON.stringify(certs);
}
