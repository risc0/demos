import axios, { type AxiosInstance, type AxiosResponse } from "axios";
import env from "~/env";
import { encodeString } from "./encode-string";
import { getGoogleCerts } from "./get-google-certs";
import { getTwitchCerts } from "./get-twitch-certs";
import type {
  CreateSnarkSessionRes,
  CreateStarkSessionRes,
  ProofReq,
  SnarkSessionReq,
  SnarkSessionStatusRes,
  StarkSessionStatusRes,
  UploadRes,
} from "./types";

class SdkErr extends Error {
  constructor(message: string) {
    super(message);

    this.name = "SdkErr";
  }
}

class StarkSession {
  constructor(public uuid: string) {}

  async status(client: Client): Promise<StarkSessionStatusRes> {
    return await client.getData<StarkSessionStatusRes>(`sessions/status/${this.uuid}`);
  }

  async logs(client: Client): Promise<string> {
    return await client.getData<string>(`sessions/logs/${this.uuid}`);
  }
}

class SnarkSession {
  constructor(public uuid: string) {}

  async status(client: Client): Promise<SnarkSessionStatusRes> {
    return await client.getData<SnarkSessionStatusRes>(`snark/status/${this.uuid}`);
  }
}

class InternalServerErr extends SdkErr {
  constructor(body: string) {
    super(`server error \`${body}\``);

    this.name = "InternalServerErr";
  }
}

class Client {
  private client: AxiosInstance;

  constructor(
    public url: string,
    apiKey: string,
    version: string,
  ) {
    const headers = {
      accept: "application/json",
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "x-risc0-version": version,
    };

    this.client = axios.create({
      baseURL: url,
      headers,
    });
  }

  private handleError(res: AxiosResponse): void {
    if (!res.status.toString().startsWith("2")) {
      throw new InternalServerErr(res.data);
    }
  }

  async putData<T>(url: string, body: T): Promise<void> {
    this.handleError(await this.client.put(url, body));
  }

  async postData<T, R>(url: string, body: T): Promise<R> {
    const res = await this.client.post(url, body);
    this.handleError(res);

    return res.data as R;
  }

  async getData<T>(url: string): Promise<T> {
    const res = await this.client.get(url);
    this.handleError(res);

    return res.data as T;
  }

  private async getUploadUrl(route: string): Promise<UploadRes> {
    return await this.getData<UploadRes>(`${route}/upload`);
  }

  async uploadInput(buf: Buffer): Promise<string> {
    const uploadData = await this.getUploadUrl("inputs");
    await this.putData(uploadData.url, buf);

    return uploadData.uuid;
  }

  async createStarkSession(imageId: string, inputId: string, assumptions: string[]): Promise<StarkSession> {
    const res = await this.postData<ProofReq, CreateStarkSessionRes>("sessions/create", {
      img: imageId,
      input: inputId,
      assumptions,
    });

    return new StarkSession(res.uuid);
  }

  async createSnarkSession(sessionId: string): Promise<SnarkSession> {
    const res = await this.postData<SnarkSessionReq, CreateSnarkSessionRes>("snark/create", { session_id: sessionId });

    return new SnarkSession(res.uuid);
  }
}

// STARK
export async function bonsaiStarkProving({ iss, token }: { iss: "Google" | "Twitch" | "test"; token: string }) {
  // TODO: Add others, if applicable
  let jwks = "";

  if (iss === "Google") {
    jwks = await getGoogleCerts();
  }

  if (iss === "Twitch") {
    jwks = await getTwitchCerts();
  }

  const inputData = Buffer.from(
    encodeString(
      JSON.stringify({
        iss,
        jwks,
        jwt: token,
      }),
    ),
  );

  const client = new Client(env.BONSAI_URL, env.BONSAI_API_KEY, env.BONSAI_VERSION);
  const inputId = await client.uploadInput(inputData);
  const imageId = env.IMAGE_ID;
  const assumptions: string[] = [];
  const starkSession = await client.createStarkSession(imageId, inputId, assumptions);

  return starkSession.uuid;
}

// STARK STATUS
export async function getBonsaiStarkStatus({ uuid }: { uuid: string }) {
  const starkSession = new StarkSession(uuid);
  const starkStatus = await starkSession.status(new Client(env.BONSAI_URL, env.BONSAI_API_KEY, env.BONSAI_VERSION));

  return starkStatus;
}

// SNARK
export async function bonsaiSnarkProving({ uuid }: { uuid: string }) {
  const snarkSession = await new Client(env.BONSAI_URL, env.BONSAI_API_KEY, env.BONSAI_VERSION).createSnarkSession(
    uuid,
  );

  return snarkSession.uuid;
}

// SNARK STATUS
export async function getBonsaiSnarkStatus({ uuid }: { uuid: string }) {
  const snarkSession = new SnarkSession(uuid);
  const snarkStatus = await snarkSession.status(new Client(env.BONSAI_URL, env.BONSAI_API_KEY, env.BONSAI_VERSION));

  return snarkStatus;
}
