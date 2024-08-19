import {loadEnvConfig} from "@next/env";
import {Article, CNBCJSON} from "@/types";
import OpenAI from "openai";
import {createClient} from "@supabase/supabase-js";
import fs from "fs";
import {SupabaseAuthClient} from "@supabase/supabase-js/dist/module/lib/SupabaseAuthClient";

loadEnvConfig("");

const generateEmbeddings = async (essays: Article[]) => {
	const openai = new OpenAI({apiKey: process.env.OPENAI_API_KEY});
	const supabase = createClient(
		process.env.NEXT_PUBLIC_SUPABASE_URL!,
		process.env.SUPABASE_SERVICE_ROLE_KEY!
	);

	for (let i = 0; i < essays.length; i++) {
		const {chunks} = essays[i];

		for (let j = 0; j < chunks.length; j++) {
			const chunk = chunks[j];

			const embeddingResponse = await openai.embeddings.create({
				model: "text-embedding-3-small",
				input: chunk.content,
			});

			const [{embedding}] = embeddingResponse.data;

			const {data, error} = await supabase.from("capsule").insert({
				article_title: chunk.article_title,
				article_url: chunk.article_url,
				content: chunk.content,
				content_tokens: chunk.content_tokens,
				embedding,
			});

			if (error) {
				console.log(error);
			} else {
				console.log("saved", i, j);
			}

			await new Promise(resolve => setTimeout(resolve, 300));
		}
	}

	// essays.forEach(async (essay, i) => {
	// 	const {chunks} = essay;

	// 	chunks.forEach(async (chunk, j) => {
	// 		const embeddingResponse = await openai.embeddings.create({
	// 			model: "text-embedding-3-small",
	// 			input: chunk.content,
	// 		});

	// 		const [{embedding}] = embeddingResponse.data;

	// 		const {data, error} = await supabase.from("capsule").insert({
	// 			article_title: chunk.article_title,
	// 			article_url: chunk.article_url,
	// 			content: chunk.content,
	// 			content_tokens: chunk.content_tokens,
	// 			embedding,
	// 		});

	// 		if (error) {
	// 			console.log(error);
	// 		} else {
	// 			console.log("saved", i, j);
	// 		}

	// 		await new Promise(resolve => setTimeout(resolve, 300));
	// 	});
	// });
};

(async () => {
	const json = await fs.readFileSync("scripts/cnbc.json", "utf-8");
	const cnbcJson: CNBCJSON = JSON.parse(json);

	await generateEmbeddings(cnbcJson.articles);
})();
