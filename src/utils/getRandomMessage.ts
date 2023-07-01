// Message's name should have this structure ", {name}"
// Only with comma
const messages = [
	"Hi, {name}. My name is Egor, a Front End Developer with extensive back end tech and design experience. I am currently exploring new opportunities and aiming to enrich my professional network. I'd like to connect with you to possibly collaborating in the future.",
	"Hello, {name}. I'm Egor, a Front End Developer with experience in back end technologies and design. At present, I'm seeking new opportunities and expanding my professional circle. I'm eager to connect with you with the aim of potential future collaborations.",
	"Hey, {name}. My name is Egor, I’m a front end developer with experience in back end and design. I'm looking for the new opportunities and connecting with others to build my network. I'd like to connect with you because your expertise in recruitment could be valuable for my career.",
	"Hello, {name}. I'm Egor, a Front End Developer with a strong background in back end technologies and design. As I seek new opportunities and broaden my professional connections, I'm keen to connect with you. Your proficiency in recruitment could provide valuable insights for my career.",
	"Hi, {name}. I'm Egor, well-versed in both front end and back end development, with a flair for design. In my quest for fresh opportunities and expanding my professional network, I'm eager to link up with you. Your skill in recruitment could offer key insights as I shape my career path.",
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
