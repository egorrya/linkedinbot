import { connectToLinkedInProfiles } from '@/utils/connectToLinkedInProfiles';
import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(
	req: NextApiRequest,
	res: NextApiResponse
) {
	const { email, password, targetProfiles, isMessage } = req.body;

	if (
		!email ||
		!password ||
		!targetProfiles.length ||
		typeof isMessage !== 'boolean'
	) {
		res.status(400).json({ error: 'Some data is missing' });
		return;
	}

	let result = {
		connectedProfiles: [] as string[],
		failedProfiles: [] as string[],
	};

	try {
		let { result } = await connectToLinkedInProfiles(
			email,
			password,
			targetProfiles,
			isMessage
		);

		res.status(200).json(result);
	} catch (err) {
		if (err instanceof Error) {
			// Even in case of errors, return the connected profiles that succeeded
			res.status(500).json({ error: err.message, ...result });
		} else {
			res.status(500).json({ error: 'An error occurred', ...result });
		}
	}
}
