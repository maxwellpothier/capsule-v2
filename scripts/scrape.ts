import axios from "axios";
import * as cheerio from "cheerio";

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

		const linkArr: {url: string; title: string}[] = [];

		headlines.each((_, headline) => {
			const link = $(headline).find("a");
			const title = $(link).text();
			const url = $(link).attr("href");

			if (url && url.startsWith(BASE_URL)) {
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

(async () => {
	const headlines = await getHeadlines();
	console.log(headlines);
})();
