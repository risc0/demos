import env from "~/env";
import axios, { type AxiosInstance, type AxiosResponse } from "axios";

type StarkSessionStats = {
	segments: number;
	total_cycles: number;
	cycles: number;
};

type ProofReq = {
	img: string;
	input: string;
	assumptions: string[];
};

type SnarkSessionReceipt = {
	snark: any;
	post_state_digest: number[];
	journal: number[];
};

export type StarkSessionStatusRes = {
	status: string;
	receipt_url?: string;
	error_msg?: string;
	state?: string;
	elapsed_time?: number;
	stats?: StarkSessionStats;
};

export type SnarkSessionStatusRes = {
	status: string;
	output?: SnarkSessionReceipt;
	error_msg?: string;
};

type UploadRes = {
	url: string;
	uuid: string;
};

type CreateStarkSessionRes = {
	uuid: string;
};

type CreateSnarkSessionRes = {
	uuid: string;
};

type SnarkSessionReq = {
	session_id: string;
};

class StarkSession {
	constructor(public uuid: string) {}

	async status(client: Client): Promise<StarkSessionStatusRes> {
		const url = `sessions/status/${this.uuid}`;
		const res = await client.getData<StarkSessionStatusRes>(url);
		return res;
	}

	async logs(client: Client): Promise<string> {
		const url = `sessions/logs/${this.uuid}`;
		const res = await client.getData<string>(url);
		return res;
	}
}

class SnarkSession {
	constructor(public uuid: string) {}

	async status(client: Client): Promise<SnarkSessionStatusRes> {
		const url = `snark/status/${this.uuid}`;
		const res = await client.getData<SnarkSessionStatusRes>(url);
		return res;
	}
}

class SdkErr extends Error {
	constructor(message: string) {
		super(message);
		this.name = "SdkErr";
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
		const res = await this.client.put(url, body);
		this.handleError(res);
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
		const url = `${route}/upload`;
		const res = await this.getData<UploadRes>(url);
		return res;
	}

	async uploadInput(buf: Buffer): Promise<string> {
		const uploadData = await this.getUploadUrl("inputs");
		await this.putData(uploadData.url, buf);
		return uploadData.uuid;
	}

	async createStarkSession(
		imageId: string,
		inputId: string,
		assumptions: string[],
	): Promise<StarkSession> {
		const req: ProofReq = {
			img: imageId,
			input: inputId,
			assumptions,
		};

		const url = "sessions/create";
		const res = await this.postData<ProofReq, CreateStarkSessionRes>(url, req);
		return new StarkSession(res.uuid);
	}

	async createSnarkSession(sessionId: string): Promise<SnarkSession> {
		const snarkReq: SnarkSessionReq = { session_id: sessionId };

		const url = "snark/create";
		const res = await this.postData<SnarkSessionReq, CreateSnarkSessionRes>(
			url,
			snarkReq,
		);
		return new SnarkSession(res.uuid);
	}
}

async function getGoogleCerts(): Promise<string> {
	const response = await axios.get(
		"https://www.googleapis.com/oauth2/v3/certs",
	);
	const certs = response.data;
	return JSON.stringify(certs);
}

function encodeString(value: string) {
	const encoder = new TextEncoder();
	return encoder.encode(value);
}

// STARK
export async function bonsaiStarkProving({
	iss,
	token,
}: { iss: "Google" | "test"; token: string }) {
	const apiKey = env.BONSAI_API_KEY;
	const version = "1.0.5";
	const url = "https://api.staging.bonsai.xyz";
	const client = new Client(url, apiKey, version);

	// TODO: Add others, if applicable
	let jwks = "";

	if (iss === "Google") {
		jwks = await getGoogleCerts();
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

	const inputId = await client.uploadInput(inputData);
	const imageId = env.IMAGE_ID;
	const assumptions: string[] = [];
	const starkSession = await client.createStarkSession(
		imageId,
		inputId,
		assumptions,
	);

	return starkSession.uuid;
}

// STARK STATUS
export async function getBonsaiStarkStatus({ uuid }: { uuid: string }) {
	const apiKey = env.BONSAI_API_KEY;
	const version = "1.0.5";
	const url = "https://api.staging.bonsai.xyz";
	const client = new Client(url, apiKey, version);

	const starkSession = new StarkSession(uuid);
	const starkStatus = await starkSession.status(client);

	return starkStatus;
}

// SNARK
export async function bonsaiSnarkProving({ uuid }: { uuid: string }) {
	const apiKey = env.BONSAI_API_KEY;
	const version = "1.0.5";
	const url = "https://api.staging.bonsai.xyz";
	const client = new Client(url, apiKey, version);
	const snarkSession = await client.createSnarkSession(uuid);

	return snarkSession.uuid;
}

// SNARK STATUS
export async function getBonsaiSnarkStatus({ uuid }: { uuid: string }) {
	const apiKey = env.BONSAI_API_KEY;
	const version = "1.0.5";
	const url = "https://api.staging.bonsai.xyz";
	const client = new Client(url, apiKey, version);

	const snarkSession = new SnarkSession(uuid);
	const snarkStatus = await snarkSession.status(client);

	return snarkStatus;
}
