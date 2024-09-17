import type { NextApiRequest, NextApiResponse } from "next";
import Cors from "cors";
import { bonsaiStarkProving } from "~/app/_lib/bonsai-proving";

// Initialize the cors middleware
const cors = Cors({
	methods: ["POST", "OPTIONS"],
	origin: "*", // For development. In production, specify your client's origin
	optionsSuccessStatus: 200,
});

// Helper method to wait for a middleware to execute before continuing
// And to throw an error when an error happens in a middleware
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
	// Run the middleware
	await runMiddleware(req, res, cors);

	if (req.method === "OPTIONS") {
		return res.status(200).end();
	}

	if (req.method === "POST") {
		const { iss, token } = req.body;

		try {
			const uuid = await bonsaiStarkProving({ iss, token });
			res.status(200).json({ uuid });
		} catch (error) {
			res.status(500).json({ error: "Internal Server Error" });
		}
	} else {
		res.setHeader("Allow", ["POST"]);
		res.status(405).end(`Method ${req.method} Not Allowed`);
	}
}
