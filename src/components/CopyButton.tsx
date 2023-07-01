import { FC } from 'react';

interface CopyButtonProps {
	textToCopy: string;
	disabled?: boolean;
}

const CopyButton: FC<CopyButtonProps> = ({ textToCopy, disabled = false }) => {
	const copy = async (textToCopy: string) => {
		try {
			await navigator.clipboard.writeText(textToCopy);
			await alert('Successfully added to the clipboard');
		} catch (err) {
			console.error('Failed to copy text: ', err);
		}
	};

	return (
		<button onClick={() => copy(textToCopy)} disabled={disabled}>
			Copy All
		</button>
	);
};

export default CopyButton;
