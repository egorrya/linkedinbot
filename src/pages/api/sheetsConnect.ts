import accessSheets from '@/utils/accessSheets';
import { connectToLinkedInProfiles } from '@/utils/connectToLinkedInProfiles';
import extractSpreadsheetId from '@/utils/extractSpreadsheetId';
import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(
	req: NextApiRequest,
	res: NextApiResponse
) {
	// Get query parameters
	const email = String(req.query.email);
	const password = String(req.query.password);
	const sheetTitle = String(req.query.sheetTitle);
	const sheetLink = String(req.query.sheetLink);
	const numberOfTargetProfiles = Number(req.query.numberOfTargetProfiles);
	const filterOpenToWork = Boolean(req.query.filterOpenToWork);
	const namesToSkip = String(req.query.namesToSkip);

	// Check if required parameters are missing or empty
	if (
		!email ||
		!password ||
		!sheetTitle ||
		!sheetLink ||
		!numberOfTargetProfiles
	) {
		return res
			.status(400)
			.json({ error: 'Required parameters are missing or empty' });
	}

	// Check if the number of target profiles is within the allowed range
	if (numberOfTargetProfiles > 50 || numberOfTargetProfiles < 1) {
		return res.status(500).json({
			error: 'Number of target profiles should be between 1 and 50',
		});
	}

	// Extract the sheet ID from the sheet link
	const sheetId = extractSpreadsheetId(sheetLink as string);

	// Access the Google Sheets
	const sheetsData = await accessSheets(
		sheetId as string,
		sheetTitle as string
	);

	// Array to store target profiles with their links and row numbers
	let targetProfiles: { link: string; row: number }[] = [];

	if (sheetsData) {
		const { sheet } = sheetsData;

		const rows = await sheet.getRows();

		// Iterate through the rows in the sheet
		for (
			let i = 0;
			i < rows.length && targetProfiles.length < numberOfTargetProfiles;
			i++
		) {
			const link = rows[i].Link as string;
			const rowNumber = rows[i]._rowNumber as number;
			const sentStatus = rows[i].Sent as string;
			const errorStatus = rows[i].Error as string;

			// If the profile is not already connected or has no error, add it to the targetProfiles array
			if (link && sentStatus === 'FALSE' && errorStatus === 'FALSE') {
				targetProfiles.push({ link, row: rowNumber });
			}
		}

		// If there are no target profiles to connect to, return an error
		if (targetProfiles.length === 0) {
			return res.status(500).json({ error: 'No profiles to connect to' });
		}
	}

	// Connect to LinkedIn profiles
	let { result, error } = await connectToLinkedInProfiles(
		email,
		password,
		targetProfiles.map((profile) => profile.link),
		filterOpenToWork,
		namesToSkip
	);

	// If there was an error during LinkedIn connections, return the error
	if (error) {
		res.status(500).json({ error });
	}

	// Update the Google Sheet with connection results
	if (sheetsData) {
		const { sheet } = sheetsData;

		for (const profile of targetProfiles) {
			if (result.connectedProfiles.includes(profile.link)) {
				// Update the Sent column to 'TRUE' for successfully connected profiles
				sheet.getCellByA1(`B${profile.row}`).value = '=TRUE';
			}

			if (result.failedProfiles.includes(profile.link)) {
				// Update the Error column to TRUE for profiles that failed to connect
				sheet.getCellByA1(`C${profile.row}`).value = '=TRUE';
			}
		}

		// Save the changes to the Google Sheet
		await sheet.saveUpdatedCells();
	}

	// Return the result
	console.log('Success!');
	return res.status(200).json(result);
}
