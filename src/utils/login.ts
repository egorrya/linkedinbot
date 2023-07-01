import { Page } from 'puppeteer';

export const login = async (page: Page, email: string, password: string) => {
	await page.goto('https://www.linkedin.com/login', {
		waitUntil: 'networkidle2',
	});
	await page.type('#username', email);
	await page.type('#password', password);
	await page.click('.btn__primary--large');
	await page.waitForNavigation();
};
