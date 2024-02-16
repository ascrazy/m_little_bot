// Credits: ChatGPT 4
export function chainOfResponsibility<T>(
	funcs: (() => Promise<T>)[],
): Promise<T> {
	return new Promise((resolve, reject) => {
		let currentIndex = 0;

		const executeNext = () => {
			if (currentIndex >= funcs.length) {
				reject(Error("All functions failed"));
				return;
			}

			const currentFunc = funcs[currentIndex];
			currentFunc()
				.then((result) => resolve(result))
				.catch(() => {
					currentIndex++;
					executeNext();
				});
		};

		executeNext();
	});
}
