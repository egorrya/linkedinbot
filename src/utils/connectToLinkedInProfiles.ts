import puppeteer, { ElementHandle, JSHandle } from 'puppeteer';
import { getRandomMessage } from './getRandomMessage';
import { login } from './login';
import randomDelay from './randomDelay';

export const connectToLinkedInProfiles = async (
	email: string,
	password: string,
	targetProfiles: string[],
	isMessage: boolean,
	filterOpenToWork?: boolean,
	namesToSkip?: string | string[]
) => {
	// Check if required data is missing
	if (
		!email ||
		!password ||
		!targetProfiles.length ||
		typeof isMessage !== 'boolean'
	) {
		throw new Error('Some data is missing');
	}

	const browser = await puppeteer.launch({
		headless: false,
	});
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

			await randomDelay(3, 5);

			// Filter if the profile is open to work
			if (filterOpenToWork) {
				const openToWorkElement: ElementHandle | null = await page.$(
					'.pv-open-to-carousel-card h3 strong'
				);

				let openToWorkSign: boolean = false;
				if (openToWorkElement) {
					const textContent: JSHandle = await openToWorkElement.getProperty(
						'textContent'
					);
					const text: string = (await textContent.jsonValue()) as string;
					openToWorkSign = text.includes('Open to work');
				}

				// If profile is open to work, skip it and move to the next one
				if (openToWorkSign) {
					console.log(
						`Skipping ${targetProfile} as the profile is open to work.`
					);
					result.failedProfiles.push(targetProfile); // Add to failed profiles
					continue; // Skip to the next iteration of the loop
				}
			}

			// Extract the full name
			await page.waitForSelector('.pv-text-details__left-panel h1');
			const fullName = await page.evaluate(() => {
				return document
					.querySelector('.pv-text-details__left-panel h1')
					?.textContent?.trim();
			});

			const firstName = fullName?.split(' ')[0];

			const standardizedNamesToSkip = new Set<string>();

			if (namesToSkip) {
				const namesArray = Array.isArray(namesToSkip)
					? namesToSkip
					: namesToSkip.split(',').map((name) => name.trim().toLowerCase());
				namesArray.forEach((name) => standardizedNamesToSkip.add(name));
			}

			// Check Names to Skip
			if (firstName && standardizedNamesToSkip.has(firstName.toLowerCase())) {
				console.log(
					`Skipping ${targetProfile} as the profile name is in the names to skip list.`
				);
				result.failedProfiles.push(targetProfile);
				continue;
			}

			const directConnectButtonSelector = `.pvs-profile-actions > button[aria-label="Invite ${fullName} to connect"]`;
			// Selectors for various buttons on LinkedIn profiles
			const dropdownTriggerSelector =
				'.pvs-profile-actions button[aria-label="More actions"]';
			const dropdownConnectButtonSelector =
				'.pvs-overflow-actions-dropdown__content.artdeco-dropdown__content--is-open ul li:nth-child(3)';

			// Check if the "Connect" button is directly available
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

			if (isMessage === true) {
				console.log(`Sending a message to ${targetProfile}`);

				// Add a note and a custom message
				await page.waitForSelector('button[aria-label="Add a note"]');
				await page.click('button[aria-label="Add a note"]');
				await page.waitForSelector(
					'.connect-button-send-invite__custom-message'
				);
				await page.type(
					'.connect-button-send-invite__custom-message',
					getRandomMessage(firstName)
				);
			}

			// Fetch a handle for the "Send now" button
			const sendNowButton: ElementHandle | null = await page.$(
				'button[aria-label="Send now"]'
			);

			if (sendNowButton) {
				const isDisabled: boolean = await page.evaluate(
					(button) => button.hasAttribute('disabled'),
					sendNowButton
				);

				if (!isDisabled) {
					await sendNowButton.click();
				} else {
					console.log(
						`"Send now" button is disabled for ${targetProfile}. Skipping without categorizing.`
					);
					continue; // Skip to the next iteration of the loop
				}
			} else {
				console.log(
					`"Send now" button not found for ${targetProfile}. Skipping without categorizing.`
				);
				continue; // Skip to the next iteration of the loop
			}

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
		await randomDelay(30, 100);
	}

	// Close the browser
	await browser.close();

	// Return the result and any errors encountered
	return {
		result,
		error,
		errorMessages: [],
	};
};
