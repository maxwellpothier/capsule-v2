export type Headline = {
	title: string;
	url: string;
};

export type Article = {
	headline: Headline;
	keyPoints: string[];
	content: string;
	tokens: number;
	chunks: ArticleChunk[];
};

export type ArticleChunk = {
	article_title: string;
	article_url: string;
	content: string;
	content_tokens: number;
	embedding: number[];
};

export type CNBCJSON = {
	tokens: number;
	articles: Article[];
};
