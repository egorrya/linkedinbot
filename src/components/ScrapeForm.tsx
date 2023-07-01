import { FC, useState } from 'react';

import axios from 'axios';
import CopyButton from './CopyButton';
import ProfilesTable from './ProfilesTable';

interface ScrapeFormProps {
	email: string;
	password: string;
}

const ScrapeForm: FC<ScrapeFormProps> = ({ email, password }) => {
	const [searchPageUrl, setSearchPageUrl] = useState('');
	const [profiles, setProfiles] = useState([]);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const scrape = async () => {
		setLoading(true);
		setError(null);

		try {
			const response = await axios.post('/api/scrape', {
				email,
				password,
				searchPageUrl,
			});

			setProfiles(response.data);
		} catch (error) {
			setError('Something went wrong');
		} finally {
			setLoading(false);
		}
	};

	return (
		<div>
			<input
				type='text'
				placeholder='Search page URL'
				onChange={(e) => setSearchPageUrl(e.target.value)}
			/>

			<div className='buttons'>
				<button onClick={scrape} disabled={loading || !searchPageUrl}>
					{loading ? 'Loading...' : 'Scrape'}
				</button>
				<CopyButton
					textToCopy={profiles.join('\r\n')}
					disabled={profiles.length === 0 || loading}
				/>
			</div>

			{error && <div>Error: {error}</div>}

			{profiles.length === 0 && !loading && 'There are no profiles'}

			{profiles && profiles.length > 0 && !loading && (
				<ProfilesTable profiles={profiles} />
			)}
		</div>
	);
};

export default ScrapeForm;
