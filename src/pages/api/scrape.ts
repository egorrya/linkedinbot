import { scrapeLinkedInProfiles } from '@/utils/scrapeLinkedInProfiles';
import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(
	req: NextApiRequest,
	res: NextApiResponse
) {
	const { email, password, searchPageUrl } = req.body;

	try {
		const newProfiles = await scrapeLinkedInProfiles(
			email,
			password,
			searchPageUrl
		);

		res.status(200).json(newProfiles);
	} catch (err) {
		if (err instanceof Error) {
			res.status(500).json({ error: err.message });
		} else {
			res.status(500).json({ error: 'An error occurred' });
		}
	}
}
