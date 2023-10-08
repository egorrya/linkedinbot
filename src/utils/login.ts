import { Page } from 'puppeteer';

/**
 * Logs into LinkedIn using the provided email and password.
 * @param {Page} page - The Puppeteer Page object.
 * @param {string} email - The LinkedIn email.
 * @param {string} password - The LinkedIn password.
 * @throws {Error} If the login fails.
 */
export const login = async (page: Page, email: string, password: string) => {
	try {
		// Navigate to the LinkedIn login page
		await page.goto('https://www.linkedin.com/login', {
			waitUntil: 'networkidle2',
		});

		// Fill in the email and password fields
		await page.type('#username', email);
		await page.type('#password', password);

		// Click the login button
		await page.click('.btn__primary--large');

		// Wait for the navigation to complete
		await page.waitForNavigation();

		// Check if the login was successful by looking for the main element with a specific aria-label.
		const loggedIn = await page.$('main[aria-label="Main Feed"]');

		if (loggedIn) console.log('Login successful');
	} catch (error) {
		// Specify the error type as Error
		// Handle any login errors and throw a custom error message
		throw new Error(`Login error: ${error}`);
	}
};
