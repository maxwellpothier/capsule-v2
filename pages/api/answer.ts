import {NextRequest, NextResponse} from "next/server";
import {OpenAIStream} from "@/utils";

export const config = {
	runtime: "edge",
};

type Data = {
	prompt: string;
};

const handler = async (req: NextRequest): Promise<NextResponse> => {
	try {
		const {prompt} = (await req.json()) as Data;

		const openAIResponse = await OpenAIStream(prompt);
		return NextResponse.json({answer: openAIResponse}, {status: 200});
	} catch (error) {
		const errorMessage =
			error instanceof Error ? error.message : "An error occurred";
		return NextResponse.json({question: errorMessage}, {status: 500});
	}
};

export default handler;
