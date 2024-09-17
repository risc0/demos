import type { NextApiRequest, NextApiResponse } from "next";
import Cors from "cors";
import { getBonsaiStarkStatus } from "~/app/_lib/bonsai-proving";

const cors = Cors({
	methods: ["GET", "OPTIONS"],
	origin: "*", // For development. In production, specify your client's origin
	optionsSuccessStatus: 200,
});

function runMiddleware(
	req: NextApiRequest,
	res: NextApiResponse,
	fn: Function,
) {
	return new Promise((resolve, reject) => {
		fn(req, res, (result: any) => {
			if (result instanceof Error) {
				return reject(result);
			}
			return resolve(result);
		});
	});
}

export default async function handler(
	req: NextApiRequest,
	res: NextApiResponse,
) {
	await runMiddleware(req, res, cors);

	if (req.method === "OPTIONS") {
		return res.status(200).end();
	}

	if (req.method === "GET") {
		const { uuid } = req.query;

		if (!uuid || Array.isArray(uuid)) {
			return res.status(400).json({ error: "Invalid UUID" });
		}

		try {
			const status = await getBonsaiStarkStatus({ uuid });
			res.status(200).json(status);
		} catch (error) {
			res.status(500).json({ error: "Internal Server Error" });
		}
	} else {
		res.setHeader("Allow", ["GET"]);
		res.status(405).end(`Method ${req.method} Not Allowed`);
	}
}
