// Message's name should have this structure ", {name}"
// Only with comma
const messages = [
	"Hi, {name}. I'm Egor, a frontend Dev with backend & design skills. I'm exploring new opportunities & wish to network. Let's connect for future collaborations!",
	"Hey, {name}. I'm Egor, a front end developer with a back end & design skills. Looking for opportunities & building connections. Let's link up!",
	"Greetings, {name}. I am Egor, a frontend wizard also skilled in backend & design. Open to fresh avenues. I'd love for us to connect",
	"Hello, {name}. It's Egor. A frontend dev who dabbles backend & design too. Keen on expanding my network. Let’s team up for future synergies",
	"Salute, {name}. I'm Egor, a front-end dev with backend & design chops. On the lookout for new ventures. Let’s bridge our networks!",
	'Hey {name}, I’m Egor. a front-end developer with a back-end & design skills. Excited to discover more avenues. Let’s connect and envision the future!',
	"Good day, {name}. I'm Egor, a front end developer with a back end & design skills. Eager to widen my circle. Let's sync up!",
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
