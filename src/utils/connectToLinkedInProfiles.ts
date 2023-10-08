import puppeteer from 'puppeteer';
import { getRandomMessage } from './getRandomMessage';
import { login } from './login';
import randomDelay from './randomDelay';

// Selectors for various buttons on LinkedIn profiles
const directConnectButtonSelector = '.pvs-profile-actions button:nth-child(1)';
const dropdownTriggerSelector =
	'.pvs-profile-actions button[aria-label="More actions"]';
const dropdownConnectButtonSelector =
	'.pvs-overflow-actions-dropdown__content.artdeco-dropdown__content--is-open ul li:nth-child(3)';

export const connectToLinkedInProfiles = async (
	email: string,
	password: string,
	targetProfiles: string[]
) => {
	// Check if required data is missing
	if (!email || !password || !targetProfiles.length) {
		throw new Error('Some data is missing');
	}

	// Launch a headless Chromium browser
	const browser = await puppeteer.launch({ headless: true });
	const page = await browser.newPage();
	await page.setDefaultNavigationTimeout(125000);

	// Initialize result and error objects
	const result = {
		connectedProfiles: [] as string[],
		failedProfiles: [] as string[],
	};
	let error = null;

	try {
		// Attempt to log in to LinkedIn
		await login(page, email, password);
	} catch (loginError) {
		console.error(`Login failed: ${loginError}`);
		error = loginError;
		await browser.close();
		return { result, error };
	}

	// Loop through the target LinkedIn profiles
	for (let targetProfile of targetProfiles) {
		try {
			// Navigate to the target LinkedIn profile
			await page.goto(targetProfile, {
				waitUntil: 'domcontentloaded',
			});

			// Extract the first name from the profile
			await page.waitForSelector('.pv-text-details__left-panel h1');
			const firstName = await page
				.evaluate(() => {
					return document
						.querySelector('.pv-text-details__left-panel h1')
						?.textContent?.trim();
				})
				.then((res) => res?.split(' ')[0]);

			// Check if the "Connect" button is directly available
			await page.waitForSelector(directConnectButtonSelector);
			const directConnectButton = await page.evaluate((selector) => {
				const button = document.querySelector(selector);
				const buttonText = button?.querySelector('span');

				return buttonText && buttonText.textContent?.trim() === 'Connect'
					? button
					: null;
			}, directConnectButtonSelector);

			// Click the "Connect" button (either direct or from dropdown)
			if (directConnectButton) {
				await page.click(directConnectButtonSelector);
			} else {
				await page.waitForSelector(dropdownTriggerSelector);
				if (!dropdownTriggerSelector)
					throw new Error(
						`Failed to find the dropdown trigger. Failed to connect to ${targetProfile}`
					);
				await page.click(dropdownTriggerSelector);

				await page.waitForSelector(dropdownConnectButtonSelector);
				const dropdownConnectButton = await page.evaluate((selector) => {
					const button = document.querySelector(selector);
					const buttonText = button?.querySelector(
						'.artdeco-dropdown__item span'
					);

					return buttonText && buttonText.textContent?.trim() === 'Connect'
						? button
						: null;
				}, dropdownConnectButtonSelector);

				if (dropdownConnectButton) {
					await page.waitForSelector(dropdownConnectButtonSelector);
					await page.click(dropdownConnectButtonSelector);
				} else {
					throw new Error(
						`Failed to find the dropdown connect button. Failed to connect to ${targetProfile}`
					);
				}
			}

			// Add a note and a custom message
			await page.waitForSelector('button[aria-label="Add a note"]');
			await page.click('button[aria-label="Add a note"]');
			await page.waitForSelector('.connect-button-send-invite__custom-message');
			await page.type(
				'.connect-button-send-invite__custom-message',
				getRandomMessage(firstName)
			);

			// Send the connection request
			// await page.click('button[aria-label="Send now"]');

			// Add the profile to the list of successfully connected profiles
			result.connectedProfiles.push(targetProfile);
		} catch (profileError) {
			console.log(
				`An error occurred when trying to connect to ${targetProfile}: ${profileError}`
			);
			// Add the profile to the list of failed profiles
			result.failedProfiles.push(targetProfile);
		}

		// Introduce a random delay before the next profile
		await randomDelay(30, 120);
	}

	// Close the browser
	await browser.close();

	// Return the result and any errors encountered
	return { result, error };
};
