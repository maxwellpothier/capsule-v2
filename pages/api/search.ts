import {supabaseAdmin} from "@/utils";
import {match} from "assert";
import {NextRequest, NextResponse} from "next/server";

export const config = {
	runtime: "edge",
};

type Data = {
	question: string;
};

const handler = async (req: NextRequest): Promise<NextResponse> => {
	try {
		const {question} = (await req.json()) as Data;

		const embeddingResponse = await fetch(
			"https://api.openai.com/v1/embeddings",
			{
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
				},
				body: JSON.stringify({
					model: "text-embedding-3-small",
					input: question,
				}),
			}
		);

		const {embedding} = (await embeddingResponse.json()).data[0];

		const {data: chunks, error} = await supabaseAdmin.rpc(
			"capsule_search",
			{
				query_embedding: embedding,
				similarity_threshold: 0.01,
				match_count: 5,
			}
		);

		if (error) {
			console.log(
				"An error occurred when running similarity search",
				error
			);
			throw new Error(error.message);
		}

		return NextResponse.json({chunks}, {status: 200});
	} catch (error) {
		const errorMessage =
			error instanceof Error ? error.message : "An error occurred";
		return NextResponse.json({question: errorMessage}, {status: 500});
	}
};

export default handler;
