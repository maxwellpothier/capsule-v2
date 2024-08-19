import type {NextApiRequest, NextApiResponse} from "next";

type Data = {
	question: string;
};

const handler = async (req: NextApiRequest, res: NextApiResponse<Data>) => {
	try {
		if (req.method !== "POST") {
			throw new Error("Method Not Allowed");
		}

		const {question} = req.body;
		const response = `You asked: ${question}`;
		res.status(200).json({question: response});
	} catch (error) {
		const errorMessage =
			error instanceof Error ? error.message : "An error occurred";
		res.status(405).json({question: errorMessage});
	}
};

export default handler;
