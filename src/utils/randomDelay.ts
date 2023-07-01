const randomDelay = (from: number = 30, until: number = 120): Promise<void> => {
	return new Promise((resolve) => {
		const delay = Math.floor(Math.random() * (until - from + 1)) + from;
		setTimeout(resolve, delay * 1000);
	});
};

export default randomDelay;
