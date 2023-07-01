import { FC } from 'react';

interface ProfilesTableProps {
	profiles: string[];
}

const ProfilesTable: FC<ProfilesTableProps> = ({ profiles }) => {
	return (
		<table>
			<thead>
				<tr>
					<th>Profile URLs</th>
				</tr>
			</thead>
			<tbody>
				{profiles.map((profile, index) => (
					<tr key={index}>
						<td>{profile}</td>
					</tr>
				))}
			</tbody>
		</table>
	);
};

export default ProfilesTable;
