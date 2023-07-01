import axios from 'axios';
import { FC, useState } from 'react';
import CopyButton from './CopyButton';
import ProfilesTable from './ProfilesTable';

interface ConnectFormProps {
	email: string;
	password: string;
}

const ConnectForm: FC<ConnectFormProps> = ({ email, password }) => {
	const [targetProfiles, setTargetProfiles] = useState('');
	const [profiles, setProfiles] = useState([]);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const connect = async () => {
		setLoading(true);
		setError(null);

		try {
			const response = await axios.post('/api/connect', {
				email,
				password,
				targetProfiles: targetProfiles.split('\n'),
			});

			setProfiles(response.data);
		} catch (error) {
			setError('Something went wrong');
		} finally {
			setLoading(false);
		}
	};

	return (
		<>
			<textarea
				placeholder='Target profiles LinkedIn URLs'
				onChange={(e) => setTargetProfiles(e.target.value)}
			/>

			<div className='buttons'>
				<button onClick={connect} disabled={loading || !targetProfiles}>
					{loading ? 'Connecting...' : 'Connect'}
				</button>
				<CopyButton
					textToCopy={profiles.join('\r\n')}
					disabled={profiles.length === 0 && !loading}
				/>
			</div>

			{error && <p>Error: {error}</p>}

			{profiles && profiles.length > 0 && !loading && (
				<ProfilesTable profiles={profiles} />
			)}
		</>
	);
};

export default ConnectForm;
