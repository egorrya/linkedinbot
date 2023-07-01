import puppeteer from 'puppeteer';
import autoScroll from './autoScroll';
import { login } from './login';
import randomDelay from './randomDelay';

export const scrapeLinkedInProfiles = async (
	email: string,
	password: string,
	searchPageUrl: string
) => {
	if (
		!searchPageUrl.startsWith('https://www.linkedin.com/search/results/people')
	) {
		throw new Error('Invalid URL. Please provide a LinkedIn search page URL.');
	}

	const url = new URL(searchPageUrl);

	// Check if the 'page' parameter exists and is more than 1. If so, set it to 1.
	if (url.searchParams.has('page')) {
		const pageNumber = Number(url.searchParams.get('page'));
		if (pageNumber > 1) {
			url.searchParams.set('page', '1');
			searchPageUrl = url.toString();
		}
	}

	try {
		const browser = await puppeteer.launch({ headless: false });
		const page = await browser.newPage();

		await login(page, email, password);

		let profiles: string[] = [];
		let hasNextPage = false;

		do {
			// go to search page
			await page.goto(searchPageUrl, { waitUntil: 'networkidle2' });

			await randomDelay(1, 5);

			// grab all profile urls
			const newProfiles = await page
				.evaluate(() => {
					const profileCards = Array.from(
						document.querySelectorAll('.entity-result__item')
					);

					const validProfiles = profileCards.filter((card) => {
						const button = card.querySelector('.artdeco-button__text');

						return (
							button &&
							button.textContent &&
							(button.textContent.includes('Connect') ||
								button.textContent.includes('Message'))
						);
					});

					return validProfiles.map((card) => {
						const link = card.querySelector(
							'.entity-result__title-text .app-aware-link'
						);
						return link ? (link as HTMLAnchorElement).href : null;
					});
				})
				.then((profileLinks) =>
					profileLinks.filter((link): link is string => link !== null)
				);

			profiles = [...profiles, ...newProfiles];

			// usage before checking next page button
			await autoScroll(page);

			hasNextPage = await page.evaluate(() => {
				const paginationNextButton = document.querySelector(
					'.artdeco-pagination__button--next'
				);

				return (
					paginationNextButton !== null &&
					!paginationNextButton.hasAttribute('disabled')
				);
			});

			if (hasNextPage) {
				// Get the current page number from the search parameters
				const url = new URL(searchPageUrl);
				let pageNumber = Number(url.searchParams.get('page')) || 1;

				// Increment the page number
				pageNumber++;

				// Update the search parameters with the new page number
				url.searchParams.set('page', String(pageNumber));
				searchPageUrl = url.toString();
			}
		} while (hasNextPage);

		await browser.close();
		return profiles.map((link) => link.split('?')[0]);
	} catch (error) {
		console.log('An error occurred:', error);
	}
};
