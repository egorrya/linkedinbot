const extractSpreadsheetId = (url: string) => {
	// Define a regular expression pattern to match the spreadsheet ID
	const pattern = /\/d\/([a-zA-Z0-9-_]+)/;

	// Use the RegExp.exec method to find matches in the URL
	const matches = pattern.exec(url);

	// Check if there is a match and return the captured ID or null if no match
	if (matches && matches.length > 1) {
		return matches[1];
	} else {
		return null;
	}
};

export default extractSpreadsheetId;
