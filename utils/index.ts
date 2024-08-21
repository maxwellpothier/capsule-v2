import {createClient} from "@supabase/supabase-js";

export const supabaseAdmin = createClient(
	process.env.NEXT_PUBLIC_SUPABASE_URL!,
	process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export const OpenAIStream = async (prompt: string) => {
	const response = await fetch("https://api.openai.com/v1/chat/completions", {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
			Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
		},
		body: JSON.stringify({
			model: "gpt-4o",
			messages: [
				{
					role: "system",
					content: `You are an expert in the field of economics and finance. 
					You are a helpful assistant that answers queries the current 
					state of economic conditions.
					Respond in 3-5 sentences.`,
				},
				{
					role: "user",
					content: prompt,
				},
			],
			max_tokens: 150,
			temperature: 0.0,
			// stream: true,
		}),
	});

	if (!response.ok) {
		throw new Error("OpenAI API request failed");
	}

	const json = await response.json();

	return json.choices[0].message.content;
};
