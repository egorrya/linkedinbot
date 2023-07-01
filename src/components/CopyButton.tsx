import { FC } from 'react';

interface CopyButtonProps {
	textToCopy: string;
	disabled?: boolean;
}

const CopyButton: FC<CopyButtonProps> = ({ textToCopy, disabled = false }) => {
	const copy = (textToCopy: string) => {
		try {
			navigator.clipboard.writeText(textToCopy);
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
