import {Article, Headline} from "@/types";
import axios from "axios";
import * as cheerio from "cheerio";
import {encode} from "gpt-3-encoder";

const BASE_URL = "https://www.cnbc.com";

const HEADLINE_CLASSNAMES = {
	featured: ".FeaturedCard-packagedCardTitle",
	appended: ".PackageItems-container",
	secondary: ".SecondaryCard-headline",
	body: ".RiverHeadline-headline",
};

const getHeadlines = async () => {
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

const getArticle = async (headline: Headline) => {
	if (!headline.url.startsWith(BASE_URL)) {
		return {
			headline,
			keyPoints: [],
			articleContent: "",
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
		articleContent,
		tokens: encode(articleContent).length,
		chunks: [],
	};

	return article;
};

(async () => {
	const headlines = await getHeadlines();
	const articles = await Promise.all(
		headlines.map(async headline => await getArticle(headline))
	);
	console.log(articles);
})();
