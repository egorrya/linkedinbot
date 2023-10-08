import { GoogleSpreadsheet } from 'google-spreadsheet';

const accessSheets = async (sheetId: string, sheetTitle: string) => {
	// Create a new GoogleSpreadsheet object with the provided sheetId
	const doc = new GoogleSpreadsheet(`${sheetId}`);

	try {
		// Authenticate the Google Sheets API using service account credentials
		await doc.useServiceAccountAuth({
			client_email: process.env.NEXT_PUBLIC_GOOGLE_SERVICE_ACCOUNT_EMAIL,
			private_key: process.env.NEXT_PUBLIC_GOOGLE_PRIVATE_KEY?.replace(
				/\\n/g,
				'\n'
			),
		});

		// Load information about the Google Spreadsheet
		await doc.loadInfo();

		// Access the sheet with the specified title
		const sheet = doc.sheetsByTitle[sheetTitle];

		// Log that the access is successful
		console.log(`Accessing Google Sheet - ${doc.title}. Sheet - ${sheetTitle}`);

		// Load all cell data from the sheet
		await sheet.loadCells();

		// Return an object containing the sheet and the document
		return { sheet, doc };
	} catch (error) {
		// Log an error if there's an issue accessing Google Sheets
		console.error('Error accessing Google Sheets:', error);
		return null; // Return null to indicate an error occurred
	}
};

export default accessSheets;
