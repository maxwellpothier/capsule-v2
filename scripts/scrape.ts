import {Article, Headline, ArticleChunk, CNBCJSON} from "@/types";
import axios from "axios";
import * as cheerio from "cheerio";
import {encode} from "gpt-3-encoder";
import * as fs from "fs";

const BASE_URL = "https://www.cnbc.com";
const CHUNK_SIZE = 200;

const HEADLINE_CLASSNAMES = {
	featured: ".FeaturedCard-packagedCardTitle",
	appended: ".PackageItems-container",
	secondary: ".SecondaryCard-headline",
	body: ".RiverHeadline-headline",
};

const getHeadlines = async (): Promise<Headline[]> => {
	const html = await axios.get(BASE_URL);
	const $ = cheerio.load(html.data);

	const generateHeadlineObject = (className: string) => {
		const headlines = $(className);

		const linkArr: Headline[] = [];

		headlines.each((_, headline) => {
			const link = $(headline).find("a");
			const title = $(link).text();
			const url = $(link).attr("href");

			if (url) {
				linkArr.push({
					url,
					title,
				});
			}
		});

		return linkArr;
	};

	return Object.values(HEADLINE_CLASSNAMES)
		.map(className => {
			return generateHeadlineObject(className);
		})
		.flat();
};

const getArticle = async (headline: Headline): Promise<Article> => {
	if (!headline.url.startsWith(BASE_URL)) {
		return {
			headline,
			keyPoints: [],
			content: "",
			tokens: 0,
			chunks: [],
		};
	}

	const html = await axios.get(headline.url);
	const $ = cheerio.load(html.data);

	const getKeyPoints = () => {
		const keyPoints: string[] = [];

		const keyPointsSection = $(".RenderKeyPoints-list");
		const pointsAsHtml = $(keyPointsSection).find("li");
		pointsAsHtml.each((_, point) => {
			keyPoints.push($(point).text());
		});

		return keyPoints;
	};

	const paragraphs: string[] = [];

	const articleBody = $(".ArticleBody-articleBody");
	const textGroups = $(articleBody).find(".group");

	textGroups.each((_, group) => {
		const paragraphsInGroup = $(group).find("p");
		paragraphsInGroup.each((_, paragraph) => {
			paragraphs.push($(paragraph).text());
		});
	});

	const articleContent = paragraphs.join(" ");

	const article: Article = {
		headline,
		keyPoints: getKeyPoints(),
		content: articleContent,
		tokens: encode(articleContent).length,
		chunks: [],
	};

	return article;
};

const getArticleChunks = async (article: Article): Promise<Article> => {
	const {headline, keyPoints, content, tokens, chunks} = article;

	const articleTextChunks: string[] = [];

	if (encode(content).length <= CHUNK_SIZE) {
		articleTextChunks.push(content.trim());
	} else {
		const split = content.split(". ");
		let currentChunk = "";

		for (let i = 0; i < split.length; i++) {
			const sentence = split[i];
			const sentenceTokens = encode(sentence).length;

			if (currentChunk.length + sentenceTokens > CHUNK_SIZE) {
				articleTextChunks.push(currentChunk.trim());
				currentChunk = "";
			}

			if (sentence[sentence.length - 1].match(/[a-z0-9]/i)) {
				currentChunk += sentence + ". ";
			} else {
				currentChunk += sentence + " ";
			}
		}

		articleTextChunks.push(currentChunk.trim());
	}

	const articleChunks: ArticleChunk[] = articleTextChunks.map(chunk => {
		return {
			article_title: headline.title,
			article_url: headline.url,
			content: chunk,
			content_tokens: encode(chunk).length,
			embedding: [],
		};
	});

	const keyPointsChunk = keyPoints.join(" ");
	const keyPointsChunkTokens = encode(keyPointsChunk).length;

	if (keyPointsChunkTokens < CHUNK_SIZE) {
		articleChunks.push({
			article_title: headline.title,
			article_url: headline.url,
			content: keyPointsChunk,
			content_tokens: keyPointsChunkTokens,
			embedding: [],
		});
	}

	if (articleChunks.length > 1) {
		for (let i = 0; i < articleChunks.length; i++) {
			const chunk = articleChunks[i];
			const prevChunk = articleChunks[i - 1];

			if (chunk.content_tokens < 100 && prevChunk) {
				prevChunk.content += chunk.content;
				prevChunk.content_tokens = encode(prevChunk.content).length;
				articleChunks.splice(i, 1);
			}
		}
	}

	return {
		...article,
		chunks: articleChunks,
	};
};

(async () => {
	const headlines = await getHeadlines();
	const articles = (
		await Promise.all(
			headlines.map(async headline => await getArticle(headline))
		)
	).filter(article => article.content !== "");

	const fullArticles: Article[] = [];

	await articles.forEach(async article => {
		const chunkedArticle = await getArticleChunks(article);
		fullArticles.push(chunkedArticle);
	});

	const json: CNBCJSON = {
		tokens: articles.reduce((acc, article) => acc + article.tokens, 0),
		articles: fullArticles,
	};

	const filePath = "scripts/cnbc.json";

	fs.writeFileSync(filePath, "");
	fs.writeFileSync(filePath, JSON.stringify(json, null, 2));

	console.log("Data has been written to scripts/cnbc.json");
})();
