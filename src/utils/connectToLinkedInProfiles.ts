import puppeteer from 'puppeteer';
import { getRandomMessage } from './getRandomMessage';
import { login } from './login';
import randomDelay from './randomDelay';

const directConnectButtonSelector = '.pvs-profile-actions button:nth-child(1)';
const dropdownTriggerSelector =
	'.pvs-profile-actions button[aria-label="More actions"]';
const dropdownConnectButtonSelector =
	'.pvs-overflow-actions-dropdown__content.artdeco-dropdown__content--is-open ul li:nth-child(3) ';

export const connectToLinkedInProfiles = async (
	email: string,
	password: string,
	targetProfiles: string[]
) => {
	if (!email || !password || !targetProfiles.length) {
		throw new Error('Some data is missed');
	}

	const browser = await puppeteer.launch({ headless: false });
	const page = await browser.newPage();
	await page.setDefaultNavigationTimeout(125000);

	await login(page, email, password);

	let connectedProfiles: string[] = [];

	for (let targetProfile of targetProfiles) {
		try {
			// navigate to target profile
			await page.goto(targetProfile, {
				waitUntil: 'domcontentloaded',
			});

			await page.waitForSelector('.pv-text-details__left-panel h1');
			const firstName = await page
				.evaluate(() => {
					return document
						.querySelector('.pv-text-details__left-panel h1')
						?.textContent?.trim();
				})
				.then((res) => res?.split(' ')[0]);

			// check if connect button is directly available
			await page.waitForSelector(directConnectButtonSelector);
			const directConnectButton = await page.evaluate((selector) => {
				const button = document.querySelector(selector);
				const buttonText = button?.querySelector('span');

				return buttonText && buttonText.textContent?.trim() === 'Connect'
					? button
					: null;
			}, directConnectButtonSelector);

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

			await page.waitForSelector('button[aria-label="Add a note"]');
			await page.click('button[aria-label="Add a note"]');
			await page.waitForSelector('.connect-button-send-invite__custom-message');
			await page.type(
				'.connect-button-send-invite__custom-message',
				getRandomMessage(firstName)
			);

			// Send the connection request
			// await page.click('button[aria-label="Send now"]');

			// Add profile to the list of successfully connected profiles
			connectedProfiles.push(targetProfile);
		} catch (error) {
			console.log(
				`An error occurred when trying to connect to ${targetProfile}: ${error}`
			);
		}

		await randomDelay();
	}

	await browser.close();

	return connectedProfiles;
};
