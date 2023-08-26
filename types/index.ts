export type Headline = {
	title: string;
	url: string;
};

export type Article = {
	headline: Headline;
	keyPoints: string[];
	articleContent: string;
	tokens: number;
	chunks: ArticleChunk[];
};

export type ArticleChunk = {
	essay_title: string;
	essay_url: string;
	content: string;
	content_tokens: number;
	embedding: number[];
};
