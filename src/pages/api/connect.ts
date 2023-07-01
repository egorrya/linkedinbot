import { connectToLinkedInProfiles } from '@/utils/connectToLinkedInProfiles';
import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(
	req: NextApiRequest,
	res: NextApiResponse
) {
	const { email, password, targetProfiles } = req.body;

	let connectedProfiles: string[] = [];

	try {
		connectedProfiles = await connectToLinkedInProfiles(
			email,
			password,
			targetProfiles
		);

		res.status(200).json(connectedProfiles);
	} catch (err) {
		if (err instanceof Error) {
			// Even in case of errors, return the connected profiles that succeeded
			res.status(500).json({ error: err.message, connectedProfiles });
		} else {
			res.status(500).json({ error: 'An error occurred', connectedProfiles });
		}
	}
}
