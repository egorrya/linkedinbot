// Message's name should have this structure ", {name}"
// Only with comma
const messages = [
	'Hello, {name}, I hope this message finds you well. I am interested in the opportunities at your organization.',
	"Hi, {name}, I've recently come across your organization and I'm very interested in learning more about it.",
];

export const getRandomMessage = (name: string | undefined) => {
	const randomIndex = Math.floor(Math.random() * messages.length);
	const messageTemplate = messages[randomIndex];

	if (name) {
		return messageTemplate.replace('{name}', name);
	} else {
		return messageTemplate.replace(', {name}', '');
	}
};
